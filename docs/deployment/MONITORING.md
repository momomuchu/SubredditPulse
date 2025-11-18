# Health Monitoring and Management Guide

Comprehensive guide for monitoring the health and performance of your Next.js Boilerplate deployment.

## Table of Contents

1. [Health Check Endpoints](#health-check-endpoints)
2. [Application Monitoring](#application-monitoring)
3. [Infrastructure Monitoring](#infrastructure-monitoring)
4. [Alerting](#alerting)
5. [Log Management](#log-management)
6. [Performance Monitoring](#performance-monitoring)

## Health Check Endpoints

### Built-in Health Check

The application includes a health check endpoint at `/api/health`:

```bash
# Check application health
curl https://yourdomain.com/api/health

# Expected response (200 OK):
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "database": "connected"
}
```

### Custom Health Checks

Create detailed health checks in `src/app/api/health/route.ts`:

```typescript
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    storage: await checkStorage(),
    externalApis: await checkExternalApis(),
  };

  const allHealthy = Object.values(checks).every(c => c.healthy);

  return Response.json(
    {
      status: allHealthy ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: allHealthy ? 200 : 503 }
  );
}
```

## Application Monitoring

### 1. PostHog Analytics

Configure in `.env.production`:

```bash
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Track custom events:

```typescript
import { usePostHog } from 'posthog-js/react';

function MyComponent() {
  const posthog = usePostHog();

  const handleAction = () => {
    posthog?.capture('custom_event', {
      property: 'value',
    });
  };
}
```

### 2. Sentry Error Tracking

Already configured. Monitor at: https://sentry.io

Key features:
- Real-time error tracking
- Stack traces
- User context
- Performance monitoring
- Release tracking

### 3. Better Stack Logging

Configure centralized logging:

```bash
NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN=your-token
NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST=https://in.logs.betterstack.com
```

View logs at: https://logs.betterstack.com

## Infrastructure Monitoring

### AWS CloudWatch (Terraform Deployed)

Automatically configured metrics:

**Application Load Balancer:**
- Request count
- Response time
- HTTP 4xx/5xx errors
- Healthy host count
- Target response time

**EC2 Auto Scaling:**
- CPU utilization
- Network in/out
- Disk I/O
- Instance health

**RDS Database:**
- CPU utilization
- Database connections
- Free storage space
- Read/Write IOPS
- Replication lag (Multi-AZ)

### CloudWatch Dashboards

Create custom dashboard:

```bash
# Via AWS Console
CloudWatch → Dashboards → Create dashboard

# Or via Terraform (add to terraform/monitoring.tf)
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "RequestCount"]
          ]
          period = 300
          stat = "Sum"
          region = var.aws_region
          title = "Request Count"
        }
      }
    ]
  })
}
```

### Docker Monitoring

Monitor containers with built-in tools:

```bash
# Real-time resource usage
docker stats nextjs-app

# Container health status
docker inspect nextjs-app --format='{{.State.Health.Status}}'

# View health check logs
docker inspect nextjs-app --format='{{range .State.Health.Log}}{{.Output}}{{end}}'
```

### Prometheus + Grafana (Optional)

Deploy monitoring stack:

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana_data:/var/lib/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

  node-exporter:
    image: prom/node-exporter:latest
    ports:
      - "9100:9100"

volumes:
  prometheus_data:
  grafana_data:
```

## Alerting

### 1. AWS CloudWatch Alarms

Already configured in Terraform:
- High CPU (> 75%)
- Low healthy hosts

Add custom alarms:

```hcl
# terraform/alarms.tf
resource "aws_cloudwatch_metric_alarm" "high_error_rate" {
  alarm_name          = "${var.project_name}-high-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "Alert when 5xx errors exceed threshold"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}

resource "aws_sns_topic" "alerts" {
  name = "${var.project_name}-alerts"
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = "alerts@yourdomain.com"
}
```

### 2. Discord Notifications

Configure webhook in `.env.production`:

```bash
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url
```

Send alerts to Discord:

