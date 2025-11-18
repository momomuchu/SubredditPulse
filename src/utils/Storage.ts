/**
 * S3-Compatible Storage Module
 *
 * This module provides S3-compatible storage functionality with AWS Signature Version 4 signing.
 * It supports multiple providers including:
 * - Cloudflare R2 (recommended for cost-effective storage)
 * - AWS S3
 * - MinIO
 * - Any S3-compatible storage service
 *
 * Configuration:
 * Set the following environment variables:
 *
 * Required:
 * - STORAGE_BUCKET_NAME: Bucket name
 * - STORAGE_ACCESS_KEY_ID: Access key ID
 * - STORAGE_SECRET_ACCESS_KEY: Secret access key
 * - STORAGE_PUBLIC_BASE_URL: Public URL for accessing stored files
 *
 * Optional:
 * - STORAGE_REGION: Region (default: 'auto' for R2, 'us-east-1' for S3)
 * - STORAGE_ENDPOINT: Custom endpoint URL
 * - STORAGE_FORCE_PATH_STYLE: Use path-style URLs (required for R2, set to 'true')
 * - STORAGE_SESSION_TOKEN: For temporary AWS credentials
 *
 * For Cloudflare R2 setup:
 * 1. Create an R2 bucket in your Cloudflare dashboard
 * 2. Generate API tokens (Access Key ID and Secret Access Key)
 * 3. Set STORAGE_ENDPOINT to: https://<account-id>.r2.cloudflarestorage.com
 * 4. Set STORAGE_FORCE_PATH_STYLE to: true
 * 5. Set STORAGE_REGION to: auto
 * 6. Set STORAGE_PUBLIC_BASE_URL to your R2 public URL or custom domain
 *
 * See: https://developers.cloudflare.com/r2/api/s3/api/
 */
import type { ReadableStream as WebReadableStream } from 'node:stream/web';
import { Buffer } from 'node:buffer';
import { createHash, createHmac } from 'node:crypto';
import { Readable } from 'node:stream';

export type StorageUploadBody = ArrayBuffer | Buffer | Uint8Array | string | Blob | NodeJS.ReadableStream | Readable | WebReadableStream<Uint8Array>;

export type StorageUploadOptions = {
  key: string;
  body: StorageUploadBody;
  contentType?: string;
  cacheControl?: string;
  metadata?: Record<string, string>;
};

export type StorageUploadResult = {
  key: string;
  url: string;
  etag?: string | null;
};

type StorageConfig = {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  endpoint: string;
  publicBaseUrl: string;
  forcePathStyle: boolean;
};

let cachedConfig: StorageConfig | null = null;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required storage environment variable: ${name}`);
  }
  return value;
}

function getStorageConfig(): StorageConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const bucket = requireEnv('STORAGE_BUCKET_NAME');
  const accessKeyId = requireEnv('STORAGE_ACCESS_KEY_ID');
  const secretAccessKey = requireEnv('STORAGE_SECRET_ACCESS_KEY');
  const publicBaseUrl = requireEnv('STORAGE_PUBLIC_BASE_URL');

  // Region defaults to 'auto' for Cloudflare R2, or 'us-east-1' for AWS S3
  const region = process.env.STORAGE_REGION || 'auto';

  // For Cloudflare R2, set STORAGE_ENDPOINT to: https://<account-id>.r2.cloudflarestorage.com
  // For AWS S3, leave empty to use default: https://s3.<region>.amazonaws.com
  const endpoint = process.env.STORAGE_ENDPOINT
    || `https://s3.${region}.amazonaws.com`;
  const sessionToken = process.env.STORAGE_SESSION_TOKEN;

  // Cloudflare R2 requires path-style URLs (set STORAGE_FORCE_PATH_STYLE=true)
  // AWS S3 supports both path-style and virtual-hosted-style URLs
  const forcePathStyle = process.env.STORAGE_FORCE_PATH_STYLE === 'true';

  cachedConfig = {
    bucket,
    region,
    accessKeyId,
    secretAccessKey,
    sessionToken,
    endpoint,
    publicBaseUrl,
    forcePathStyle,
  } satisfies StorageConfig;

  return cachedConfig;
}

function encodePathSegments(path: string): string {
  return path
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');
}

function combinePath(basePath: string, addition: string): string {
  const sanitizedBase = basePath === '/' ? '' : basePath.replace(/\/+$/, '');
  const sanitizedAddition = addition.replace(/^\/+/, '');
  const combined = [sanitizedBase, sanitizedAddition]
    .filter(Boolean)
    .join('/');
  const normalized = combined ? `/${combined}` : '/';
  return normalized.replace(/\/+/g, '/');
}

