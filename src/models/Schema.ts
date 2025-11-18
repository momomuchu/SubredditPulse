import type { AdapterAccount } from 'next-auth/adapters';
import { randomUUID } from 'node:crypto';
import { boolean, decimal, doublePrecision, integer, jsonb, pgTable, primaryKey, serial, text, timestamp } from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// The migration is automatically applied during the Next.js initialization process through `instrumentation.ts`.
// Simply restart your Next.js server to apply the database changes.
// Alternatively, if your database is running, you can run `npm run db:migrate` and there is no need to restart the server.

// Need a database for production? Check out https://www.prisma.io/?via=nextjsboilerplate
// Tested and compatible with Next.js Boilerplate

export const counterSchema = pgTable('counter', {
  id: serial('id').primaryKey(),
  count: integer('count').default(0),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const users = pgTable('user', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  passwordHash: text('password_hash'),
  image: text('image'),
  stripeCustomerId: text('stripe_customer_id'),
});

export const accounts = pgTable('account', {
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').$type<AdapterAccount['type']>().notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, account => ({
  compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
}));

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable('verificationToken', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, verificationToken => ({
  compositePk: primaryKey({ columns: [verificationToken.identifier, verificationToken.token] }),
}));

export const authenticators = pgTable('authenticator', {
  credentialID: text('credentialID').notNull().unique(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  providerAccountId: text('providerAccountId').notNull(),
  credentialPublicKey: text('credentialPublicKey').notNull(),
  counter: integer('counter').notNull(),
  credentialDeviceType: text('credentialDeviceType').notNull(),
  credentialBackedUp: boolean('credentialBackedUp').notNull(),
  transports: text('transports'),
}, authenticator => ({
  compositePk: primaryKey({ columns: [authenticator.userId, authenticator.credentialID] }),
}));

export const payments = pgTable('payment', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'set null' }),
  stripeSessionId: text('stripe_session_id').notNull().unique(),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  stripeCustomerId: text('stripe_customer_id'),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull(),
  status: text('status').notNull().default('pending'),
  productName: text('product_name'),
  metadata: jsonb('metadata').$type<Record<string, string> | null>(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  completedAt: timestamp('completed_at', { mode: 'date' }),
});

// ============================================================================
// SubredditPulse Schema
// ============================================================================

// User credits for scans
export const userCredits = pgTable('user_credits', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  credits: integer('credits').notNull().default(0),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Monitored subreddits
export const monitoredSubreddits = pgTable('monitored_subreddits', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  subredditName: text('subreddit_name').notNull(),
  displayName: text('display_name'),
  scanFrequency: text('scan_frequency').notNull().default('daily'), // daily, every_3_days, weekly
  postLimit: integer('post_limit').notNull().default(100), // 100-500
  isActive: boolean('is_active').notNull().default(true),
  setupFee: integer('setup_fee').default(800), // $8 in cents
  lastScanAt: timestamp('last_scan_at', { mode: 'date' }),
  nextScanAt: timestamp('next_scan_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Keywords to track per subreddit
export const subredditKeywords = pgTable('subreddit_keywords', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  subredditId: text('subreddit_id')
    .notNull()
    .references(() => monitoredSubreddits.id, { onDelete: 'cascade' }),
  keyword: text('keyword').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Alert configurations
export const alerts = pgTable('alerts', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  subredditId: text('subreddit_id')
    .notNull()
    .references(() => monitoredSubreddits.id, { onDelete: 'cascade' }),
  alertType: text('alert_type').notNull(), // sentiment_drop, keyword_spike, new_trend, negative_keyword
  threshold: doublePrecision('threshold').notNull().default(0.2), // threshold value (e.g., 0.2 for 20%)
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Scan records
export const scans = pgTable('scans', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  subredditId: text('subreddit_id')
    .notNull()
    .references(() => monitoredSubreddits.id, { onDelete: 'cascade' }),
  scanType: text('scan_type').notNull().default('auto'), // auto, manual, deep
  status: text('status').notNull().default('pending'), // pending, running, completed, failed
  postsScanned: integer('posts_scanned').default(0),
  creditsCost: integer('credits_cost').notNull().default(0), // 0 for auto, 1 for manual, 2 for deep
  overallSentiment: doublePrecision('overall_sentiment'), // -1 to 1
  sentimentTrend: text('sentiment_trend'), // improving, declining, stable
  errorMessage: text('error_message'),
  metadata: jsonb('metadata').$type<Record<string, any> | null>(),
  startedAt: timestamp('started_at', { mode: 'date' }),
  completedAt: timestamp('completed_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Scan results - detailed data from scans
export const scanResults = pgTable('scan_results', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  scanId: text('scan_id')
    .notNull()
    .references(() => scans.id, { onDelete: 'cascade' }),
  keywordMentions: jsonb('keyword_mentions').$type<Record<string, number> | null>(), // { "keyword": count }
  topPosts: jsonb('top_posts').$type<Array<{ id: string; title: string; score: number; sentiment: number; url: string }> | null>(),
  emergingTopics: jsonb('emerging_topics').$type<Array<{ topic: string; mentions: number; trend: string }> | null>(),
  sentimentDistribution: jsonb('sentiment_distribution').$type<{ positive: number; neutral: number; negative: number } | null>(),
  wordCloud: jsonb('word_cloud').$type<Array<{ word: string; frequency: number }> | null>(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Sentiment baselines for comparison
export const sentimentBaselines = pgTable('sentiment_baselines', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  subredditId: text('subreddit_id')
    .notNull()
    .references(() => monitoredSubreddits.id, { onDelete: 'cascade' }),
  period: text('period').notNull(), // 7_day, 30_day
  averageSentiment: doublePrecision('average_sentiment').notNull(),
  calculatedAt: timestamp('calculated_at', { mode: 'date' }).defaultNow().notNull(),
});

// Alert history - triggered alerts
export const alertHistory = pgTable('alert_history', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  alertId: text('alert_id')
    .notNull()
    .references(() => alerts.id, { onDelete: 'cascade' }),
  scanId: text('scan_id')
    .notNull()
    .references(() => scans.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  data: jsonb('data').$type<Record<string, any> | null>(),
  notificationSent: boolean('notification_sent').notNull().default(false),
  notificationSentAt: timestamp('notification_sent_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
