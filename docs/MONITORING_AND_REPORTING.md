# Monitoring and Reporting

This document describes the monitoring and reporting features available in the Next.js Boilerplate.

## Table of Contents

- [API Documentation (Swagger)](#api-documentation-swagger)
- [Health Check Endpoint](#health-check-endpoint)
- [Discord Integration](#discord-integration)
- [Daily Reports](#daily-reports)
- [Setting Up Cron Jobs](#setting-up-cron-jobs)

## API Documentation (Swagger)

The boilerplate includes OpenAPI/Swagger documentation for all API endpoints.

### Accessing the Documentation

Visit the following URL to view the interactive API documentation:

```
http://localhost:3000/api-docs
```

In production, replace `localhost:3000` with your domain.

### Getting the OpenAPI Specification

You can also retrieve the raw OpenAPI specification in JSON format:

```
GET /api/docs
```

### Customizing the Documentation

To modify the API documentation, edit the Swagger specification in:

```
src/libs/Swagger.ts
```

## Health Check Endpoint

The health check endpoint provides real-time status of your application and its dependencies.

### Endpoint

```
GET /api/health
```

### Response

The endpoint returns a JSON object with the following structure:

```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T12:00:00.000Z",
  "version": "1.0.0",
  "uptime": 3600,
  "services": {
    "database": {
      "status": "up",
      "responseTime": 5
    },
    "auth": {
      "status": "up",
      "configured": true
    },
    "stripe": {
      "status": "configured",
      "hasWebhookSecret": true
    }
  }
}
```

### Status Levels

- **healthy**: All services are operational
- **degraded**: Some non-critical services are down
- **unhealthy**: Critical services are down (returns HTTP 503)

### Use Cases

1. **Uptime Monitoring**: Use with services like UptimeRobot, Pingdom, or Checkly
2. **Load Balancer Health Checks**: Configure your load balancer to use this endpoint
3. **Kubernetes/Docker Health Probes**: Use for liveness and readiness probes

### Example with curl

```bash
curl -X GET http://localhost:3000/api/health
```

## Discord Integration

The boilerplate includes a Discord webhook integration for sending notifications and reports.

### Setting Up Discord Webhook

1. Create a Discord webhook in your server:
   - Go to Server Settings → Integrations → Webhooks
   - Click "New Webhook"
   - Name it (e.g., "App Monitoring")
   - Copy the webhook URL

2. Add the webhook URL to your environment variables:

```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
```

### Using the Discord Integration

The Discord integration is available in `src/libs/Discord.ts` and provides the following functions:

#### Send a Simple Text Message

```typescript
import { sendDiscordTextMessage } from '@/libs/Discord';

await sendDiscordTextMessage('Hello from the app!');
```

#### Send an Embed

```typescript
import { sendDiscordEmbed, DiscordColors } from '@/libs/Discord';

await sendDiscordEmbed({
  title: 'New User Registered',
  description: 'A new user has joined the platform',
  color: DiscordColors.SUCCESS,
  fields: [
    {
      name: 'Email',
      value: 'user@example.com',
      inline: true,
    },
    {
      name: 'Date',
      value: new Date().toLocaleString(),
      inline: true,
    },
  ],
  timestamp: new Date().toISOString(),
});
```

#### Available Colors

```typescript
DiscordColors.SUCCESS  // Green (0x00FF00)
DiscordColors.WARNING  // Yellow (0xFFFF00)
DiscordColors.ERROR    // Red (0xFF0000)
DiscordColors.INFO     // Blue (0x0099FF)
DiscordColors.DEFAULT  // Discord blurple (0x7289DA)
```

## Daily Reports

The boilerplate can automatically send daily reports to Discord with application metrics.

### What's Included in Daily Reports

- **User Statistics**
  - Total users
  - New users today
  - New users this week

- **Payment Statistics**
  - Total payments
  - Today's revenue and count
  - This week's revenue and count

- **System Health**
  - Current health status
  - Application uptime
  - Service status

- **Active Sessions**
  - Number of currently active user sessions

### Manual Trigger

You can manually trigger a daily report:

```bash
curl -X POST http://localhost:3000/api/reports/daily \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Testing the Report

For testing purposes, you can use the GET endpoint (remove in production):

```bash
curl -X GET http://localhost:3000/api/reports/daily \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Setting Up Cron Jobs

To automatically send daily reports, you need to set up a cron job that calls the report endpoint.

### Environment Variables

Add the following to your `.env` file:

```env
# Discord webhook URL (from your Discord server)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN

# Secret token to protect the cron endpoint (generate a random string)
CRON_SECRET=your-secret-token-here

# Your application URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

Generate a secure CRON_SECRET:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Option 1: Vercel Cron Jobs

If you're deploying to Vercel, add a `vercel.json` file:

```json
{
  "crons": [
    {
      "path": "/api/reports/daily",
      "schedule": "0 9 * * *"
    }
  ]
}
```

This will trigger the report every day at 9:00 AM UTC.

**Note**: Vercel cron jobs automatically include authentication, so you don't need the Authorization header.

### Option 2: GitHub Actions

Create `.github/workflows/daily-report.yml`:

```yaml
name: Daily Report

on:
  schedule:
    # Runs every day at 9:00 AM UTC
    - cron: '0 9 * * *'
  workflow_dispatch: # Allows manual triggering

jobs:
  send-report:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Daily Report
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/reports/daily \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

Add these secrets to your GitHub repository:
- `APP_URL`: Your application URL
- `CRON_SECRET`: The secret from your .env file

### Option 3: cron-job.org

1. Go to [cron-job.org](https://cron-job.org)
2. Create a free account
3. Create a new cron job:
   - **Title**: Daily Report
   - **URL**: `https://your-domain.com/api/reports/daily`
   - **Schedule**: `0 9 * * *` (9:00 AM daily)
   - **Request Method**: POST
   - **Headers**: Add `Authorization: Bearer YOUR_CRON_SECRET`

### Option 4: EasyCron

1. Go to [EasyCron](https://www.easycron.com)
2. Create a free account
3. Create a new cron job:
   - **URL**: `https://your-domain.com/api/reports/daily`
   - **Cron Expression**: `0 9 * * *`
   - **Request Method**: POST
   - **HTTP Headers**: `Authorization: Bearer YOUR_CRON_SECRET`

### Option 5: Server-side Cron (Linux)

If you're running on a Linux server, add to crontab:

```bash
# Edit crontab
crontab -e

# Add this line (replace with your values)
0 9 * * * curl -X POST https://your-domain.com/api/reports/daily -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Cron Schedule Examples

```bash
# Every day at 9:00 AM
0 9 * * *

# Every day at midnight
0 0 * * *

# Every Monday at 9:00 AM
0 9 * * 1

# Every hour
0 * * * *

# Every 6 hours
0 */6 * * *
```

## Monitoring Best Practices

### 1. Set Up Multiple Monitors

- Use the `/api/health` endpoint for uptime monitoring
- Set up daily reports for metrics tracking
- Configure alerting for critical issues

### 2. Security

- Keep your `CRON_SECRET` secure
- Rotate secrets regularly
- Use HTTPS for all webhook URLs
- Don't expose Discord webhook URLs in client code

### 3. Rate Limiting

The endpoints include basic rate limiting via Arcjet. For production:

- Consider adding additional rate limiting
- Monitor webhook usage
- Set up alerts for unusual activity

### 4. Testing

Before going to production:

1. Test the health endpoint manually
2. Trigger a test daily report
3. Verify Discord notifications are received
4. Check logs for any errors

## Troubleshooting

### Discord Messages Not Sending

1. Verify `DISCORD_WEBHOOK_URL` is set correctly
2. Check that the webhook is still active in Discord
3. Review logs for error messages
4. Test with a simple curl command:

```bash
curl -X POST "YOUR_DISCORD_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"content":"Test message"}'
```

### Health Check Returns Unhealthy

1. Check database connectivity
2. Verify environment variables are set
3. Review service logs
4. Check individual service status in the response

### Cron Job Not Triggering

1. Verify the cron expression is correct
2. Check that `CRON_SECRET` matches
3. Ensure the URL is accessible
4. Review cron service logs
5. Test the endpoint manually

## Additional Resources

- [Swagger Documentation](https://swagger.io/docs/)
- [Discord Webhook Guide](https://discord.com/developers/docs/resources/webhook)
- [Cron Expression Guide](https://crontab.guru/)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
