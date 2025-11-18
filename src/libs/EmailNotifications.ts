import { Env } from './Env';

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

/**
 * Email Service
 *
 * Handles sending emails for notifications and alerts
 * Uses Resend API for email delivery
 */
class EmailService {
  private apiKey: string | undefined;
  private fromEmail: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY;
    this.fromEmail = process.env.EMAIL_FROM || 'SubredditPulse <noreply@subredditpulse.com>';
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
    if (!this.apiKey) {
      console.warn('RESEND_API_KEY not configured. Email not sent.');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Email send failed:', error);
        return { success: false, error: `Failed to send email: ${error}` };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send sentiment drop alert email
   */
  async sendSentimentDropAlert(
    userEmail: string,
    subredditName: string,
    currentSentiment: number,
    baselineSentiment: number,
    dropPercent: number,
  ) {
    const subject = `⚠️ Sentiment Alert: r/${subredditName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9333ea;">Sentiment Drop Detected</h2>
        <p>We detected a significant sentiment drop in <strong>r/${subredditName}</strong>.</p>

        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #dc2626;">Alert Details</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Sentiment dropped by:</strong> ${dropPercent.toFixed(1)}%</li>
            <li><strong>Previous sentiment:</strong> ${baselineSentiment.toFixed(2)}</li>
            <li><strong>Current sentiment:</strong> ${currentSentiment.toFixed(2)}</li>
          </ul>
        </div>

        <p>This could indicate:</p>
        <ul>
          <li>Negative news or events affecting the community</li>
          <li>Product/service issues being discussed</li>
          <li>Changes in community sentiment towards your brand</li>
        </ul>

        <p>
          <a href="${Env.NEXT_PUBLIC_APP_URL}/dashboard/pulse"
             style="display: inline-block; background: #9333ea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            View Dashboard
          </a>
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          You're receiving this email because you have alerts enabled for r/${subredditName}.
          <br>
          <a href="${Env.NEXT_PUBLIC_APP_URL}/dashboard/pulse/settings" style="color: #9333ea;">Manage alert settings</a>
        </p>
      </div>
    `;

    const text = `
Sentiment Drop Detected

We detected a significant sentiment drop in r/${subredditName}.

Alert Details:
- Sentiment dropped by: ${dropPercent.toFixed(1)}%
- Previous sentiment: ${baselineSentiment.toFixed(2)}
- Current sentiment: ${currentSentiment.toFixed(2)}

View your dashboard: ${Env.NEXT_PUBLIC_APP_URL}/dashboard/pulse
    `;

    return this.sendEmail({
      to: userEmail,
      subject,
      html,
      text,
    });
  }

  /**
   * Send keyword spike alert email
   */
  async sendKeywordSpikeAlert(
    userEmail: string,
    subredditName: string,
    keyword: string,
    mentions: number,
  ) {
    const subject = `📈 Keyword Spike: "${keyword}" in r/${subredditName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9333ea;">Keyword Spike Detected</h2>
        <p>The keyword <strong>"${keyword}"</strong> is trending in <strong>r/${subredditName}</strong>.</p>

        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #f59e0b;">Spike Details</h3>
          <p style="margin: 0;"><strong>Mentions detected:</strong> ${mentions} times</p>
        </div>

        <p>This could indicate:</p>
        <ul>
          <li>Increased interest in this topic</li>
          <li>Breaking news or trending discussion</li>
          <li>Opportunity for engagement</li>
        </ul>

        <p>
          <a href="${Env.NEXT_PUBLIC_APP_URL}/dashboard/pulse"
             style="display: inline-block; background: #9333ea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            View Dashboard
          </a>
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          You're receiving this email because you're tracking "${keyword}" in r/${subredditName}.
        </p>
      </div>
    `;

    const text = `
Keyword Spike Detected

The keyword "${keyword}" is trending in r/${subredditName}.

Mentions detected: ${mentions} times

View your dashboard: ${Env.NEXT_PUBLIC_APP_URL}/dashboard/pulse
    `;

    return this.sendEmail({
      to: userEmail,
      subject,
      html,
      text,
    });
  }

  /**
   * Send weekly digest email
   */
  async sendWeeklyDigest(
    userEmail: string,
    subreddits: Array<{
      name: string;
      sentiment: number;
      trend: string;
      scans: number;
    }>,
  ) {
    const subject = '📊 Your Weekly SubredditPulse Digest';

    const subredditRows = subreddits.map(sub => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">r/${sub.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
          <span style="color: ${sub.sentiment > 0 ? '#059669' : sub.sentiment < 0 ? '#dc2626' : '#6b7280'};">
            ${sub.sentiment.toFixed(2)}
          </span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${sub.trend}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${sub.scans}</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9333ea;">Your Weekly Digest</h2>
        <p>Here's your weekly summary of subreddit sentiment tracking.</p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #9333ea;">Subreddit</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #9333ea;">Sentiment</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #9333ea;">Trend</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #9333ea;">Scans</th>
            </tr>
          </thead>
          <tbody>
            ${subredditRows}
          </tbody>
        </table>

        <p>
          <a href="${Env.NEXT_PUBLIC_APP_URL}/dashboard/pulse"
             style="display: inline-block; background: #9333ea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            View Full Dashboard
          </a>
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          You're receiving this weekly digest from SubredditPulse.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }
}

export const EmailNotifications = new EmailService();
