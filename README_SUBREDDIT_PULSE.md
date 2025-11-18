# SubredditPulse - AI Sentiment Shift Detector

Track sentiment shifts in your niche subreddit for $10, not $200/month.

## What is SubredditPulse?

SubredditPulse is an affordable sentiment monitoring tool for Reddit communities. Perfect for:
- Indie game devs monitoring r/gaming, r/indiegames
- Crypto projects tracking niche crypto subs
- Micro SaaS founders watching r/SideProject, r/EntrepreneurRideAlong
- Hobby brand owners (woodworking, 3D printing, etc.)
- Content creators monitoring their niche communities

## MVP Features (Phase 1)

### 1. Subreddit Setup
- Add 1-3 subreddits to monitor
- Define up to 10 keywords/phrases per subreddit
- Choose monitoring frequency:
  - Daily scan
  - Every 3 days
  - Weekly
- Set sentiment threshold alerts (e.g., alert if sentiment drops below -0.3)

### 2. Smart Sentiment Analysis
- Scan last 100-500 posts (configurable)
- Analyze:
  - Overall sentiment score (-1 to +1)
  - Sentiment trend (improving/declining)
  - Keyword mentions (frequency + context)
  - Top rising topics
  - Emerging negative/positive themes
- Compare to baseline (7-day, 30-day average)

### 3. Alerts & Notifications
Email alerts when:
- Sentiment drops >20% from baseline
- Keyword mentions spike 3x+
- New trending topic detected in niche
- Negative sentiment about specific keyword

### 4. Simple Dashboard
- Overview page showing all monitored subreddits
- Per-subreddit view:
  - Sentiment graph (7-day, 30-day)
  - Keyword mention trends
  - Top posts (positive/negative)
  - Emerging topics list
  - Word cloud visualization
- Manual "Scan Now" button (costs 1 credit)

### 5. Credit System
- **Setup fee**: $8 one-time per subreddit
- **Scans**:
  - Auto-scans based on frequency (included in setup)
  - Manual scans: $1 per scan
  - Deep scans (1000+ posts): $2 per scan
- **Credit packs**:
  - 10 scans: $8 ($0.80 each)
  - 25 scans: $18 ($0.72 each)
  - 50 scans: $30 ($0.60 each)

## Setup Instructions

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Reddit API credentials
- Stripe account (for payments)

### 1. Reddit API Setup

1. Go to https://www.reddit.com/prefs/apps
2. Click "Create App" or "Create Another App"
3. Fill in the form:
   - **Name**: SubredditPulse (or your app name)
   - **App type**: Select "script"
   - **Description**: Your app description
   - **About URL**: Leave blank
   - **Redirect URI**: http://localhost:8080 (not used but required)
4. Click "Create app"
5. Copy the **client ID** (under your app name)
6. Copy the **client secret**

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
# Reddit API
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password
REDDIT_USER_AGENT=web:SubredditPulse:v1.0.0 (by /u/yourusername)
```

### 3. Database Setup

```bash
# Install dependencies
npm install

# Generate and run database migrations
npm run db:generate
npm run db:migrate
```

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 and sign in to access the dashboard.

## Database Schema

The SubredditPulse MVP includes the following tables:

- **user_credits** - Track user credit balances
- **monitored_subreddits** - Subreddits being monitored
- **subreddit_keywords** - Keywords to track per subreddit
- **scans** - Record of each scan performed
- **scan_results** - Detailed results with sentiment data
- **alerts** - Alert configurations
- **alert_history** - Triggered alerts
- **sentiment_baselines** - Baseline sentiment for comparison

## API Routes

### Subreddits
- `GET /api/subreddits` - Get all monitored subreddits
- `POST /api/subreddits` - Add a new subreddit to monitor

### Scans
- `GET /api/scans?subredditId=xxx` - Get scans for a subreddit
- `POST /api/scans` - Trigger a new scan (manual or deep)

### Credits
- `GET /api/credits` - Get user's credit balance
- `POST /api/credits` - Add credits to account

### Alerts
- `GET /api/alerts?subredditId=xxx` - Get alert history for a subreddit
- `PUT /api/alerts` - Update alert configuration (enable/disable, change threshold)

### Export
- `GET /api/export/csv?subredditId=xxx` - Export scan data as CSV
- `POST /api/export/csv/detailed` - Export detailed scan results including keyword mentions

### Cron Jobs
- `POST /api/cron/scans` - Automated endpoint for scheduled scans (requires CRON_SECRET)
- `GET /api/cron/scans` - Check status of subreddits due for scanning

## Architecture

### Core Services

1. **Reddit Service** (`src/libs/Reddit.ts`)
   - Handles Reddit API interactions using Snoowrap
   - Fetches posts, comments, subreddit info
   - Search functionality

2. **Sentiment Analysis Service** (`src/libs/SentimentAnalysis.ts`)
   - Analyzes text sentiment using Sentiment.js
   - Returns normalized scores (-1 to 1)
   - Bulk analysis for multiple texts
   - Keyword context analysis

3. **Scan Service** (`src/libs/ScanService.ts`)
   - Orchestrates the scanning process
   - Manages credit deduction
   - Saves results to database
   - Triggers alerts and notifications

4. **Email Notifications Service** (`src/libs/EmailNotifications.ts`)
   - Sends email alerts using Resend API
   - Sentiment drop notifications
   - Keyword spike notifications
   - Weekly digest emails

## Dashboard Pages

1. **Main Dashboard** (`/dashboard/pulse`)
   - Overview of all monitored subreddits
   - Credit balance
   - Recent scans
   - Quick actions

2. **Add Subreddit** (`/dashboard/pulse/add`)
   - Form to add new subreddit
   - Configure keywords, frequency, alerts

3. **Subreddit Detail** (`/dashboard/pulse/[id]`)
   - Detailed view of a specific subreddit
   - Scan history
   - Latest sentiment scores
   - Manual scan trigger

## Pricing Model

### Setup Fees
- $8 per subreddit (one-time)
- Includes automatic scans based on chosen frequency
- Up to 3 subreddits per user

### Scan Credits
- **Manual scan**: 1 credit ($1)
- **Deep scan**: 2 credits ($2)
- **Credit packs**:
  - 10 credits: $8
  - 25 credits: $18
  - 50 credits: $30

## Roadmap

### Phase 2 (Future Features)
- Competitor tracking
- Multi-subreddit insights
- Historical analysis (90 days)
- Advanced filters (flair, karma threshold)
- Influencer detection
- PDF/CSV reports
- Weekly email digest

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with DrizzleORM
- **Authentication**: Auth.js (NextAuth.js)
- **Payments**: Stripe
- **Reddit API**: Snoowrap
- **Sentiment Analysis**: Sentiment.js

## Support

For issues or questions:
- GitHub Issues: [your-repo-url]
- Email: support@subredditpulse.com

## License

MIT License - see LICENSE file for details

---

Built with ❤️ for indie makers and small teams who need affordable Reddit sentiment tracking.

## New Features & Improvements

### Email Notifications
SubredditPulse now sends email notifications for important alerts:
- **Sentiment Drop Alerts**: Get notified when sentiment drops significantly
- **Keyword Spike Alerts**: Get alerted when your tracked keywords trend
- **Weekly Digest**: Optional weekly summary of all your monitored subreddits

To enable email notifications:
1. Sign up for a free [Resend](https://resend.com) account
2. Get your API key from https://resend.com/api-keys
3. Add to `.env.local`:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   EMAIL_FROM=SubredditPulse <noreply@yourdomain.com>
   ```

