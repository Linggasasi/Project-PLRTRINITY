import { calculateFundamentals } from '@/lib/analysis';
import { getCompanyFinancials } from '@/lib/sectors';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    if (!(await getServerSession(authOptions))) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { ticker = 'BBCA' } = await request.json();
    const normalized = String(ticker).trim().toUpperCase().replace(/\.JK$/i, '');
    const report = await getCompanyFinancials(normalized);
    return Response.json({
      ticker: normalized,
      company: report.company_name ?? report.name ?? normalized,
      metrics: calculateFundamentals(report),
      source: 'Sectors Financial API v2',
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Fundamentals unavailable.' },
      { status: 502 },
    );
  }
}
