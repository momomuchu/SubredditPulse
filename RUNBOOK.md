# SubredditPulse Operations Runbook

This runbook provides step-by-step procedures for common operational issues and maintenance tasks.

## Table of Contents

1. [System Health Monitoring](#system-health-monitoring)
2. [Common Issues](#common-issues)
3. [Emergency Procedures](#emergency-procedures)
4. [Maintenance Tasks](#maintenance-tasks)
5. [Troubleshooting](#troubleshooting)

---

## System Health Monitoring

### Access the Health Dashboard

Navigate to: `/admin/health`

**Note:** Only users with admin email addresses can access this dashboard.

### Key Metrics to Monitor

- **System Status**: Overall health (healthy/warning/critical)
- **Failed Scans (24h)**: Should be < 5
- **Subreddits Due for Scan**: Should be processed within schedule
- **Total Credits**: Monitor for unusual spikes or drops

### Setting Up Monitoring Alerts

**Recommended:**
1. Set up UptimeRobot to ping `/api/health` every 5 minutes
2. Configure Sentry alerts for error rate > 1%
3. Set up email alerts for:
   - Failed scans > 10 in 24 hours
   - Database connection failures
   - Reddit API rate limiting

---

## Common Issues

### Issue 1: Reddit API Rate Limiting

**Symptoms:**
- Scans failing with "rate limit" errors
- Error message: "429 Too Many Requests"

**Cause:**
- Too many scans running simultaneously
- Reddit API limit exceeded (60 requests/minute)

**Solution:**
```bash
# Check recent failed scans
# Navigate to /admin/health and check "Recent Failed Scans"

# Temporary fix: Reduce scan frequency
# 1. Go to each subreddit settings
# 2. Change frequency from "daily" to "every_3_days" or "weekly"

# Long-term fix: Implemented automatic rate limiting
# The Reddit client now enforces 55 requests/minute with automatic backoff
```

**Prevention:**
- Don't run more than 50 manual scans per hour
- Space out cron job executions

---

### Issue 2: Scans Failing Silently

**Symptoms:**
- Subreddits show "Due for Scan" but scans not running
- No error messages in failed scans

**Cause:**
- Cron job not executing
- CRON_SECRET mismatch
- Database connection timeout

**Solution:**
```bash
# 1. Check if cron job is configured
# Vercel: Check vercel.json for cron configuration
# GitHub Actions: Check .github/workflows/ for cron workflow

# 2. Manually trigger cron endpoint
curl -X POST https://yourdomain.com/api/cron/scans \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# 3. Check logs for errors
# Vercel: View function logs in dashboard
# Check Sentry for error traces

# 4. Verify database connection
# Run: npm run db:migrate
```

**Prevention:**
- Set up monitoring for cron job execution
- Add logging to /api/cron/scans endpoint

---

### Issue 3: Database Full / Out of Storage

**Symptoms:**
- Scans failing with database errors
- "disk full" or "storage exceeded" errors

**Cause:**
- Too many scan results stored
- No cleanup of old data

**Solution:**
```sql
-- Clean up old scan results (keep last 90 days)
DELETE FROM scan_results
WHERE scan_id IN (
  SELECT id FROM scans
  WHERE created_at < NOW() - INTERVAL '90 days'
);

DELETE FROM scans
WHERE created_at < NOW() - INTERVAL '90 days';

-- Clean up old alert history (keep last 60 days)
DELETE FROM alert_history
WHERE created_at < NOW() - INTERVAL '60 days';
```

**Prevention:**
- Set up automated cleanup cron job
- Monitor database size weekly
- Enable automatic backups before cleanup

---

### Issue 4: Email Notifications Not Sending

**Symptoms:**
- Users not receiving alert emails
- Resend dashboard shows failures

**Cause:**
- Domain not verified in Resend
- SPF/DKIM records not configured
- Email bounce rate too high

**Solution:**
```bash
# 1. Verify domain in Resend
# Go to: https://resend.com/domains
# Add your domain and follow DNS setup instructions

# 2. Check DNS records
dig TXT _resend.yourdomain.com
dig TXT resend._domainkey.yourdomain.com

# 3. Check email logs
# Go to: https://resend.com/emails
# Look for bounce/spam reports

# 4. Test email sending
curl -X POST https://yourdomain.com/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test@email.com"}'
```

**Prevention:**
- Warm up email sending gradually
- Monitor bounce rate (should be < 5%)
- Keep email content professional (avoid spam triggers)

---

### Issue 5: Stripe Webhook Failures

**Symptoms:**
- User paid but credits not added
- Stripe dashboard shows webhook errors

**Cause:**
- Webhook signature verification failing
- STRIPE_WEBHOOK_SECRET mismatch
- Server timeout processing webhook

**Solution:**
```bash
# 1. Check Stripe webhook logs
# Go to: https://dashboard.stripe.com/webhooks
# Click on your webhook endpoint
# Check recent deliveries for errors

# 2. Verify webhook secret
# Compare STRIPE_WEBHOOK_SECRET in .env with Stripe dashboard

# 3. Manually add credits to user
# Use admin dashboard to credit the user
# Or run SQL:
UPDATE user_credits
SET credits = credits + 10
WHERE user_id = 'USER_ID_HERE';

# 4. Resend failed webhook
# In Stripe dashboard, click "Resend" on failed webhook
```

**Prevention:**
- Test webhooks in Stripe test mode first
- Set up webhook monitoring
- Log all webhook events to database

---

## Emergency Procedures

### Emergency: Complete System Down

**Steps:**
1. Check hosting platform status (Vercel/Railway/etc.)
2. Check database connectivity
3. Check Sentry for error spike
4. Check DNS resolution
5. Check SSL certificate validity
6. Roll back to previous deployment if needed

```bash
# Vercel rollback
vercel rollback

# Railway rollback
railway rollback
```

---

### Emergency: Reddit API Blocked

**Steps:**
1. Verify Reddit account not banned
2. Check Reddit API status: https://reddit.statuspage.io
3. Verify API credentials in .env
4. Pause all automatic scans temporarily
5. Contact Reddit support if needed

```bash
# Pause all scans
UPDATE monitored_subreddits SET is_active = false;

# Re-enable later
UPDATE monitored_subreddits SET is_active = true;
```

---

### Emergency: Mass Credit Deduction Bug

**Steps:**
1. Immediately disable cron jobs
2. Pause all manual scans
3. Investigate database logs
4. Calculate correct credit balances
5. Refund affected users

```sql
-- Check credit transaction history
SELECT user_id, SUM(credits_cost) as total_deducted
FROM scans
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id
ORDER BY total_deducted DESC;

-- Refund users (adjust amount as needed)
UPDATE user_credits
SET credits = credits + 10
WHERE user_id IN (SELECT DISTINCT user_id FROM affected_users);
```

---

## Maintenance Tasks

### Weekly Tasks

**1. Check System Health**
- Visit `/admin/health`
- Review failed scans
- Check for subreddits stuck in "due for scan"

**2. Monitor Credit Usage**
- Review credit purchase trends
- Check for unusual patterns
- Verify webhook processing

**3. Review Email Deliverability**
- Check Resend bounce rate
- Review spam reports
- Test alert emails

---

### Monthly Tasks

**1. Database Cleanup**
```sql
-- Clean up old scans (keep 90 days)
DELETE FROM scan_results
WHERE scan_id IN (
  SELECT id FROM scans
  WHERE created_at < NOW() - INTERVAL '90 days'
);

DELETE FROM scans
WHERE created_at < NOW() - INTERVAL '90 days';

-- Vacuum database (PostgreSQL)
VACUUM ANALYZE;
```

**2. Review Performance**
- Check database query performance
- Review API endpoint response times
- Optimize slow queries

**3. Security Review**
- Rotate API keys
- Check for dependency updates
- Review Sentry error logs

---

### Quarterly Tasks

**1. Backup Verification**
- Test database restore process
- Verify backup retention policy
- Document restore procedure

**2. Cost Analysis**
- Review hosting costs
- Check Reddit API usage
- Optimize resource usage

**3. Feature Review**
- Gather user feedback
- Plan new features
- Remove unused features

---

## Troubleshooting

### Debugging Failed Scans

**Step 1: Check Error Message**
```sql
SELECT id, subreddit_id, error_message, created_at
FROM scans
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 10;
```

**Step 2: Check Subreddit Status**
```sql
SELECT * FROM monitored_subreddits
WHERE id = 'SUBREDDIT_ID';
```

**Step 3: Test Reddit API Manually**
```bash
# Test if subreddit exists
curl -A "SubredditPulse:v1.0.0" \
  https://www.reddit.com/r/SUBREDDIT_NAME/about.json
```

---

### Debugging Credit Issues

**Check Credit Balance**
```sql
SELECT uc.*, u.email
FROM user_credits uc
JOIN users u ON u.id = uc.user_id
WHERE u.email = 'user@example.com';
```

**Check Recent Credit Transactions**
```sql
SELECT s.id, s.created_at, s.scan_type, s.credits_cost
FROM scans s
JOIN monitored_subreddits ms ON ms.id = s.subreddit_id
WHERE ms.user_id = 'USER_ID'
ORDER BY s.created_at DESC
LIMIT 20;
```

---

### Debugging Email Issues

**Check Email Sending Code**
```typescript
// Test email sending in development
import { EmailNotifications } from '@/libs/EmailNotifications';

await EmailNotifications.sendSentimentDropAlert(
  'test@example.com',
  'TestSubreddit',
  -0.5,
  0.2,
  70
);
```

**Check Resend Logs**
- Go to: https://resend.com/emails
- Filter by email address
- Check delivery status

---

## Performance Optimization

### Query Optimization

**Identify Slow Queries**
```sql
-- PostgreSQL: Enable query logging
-- Add to postgresql.conf:
log_min_duration_statement = 1000  -- Log queries > 1 second
```

**Add Indexes**
```sql
-- Already added via migration
-- See migrations/add_performance_indexes.sql
```

---

### Rate Limiting Optimization

**Current Limits:**
- Reddit API: 55 requests/minute (safety margin from 60)
- Manual scans: Unlimited (consider adding user limits)
- Cron scans: 2 second delay between subreddits

**Recommended Changes:**
- Add per-user rate limit: 10 manual scans/hour
- Add global rate limit: 100 scans/minute
- Implement queue system for high-volume periods

---

## Support Contact

For urgent issues:
- **Email:** support@subredditpulse.com
- **Sentry:** Check error dashboard
- **Status:** Check /admin/health

For questions about this runbook:
- Update documentation in RUNBOOK.md
- Keep procedures current with code changes

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-01-XX | Initial runbook created | System |

