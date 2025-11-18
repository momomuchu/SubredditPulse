import type { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { db } from '@/libs/DB';
import { userCredits } from '@/models/Schema';

/**
 * GET /api/credits
 * Get user's credit balance
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user credits
    const [credits] = await db.select()
      .from(userCredits)
      .where(eq(userCredits.userId, session.user.id))
      .limit(1);

    if (!credits) {
      // Initialize credits for user
      const [newCredits] = await db.insert(userCredits)
        .values({
          userId: session.user.id,
          credits: 0,
        })
        .returning();

      return NextResponse.json({ credits: newCredits!.credits });
    }

    return NextResponse.json({ credits: credits.credits });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch credits' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/credits
 * Add credits to user account (typically called after successful payment)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid credit amount' },
        { status: 400 },
      );
    }

    // Get or create user credits
    const [existingCredits] = await db.select()
      .from(userCredits)
      .where(eq(userCredits.userId, session.user.id))
      .limit(1);

    if (existingCredits) {
      const [updated] = await db.update(userCredits)
        .set({
          credits: existingCredits.credits + amount,
        })
        .where(eq(userCredits.id, existingCredits.id))
        .returning();

      return NextResponse.json({
        credits: updated!.credits,
        message: `${amount} credits added successfully`,
      });
    }

    const [newCredits] = await db.insert(userCredits)
      .values({
        userId: session.user.id,
        credits: amount,
      })
      .returning();

    return NextResponse.json({
      credits: newCredits!.credits,
      message: `${amount} credits added successfully`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add credits' },
      { status: 500 },
    );
  }
}
