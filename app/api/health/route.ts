import { getCompanyOverview } from '@/lib/sectors';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await getCompanyOverview('BBCA');
    return Response.json({ ok: true, provider: 'Sectors API v2' });
  } catch (error) {
    const apiKey = process.env.SECTORS_API_KEY;
    const isConfigured = Boolean(apiKey && apiKey !== 'masukkan_api_key_sectors_di_sini');

    return Response.json(
      { 
        ok: false, 
        configured: isConfigured,
        provider: 'Sectors API v2', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: isConfigured ? 200 : 503 }
    );
  }
}