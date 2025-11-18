import { NextResponse } from 'next/server';
import { sendDailyReport } from '@/libs/DailyReport';
import { logger } from '@/libs/Logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/reports/daily:
 *   post:
 *     summary: Trigger daily report
 *     description: Generates and sends the daily application report to Discord
 *     tags: [Reports]
 *     security:
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: Report sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - Invalid or missing authorization
 *       500:
 *         description: Internal server error
 */
export async function POST(request: Request) {
  // Optional: Add authorization check
  // This prevents unauthorized access to the endpoint
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    logger.warn('Unauthorized attempt to trigger daily report');
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 },
    );
  }

  try {
    logger.info('Daily report triggered via API');
    const success = await sendDailyReport();

    if (success) {
      return NextResponse.json(
        { success: true, message: 'Daily report sent successfully' },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to send daily report' },
      { status: 500 },
    );
  } catch (error) {
    logger.error('Error triggering daily report', { error });
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * GET endpoint for testing - can be removed in production
 */
export async function GET(request: Request) {
  // Optional: Add authorization check
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    logger.warn('Unauthorized attempt to trigger daily report');
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 },
    );
  }

  try {
    logger.info('Daily report triggered via API (GET - testing)');
    const success = await sendDailyReport();

    if (success) {
      return NextResponse.json(
        { success: true, message: 'Daily report sent successfully' },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to send daily report' },
      { status: 500 },
    );
  } catch (error) {
    logger.error('Error triggering daily report', { error });
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}
