import { getCompanyOverview } from '@/lib/sectors';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await getCompanyOverview('BBCA');
    return Response.json({ ok: true, provider: 'Sectors API v2' });
  } catch (error) {
    return Response.json(
      { ok: false, provider: 'Sectors API v2', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 503 },
    );
  }
}