```typescript
// src/libs/discord.ts
export async function sendDiscordAlert(message: string) {
  if (!process.env.DISCORD_WEBHOOK_URL) return;

  await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `🚨 Alert: ${message}`,
      embeds: [{
        title: 'Application Alert',
        description: message,
        color: 0xFF0000,
        timestamp: new Date().toISOString(),
      }],
    }),
  });
}
```

### 3. Email Alerts

Configure SNS email notifications:

```bash
# Subscribe to SNS topic
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:123456789:nextjs-boilerplate-alerts \
  --protocol email \
  --notification-endpoint alerts@yourdomain.com
```

### 4. PagerDuty Integration

For on-call alerting:

```hcl
resource "aws_sns_topic_subscription" "pagerduty" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "https"
  endpoint  = "https://events.pagerduty.com/integration/YOUR_KEY/enqueue"
}
```

## Log Management

### Centralized Logging

#### 1. Better Stack (Recommended)

Already integrated. View logs:
- https://logs.betterstack.com

Features:
- Real-time log streaming
- Full-text search
- Log retention
- Custom alerts

#### 2. CloudWatch Logs

Configure log groups:

```hcl
resource "aws_cloudwatch_log_group" "app" {
  name              = "/aws/ec2/${var.project_name}"
  retention_in_days = 30
}
```

View logs:
```bash
# Via AWS CLI
aws logs tail /aws/ec2/nextjs-boilerplate --follow

# Via AWS Console
CloudWatch → Log groups → /aws/ec2/nextjs-boilerplate
```

#### 3. Docker Logs

Configure log driver in docker-compose.yml:

```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

View logs:
```bash
docker logs -f nextjs-app
docker logs --tail 100 nextjs-app
docker logs --since 1h nextjs-app
```

### Log Aggregation with Ansible

Automated in monitoring role:

```yaml
# ansible/roles/monitoring/tasks/main.yml
- name: Create health check script
  ansible.builtin.copy:
    content: |
      #!/bin/bash
      APP_URL="http://localhost:{{ app_port }}/api/health"
      RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $APP_URL)

      if [ "$RESPONSE" -eq 200 ]; then
          echo "$(date): Healthy (HTTP $RESPONSE)"
      else
          echo "$(date): Unhealthy (HTTP $RESPONSE)" | tee -a /var/log/app-errors.log
          # Send alert
          curl -X POST "${DISCORD_WEBHOOK_URL}" \
            -H "Content-Type: application/json" \
            -d "{\"content\": \"🚨 Application health check failed: HTTP $RESPONSE\"}"
      fi
    dest: /usr/local/bin/app-health-check.sh
    mode: '0755'
```

## Performance Monitoring

### 1. Application Performance

Track with PostHog:

```typescript
// Measure page load time
posthog.capture('$pageview', {
  loadTime: window.performance.timing.loadEventEnd -
            window.performance.timing.navigationStart,
});

// Measure API response time
const start = Date.now();
await fetch('/api/endpoint');
posthog.capture('api_call', {
  duration: Date.now() - start,
  endpoint: '/api/endpoint',
});
```

### 2. Real User Monitoring (RUM)

Built-in with Sentry:

```typescript
// sentry.client.config.ts
Sentry.init({
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', /^https:\/\/yourdomain\.com/],
    }),
  ],
});
```

### 3. Database Performance

Monitor slow queries:

```sql
-- Enable slow query log (RDS)
-- Set parameter: slow_query_log = 1
-- Set parameter: long_query_time = 2

-- View slow queries
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### 4. Load Testing

Use k6 for load testing:

```javascript
// loadtest.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp-up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp-down
  ],
};

export default function () {
  const res = http.get('https://yourdomain.com');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

Run test:
```bash
k6 run loadtest.js
```

## Monitoring Dashboard

### Create Monitoring Dashboard

```bash
# Create monitoring script
cat > monitoring/dashboard.sh << 'EOF'
#!/bin/bash

echo "=== Next.js Boilerplate Health Dashboard ==="
echo ""

# Application Health
echo "📊 Application Health:"
APP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
if [ "$APP_STATUS" -eq 200 ]; then
    echo "  ✅ Application: Healthy"
