import { analyzeMomentum } from '@/lib/analysis';
import { getDailyTransaction } from '@/lib/sectors';
import { requireSession } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    await requireSession();
    const { ticker = 'BBCA', days = 60 } = await request.json();
    const normalized = String(ticker).trim().toUpperCase().replace(/\.JK$/i, '');
    const transactions = await getDailyTransaction(normalized, Number(days));
    return Response.json({
      ticker: normalized,
      momentum: analyzeMomentum(transactions),
      series: transactions.slice(-45),
      fetchedAt: new Date().toISOString(),
      source: 'Sectors Financial API v2 /daily',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') return Response.json({ error: 'Unauthorized' }, { status: 401 });
    return Response.json(
      { error: error instanceof Error ? error.message : 'Momentum unavailable.' },
      { status: 502 },
    );
  }
}