### Automated Scans
Set up automatic scans using cron jobs:

**Using Vercel Cron:**
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/scans",
    "schedule": "0 */12 * * *"
  }]
}
```

**Using GitHub Actions:**
```yaml
# .github/workflows/cron-scans.yml
name: Scheduled Scans
on:
  schedule:
    - cron: '0 */12 * * *'
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger scans
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/cron/scans \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### Data Export
Export your sentiment data for further analysis:
- **CSV Export**: Simple export of scan history
- **Detailed CSV**: Includes keyword mentions, sentiment distribution, and top posts
- Access via `/api/export/csv?subredditId=xxx`

### Sentiment Trend Visualization
A new `SentimentTrendChart` component visualizes sentiment over time:
- Line chart showing sentiment trends
- Color-coded for positive/neutral/negative
- Shows last 30 scans
- Responsive SVG rendering

Usage:
```tsx
import { SentimentTrendChart } from '@/components/pulse/SentimentTrendChart';

<SentimentTrendChart scans={scans} title="Sentiment Trend" />
```

### Alert Management
Manage your alerts via the new API:
- View alert history: `GET /api/alerts?subredditId=xxx`
- Update alert settings: `PUT /api/alerts`
- Enable/disable specific alerts
- Adjust sensitivity thresholds

## Advanced Configuration

### Setting Up Automated Scans

1. **Configure scan frequency** when adding a subreddit:
   - Daily (scans every 24 hours)
   - Every 3 days
   - Weekly

2. **Set up cron secret** in `.env.local`:
   ```env
   CRON_SECRET=your_random_secret_string
   ```

3. **Deploy cron job** using your platform of choice (Vercel, GitHub Actions, etc.)

### Customizing Email Templates

Email templates are in `src/libs/EmailNotifications.ts`. Customize:
- Subject lines
- HTML content
- From address
- Email styling

### Rate Limiting

Reddit API has rate limits. SubredditPulse implements:
- 1-second delay between API calls
- 2-second delay between automated scans
- Configurable request delays in Reddit service

## Performance Tips

1. **Optimize scan frequency**: Don't scan too frequently to preserve credits
2. **Use deep scans sparingly**: 500-post scans cost more credits
3. **Set appropriate alert thresholds**: Avoid alert fatigue with proper thresholds
4. **Export data regularly**: Keep local backups using CSV export
5. **Monitor credit usage**: Track credit consumption to optimize costs

## Troubleshooting

### Email notifications not working
- Verify `RESEND_API_KEY` is set correctly
- Check email domain is verified in Resend
- Look for email errors in server logs

### Scans not triggering automatically
- Verify cron job is configured correctly
- Check `CRON_SECRET` matches in cron request
- Ensure `nextScanAt` is being updated properly

### Reddit API rate limiting
- Reduce scan frequency if hitting limits
- Add delays between API calls
- Consider using Reddit Premium for higher rate limits

## Security Best Practices

1. **Environment Variables**: Never commit `.env.local` to version control
2. **Cron Secret**: Use a strong random string for `CRON_SECRET`
3. **API Authentication**: All endpoints require user authentication
4. **Rate Limiting**: Consider adding Arcjet rate limiting for API routes
5. **Input Validation**: All user inputs are validated before database operations

