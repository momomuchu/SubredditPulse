-- Performance Indexes for SubredditPulse
-- Run this migration to improve query performance

-- Scans table indexes
CREATE INDEX IF NOT EXISTS idx_scans_subreddit_created
  ON scans(subreddit_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_scans_status_created
  ON scans(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_scans_created
  ON scans(created_at DESC);

-- User credits index
CREATE INDEX IF NOT EXISTS idx_user_credits_user
  ON user_credits(user_id);

-- Monitored subreddits indexes
CREATE INDEX IF NOT EXISTS idx_monitored_subreddits_user_active
  ON monitored_subreddits(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_monitored_subreddits_next_scan
  ON monitored_subreddits(next_scan_at)
  WHERE is_active = true;

-- Alert history index
CREATE INDEX IF NOT EXISTS idx_alert_history_created
  ON alert_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_alert_history_alert
  ON alert_history(alert_id);

-- Alerts index
CREATE INDEX IF NOT EXISTS idx_alerts_subreddit
  ON alerts(subreddit_id);

-- Sentiment baselines index
CREATE INDEX IF NOT EXISTS idx_sentiment_baselines_subreddit_period
  ON sentiment_baselines(subreddit_id, period, calculated_at DESC);

-- Scan results index
CREATE INDEX IF NOT EXISTS idx_scan_results_scan
  ON scan_results(scan_id);

-- Comments
COMMENT ON INDEX idx_scans_subreddit_created IS 'Optimize scan history queries per subreddit';
COMMENT ON INDEX idx_monitored_subreddits_next_scan IS 'Optimize cron job queries for due scans';
COMMENT ON INDEX idx_user_credits_user IS 'Optimize credit balance lookups';
