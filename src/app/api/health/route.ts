import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { logger } from '@/libs/Logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ServiceStatus = 'up' | 'down';
type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

interface HealthCheckResponse {
  status: HealthStatus;
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: {
      status: ServiceStatus;
      responseTime?: number;
      error?: string;
    };
    auth: {
      status: ServiceStatus;
      configured: boolean;
    };
    stripe: {
      status: 'configured' | 'not_configured';
      hasWebhookSecret: boolean;
    };
  };
}

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the application and its dependencies
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Application is healthy
 *       503:
 *         description: Application is unhealthy
 */
export async function GET() {
  const startTime = Date.now();
  const checks: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    services: {
      database: {
        status: 'down',
      },
      auth: {
        status: 'down',
        configured: false,
      },
      stripe: {
        status: 'not_configured',
        hasWebhookSecret: false,
      },
    },
  };

  // Check database connectivity
  try {
    const dbStart = Date.now();
    await db.execute(sql`SELECT 1`);
    const dbEnd = Date.now();
    checks.services.database = {
      status: 'up',
      responseTime: dbEnd - dbStart,
    };
  } catch (error) {
    checks.services.database = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
    checks.status = 'unhealthy';
    logger.error('Health check: Database is down', { error });
  }

  // Check auth configuration
  try {
    const hasAuthSecret = Boolean(Env.AUTH_SECRET);
    const hasGithubOAuth = Boolean(Env.GITHUB_CLIENT_ID && Env.GITHUB_CLIENT_SECRET);
    const hasGoogleOAuth = Boolean(Env.GOOGLE_CLIENT_ID && Env.GOOGLE_CLIENT_SECRET);

    checks.services.auth = {
      status: hasAuthSecret ? 'up' : 'down',
      configured: hasAuthSecret && (hasGithubOAuth || hasGoogleOAuth),
    };

    if (!hasAuthSecret) {
      checks.status = checks.status === 'unhealthy' ? 'unhealthy' : 'degraded';
    }
  } catch (error) {
    checks.services.auth = {
      status: 'down',
      configured: false,
    };
    checks.status = 'degraded';
    logger.error('Health check: Auth check failed', { error });
  }

  // Check Stripe configuration
  try {
    const hasStripeKey = Boolean(Env.STRIPE_SECRET_KEY);
    const hasWebhookSecret = Boolean(Env.STRIPE_WEBHOOK_SECRET);

    checks.services.stripe = {
      status: hasStripeKey ? 'configured' : 'not_configured',
      hasWebhookSecret,
    };
  } catch (error) {
    logger.error('Health check: Stripe check failed', { error });
  }

  const responseTime = Date.now() - startTime;
  const statusCode = checks.status === 'unhealthy' ? 503 : 200;

  return NextResponse.json(checks, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Response-Time': `${responseTime}ms`,
    },
  });
}
