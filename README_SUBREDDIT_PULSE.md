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
- `POST /api/scans` - Trigger a new scan

### Credits
- `GET /api/credits` - Get user's credit balance
- `POST /api/credits` - Add credits to account

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
   - Triggers alerts

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