async function collectBody(
  body: StorageUploadBody,
): Promise<{ data: Buffer; hash: string }> {
  let buffer: Buffer;

  if (typeof body === 'string') {
    buffer = Buffer.from(body);
  } else if (Buffer.isBuffer(body)) {
    buffer = body;
  } else if (body instanceof ArrayBuffer) {
    buffer = Buffer.from(body);
  } else if (ArrayBuffer.isView(body)) {
    buffer = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
  } else if (typeof Blob !== 'undefined' && body instanceof Blob) {
    const arrayBuffer = await body.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } else if (body instanceof Readable) {
    const chunks: Buffer[] = [];
    for await (const chunk of body) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    buffer = Buffer.concat(chunks);
  } else if (
    typeof (body as NodeJS.ReadableStream)?.pipe === 'function'
  ) {
    const nodeStream = body as NodeJS.ReadableStream;
    const chunks: Buffer[] = [];
    for await (const chunk of nodeStream as AsyncIterable<Buffer | string>) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    buffer = Buffer.concat(chunks);
  } else if (typeof (body as WebReadableStream)?.getReader === 'function') {
    const reader = (body as WebReadableStream<Uint8Array>).getReader();
    const chunks: Buffer[] = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      if (value) {
        chunks.push(Buffer.from(value));
      }
    }
    buffer = Buffer.concat(chunks);
  } else {
    throw new TypeError('Unsupported storage upload body type');
  }

  const hash = createHash('sha256').update(buffer).digest('hex');

  return { data: buffer, hash };
}

function getSignatureKey(
  key: string,
  dateStamp: string,
  regionName: string,
  serviceName: string,
) {
  const kDate = createHmac('sha256', `AWS4${key}`).update(dateStamp).digest();
  const kRegion = createHmac('sha256', kDate).update(regionName).digest();
  const kService = createHmac('sha256', kRegion).update(serviceName).digest();
  const kSigning = createHmac('sha256', kService).update('aws4_request').digest();
  return kSigning;
}

function buildRequestUrl(
  config: StorageConfig,
  key: string,
): { url: URL; canonicalUri: string; hostHeader: string } {
  const sanitizedKey = key.replace(/^\/+/, '');
  const endpointUrl = new URL(config.endpoint);
  const encodedKey = encodePathSegments(sanitizedKey);
  const basePath = endpointUrl.pathname || '/';

  if (config.forcePathStyle) {
    const url = new URL(endpointUrl.toString());
    url.pathname = combinePath(basePath, `${config.bucket}/${sanitizedKey}`);
    return {
      url,
      canonicalUri: combinePath(basePath, `${config.bucket}/${encodedKey}`),
      hostHeader: url.host,
    };
  }

  const url = new URL(endpointUrl.toString());
  url.pathname = combinePath(basePath, sanitizedKey);
  url.hostname = `${config.bucket}.${endpointUrl.hostname}`;
  return {
    url,
    canonicalUri: combinePath(basePath, encodedKey),
    hostHeader: url.host,
  };
}

function canonicalQueryString(url: URL): string {
  const entries: string[] = [];
  url.searchParams.sort();
  url.searchParams.forEach((value, key) => {
    entries.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  });
  return entries.join('&');
}

export function getPublicUrl(key: string): string {
  const config = getStorageConfig();
  const sanitizedKey = key.replace(/^\/+/, '');
  return `${config.publicBaseUrl.replace(/\/+$/, '')}/${sanitizedKey}`;
}

export async function uploadToStorage(
  options: StorageUploadOptions,
): Promise<StorageUploadResult> {
  const config = getStorageConfig();
  const { data, hash } = await collectBody(options.body);
  const { url, canonicalUri, hostHeader } = buildRequestUrl(config, options.key);

  const now = new Date();
  const amzDate = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const dateStamp = amzDate.slice(0, 8);

  const headers: Record<string, string> = {
    'host': hostHeader,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': hash,
    'content-length': String(data.byteLength),
  };

  if (options.contentType) {
    headers['content-type'] = options.contentType;
  }

  if (options.cacheControl) {
    headers['cache-control'] = options.cacheControl;
  }

  if (options.metadata) {
    for (const [metaKey, metaValue] of Object.entries(options.metadata)) {
      headers[`x-amz-meta-${metaKey.toLowerCase()}`] = metaValue;
    }
  }

  if (config.sessionToken) {
    headers['x-amz-security-token'] = config.sessionToken;
  }

  const sortedHeaderKeys = Object.keys(headers)
    .map(key => key.toLowerCase())
    .sort();

  const canonicalHeaders = sortedHeaderKeys
    .map(key => `${key}:${headers[key]}`)
    .join('\n');

  const signedHeaders = sortedHeaderKeys.join(';');
  const canonicalQuery = canonicalQueryString(url);
  const canonicalRequest = [
    'PUT',
    canonicalUri,
    canonicalQuery,
    `${canonicalHeaders}\n`,
    signedHeaders,
    hash,
  ].join('\n');

  const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    createHash('sha256').update(canonicalRequest).digest('hex'),
  ].join('\n');

  const signingKey = getSignatureKey(
    config.secretAccessKey,
    dateStamp,
    config.region,
    's3',
  );
  const signature = createHmac('sha256', signingKey)
    .update(stringToSign)
    .digest('hex');

  const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  headers.authorization = authorizationHeader;

  const response = await fetch(url.toString(), {
    method: 'PUT',
    headers,
    body: new Uint8Array(data.buffer, data.byteOffset, data.byteLength) as unknown as BodyInit,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${errorText}`,
    );
  }

  return {
    key: options.key.replace(/^\/+/, ''),
    url: getPublicUrl(options.key),
    etag: response.headers.get('etag'),
  };
}

export function resetStorageConfigCache() {
  cachedConfig = null;
}
