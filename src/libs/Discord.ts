import { Env } from './Env';
import { logger } from './Logger';

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: DiscordEmbedField[];
  timestamp?: string;
  footer?: {
    text: string;
    icon_url?: string;
  };
  author?: {
    name: string;
    icon_url?: string;
  };
}

export interface DiscordWebhookPayload {
  content?: string;
  username?: string;
  avatar_url?: string;
  embeds?: DiscordEmbed[];
}

/**
 * Discord color codes
 */
export const DiscordColors = {
  SUCCESS: 0x00FF00, // Green
  WARNING: 0xFFFF00, // Yellow
  ERROR: 0xFF0000, // Red
  INFO: 0x0099FF, // Blue
  DEFAULT: 0x7289DA, // Discord blurple
} as const;

/**
 * Sends a message to Discord via webhook
 * @param payload The Discord webhook payload
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function sendDiscordMessage(payload: DiscordWebhookPayload): Promise<boolean> {
  if (!Env.DISCORD_WEBHOOK_URL) {
    logger.warn('Discord webhook URL not configured, skipping message');
    return false;
  }

  try {
    const response = await fetch(Env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Failed to send Discord message', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      return false;
    }

    logger.info('Discord message sent successfully');
    return true;
  } catch (error) {
    logger.error('Error sending Discord message', { error });
    return false;
  }
}

/**
 * Sends a simple text message to Discord
 * @param message The text message to send
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function sendDiscordTextMessage(message: string): Promise<boolean> {
  return sendDiscordMessage({ content: message });
}

/**
 * Sends an embed message to Discord
 * @param embed The embed to send
 * @param content Optional text content to include with the embed
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function sendDiscordEmbed(
  embed: DiscordEmbed,
  content?: string,
): Promise<boolean> {
  return sendDiscordMessage({
    content,
    embeds: [embed],
  });
}

/**
 * Creates a formatted health report embed
 * @param healthData Health check data
 * @returns Discord embed object
 */
export function createHealthReportEmbed(healthData: {
  status: string;
  timestamp: string;
  version: string;
  uptime: number;
  services: Record<string, unknown>;
}): DiscordEmbed {
  const statusColor
    = healthData.status === 'healthy'
      ? DiscordColors.SUCCESS
      : healthData.status === 'degraded'
        ? DiscordColors.WARNING
        : DiscordColors.ERROR;

  const fields: DiscordEmbedField[] = [
    {
      name: '📊 Status',
      value: healthData.status.toUpperCase(),
      inline: true,
    },
    {
      name: '🔢 Version',
      value: healthData.version,
      inline: true,
    },
    {
      name: '⏱️ Uptime',
      value: formatUptime(healthData.uptime),
      inline: true,
    },
  ];

  // Add service status
  if (healthData.services) {
    Object.entries(healthData.services).forEach(([serviceName, serviceData]) => {
      const service = serviceData as Record<string, unknown>;
      const status = service.status as string;
      const emoji = status === 'up' || status === 'configured' ? '✅' : '❌';

      let value = `${emoji} ${status}`;
      if (service.responseTime) {
        value += ` (${service.responseTime}ms)`;
      }

      fields.push({
        name: `${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)}`,
        value,
        inline: true,
      });
    });
  }

  return {
    title: '🏥 Application Health Report',
    color: statusColor,
    fields,
    timestamp: healthData.timestamp,
    footer: {
      text: 'Next.js Boilerplate',
    },
  };
}

/**
 * Formats uptime in seconds to a human-readable string
 * @param seconds Uptime in seconds
 * @returns Formatted uptime string
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0)
    parts.push(`${days}d`);
  if (hours > 0)
    parts.push(`${hours}h`);
  if (minutes > 0)
    parts.push(`${minutes}m`);

  return parts.join(' ') || '< 1m';
}
