import { NextResponse } from 'next/server';
import { swaggerSpec } from '@/libs/Swagger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Get OpenAPI specification
 *     description: Returns the OpenAPI specification in JSON format
 *     tags: [System]
 *     responses:
 *       200:
 *         description: OpenAPI specification
 */
export async function GET() {
  return NextResponse.json(swaggerSpec, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