else
    echo "  ❌ Application: Unhealthy (HTTP $APP_STATUS)"
fi

# Docker Status
echo ""
echo "🐳 Docker Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Resource Usage
echo ""
echo "💻 Resource Usage:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Database
echo ""
echo "🗄️  Database:"
DB_CONN=$(docker exec nextjs-app psql $DATABASE_URL -c "SELECT 1" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "  ✅ Database: Connected"
else
    echo "  ❌ Database: Connection failed"
fi

# Disk Space
echo ""
echo "💾 Disk Space:"
df -h | grep -E "Filesystem|/dev/root"

# Recent Errors
echo ""
echo "⚠️  Recent Errors (last 10 lines):"
docker logs nextjs-app --tail 10 2>&1 | grep -i error || echo "  No errors found"

EOF

chmod +x monitoring/dashboard.sh
```

Run dashboard:
```bash
./monitoring/dashboard.sh
```

### Automated Health Checks

Configure with cron:

```bash
# Add to crontab
*/5 * * * * /usr/local/bin/app-health-check.sh
0 9 * * * /usr/local/bin/daily-health-report.sh
```

## Uptime Monitoring

### External Monitoring Services

1. **UptimeRobot** (Free tier available)
   - Monitor: https://yourdomain.com/api/health
   - Interval: 5 minutes
   - Alert via: Email, SMS, Webhook

2. **Pingdom**
   - Synthetic monitoring
   - Global probes
   - Performance insights

3. **StatusCake**
   - Uptime monitoring
   - SSL monitoring
   - Domain monitoring

### Custom Uptime Monitor

```bash
# uptime-monitor.sh
#!/bin/bash

URL="https://yourdomain.com/api/health"
SLACK_WEBHOOK="your-slack-webhook"

while true; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" $URL)

    if [ "$STATUS" -ne 200 ]; then
        # Send alert
        curl -X POST $SLACK_WEBHOOK \
            -H "Content-Type: application/json" \
            -d "{\"text\": \"🚨 Site down! Status: $STATUS\"}"
    fi

    sleep 60
done
```

## Best Practices

### 1. Set Up Alerts for Critical Metrics

- Application down (health check fails)
- High error rate (5xx errors > threshold)
- Database connection failures
- High CPU/Memory usage
- Low disk space
- SSL certificate expiration

### 2. Regular Health Checks

- Every 5 minutes: HTTP health check
- Every hour: Detailed system check
- Daily: Performance review
- Weekly: Security scan

### 3. Log Retention

- Development: 7 days
- Staging: 14 days
- Production: 30-90 days

### 4. Monitoring Documentation

Maintain runbooks for:
- Common issues and solutions
- Emergency procedures
- Escalation paths
- Contact information

### 5. Test Alerts

Regularly test alerting system:

```bash
# Test health endpoint failure
docker stop nextjs-app
# Verify alerts are sent

# Restart
docker start nextjs-app
# Verify recovery notification
```

## Troubleshooting

### High CPU Usage

```bash
# Identify processes
docker exec nextjs-app top

# Check application logs
docker logs nextjs-app | grep -i "high cpu\|performance"

# Scale horizontally (AWS)
# Update asg_desired_capacity in Terraform
```

### Memory Leaks

```bash
# Monitor memory over time
docker stats nextjs-app --no-stream

# Generate heap snapshot
docker exec nextjs-app node --expose-gc --inspect app.js

# Analyze with Chrome DevTools
chrome://inspect
```

### Database Connection Issues

```bash
# Check connection count
docker exec postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Check for long-running queries
docker exec postgres psql -U postgres -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"

# Kill stuck queries
docker exec postgres psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle in transaction';"
```

## Summary

A comprehensive monitoring strategy includes:

1. **Health Checks**: Application and infrastructure
2. **Metrics**: Performance, errors, resource usage
3. **Logs**: Centralized, searchable, retained
4. **Alerts**: Critical issues, multiple channels
5. **Dashboards**: Real-time visibility
6. **Testing**: Load tests, alert tests
7. **Documentation**: Runbooks, procedures

Regular monitoring ensures high availability, quick issue detection, and optimal performance.
