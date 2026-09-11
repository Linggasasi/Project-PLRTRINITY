import type { CompanyReport, DailyTransaction, SectorsNewsItem } from './sectors';

function num(value: unknown) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function dig(obj: unknown, keys: string[]): number | null {
  let current: any = obj;
  for (const key of keys) {
    if (!current || typeof current !== 'object') return null;
    current = current[key];
  }
  return num(current);
}

export function latestFinancials(report: CompanyReport) {
  const historical = report.financials?.historical_financials;
  if (Array.isArray(historical) && historical.length) {
    return historical[historical.length - 1] as Record<string, unknown>;
  }
  return report.financials ?? {};
}

export function calculateFundamentals(report: CompanyReport) {
  const financial = latestFinancials(report);
  const valuation = report.valuation ?? {};
  const overview = report.overview ?? {};
  const revenue = num(financial.revenue) ?? num(financial.total_revenue);
  const earnings = num(financial.earnings) ?? num(financial.net_income) ?? num(financial.net_profit);
  const equity = num(financial.equity) ?? num(financial.total_equity);
  const liabilities = num(financial.liabilities) ?? num(financial.total_liabilities);
  const eps = num(financial.eps) ?? num(valuation.eps);
  const price = num(valuation.price) ?? num(overview.price) ?? num(overview.close);
  const marketCap = num(valuation.market_cap) ?? num(overview.market_cap);

  const pe = num(valuation.pe) ?? num(valuation.per) ?? (price != null && eps ? price / eps : marketCap != null && earnings ? marketCap / earnings : null);
  const pb = num(valuation.pb) ?? num(valuation.pbv) ?? (marketCap != null && equity ? marketCap / equity : null);
  const roe = num(financial.roe) ?? (earnings != null && equity ? earnings / equity : null);
  const der = num(financial.der) ?? num(financial.debt_to_equity) ?? (liabilities != null && equity ? liabilities / equity : null);
  const npm = num(financial.npm) ?? (earnings != null && revenue ? earnings / revenue : null);

  return {
    year: financial.year ?? financial.fiscal_year ?? null,
    pe,
    pbv: pb,
    roe,
    der,
    npm,
    price,
    eps,
    revenue,
    earnings,
    equity,
    liabilities,
    marketCap,
  };
}

export function analyzeMomentum(rows: DailyTransaction[]) {
  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));
  const closes = sorted.map((r) => r.close).filter((v) => Number.isFinite(v));
  const sma = (values: number[], window: number) => values.length < window ? null : values.slice(-window).reduce((a, b) => a + b, 0) / window;
  const sma20 = sma(closes, 20);
  const sma50 = sma(closes, 50);
  const volumes = sorted.map((r) => r.volume).filter((v) => Number.isFinite(v));
  const latestVolume = volumes.at(-1) ?? null;
  const baseline = volumes.length >= 11 ? volumes.slice(-11, -1).reduce((a, b) => a + b, 0) / 10 : null;
  const volumeMultiple = baseline ? latestVolume! / baseline : null;
  const anomaly = volumeMultiple != null && volumeMultiple > 3;

  return {
    latestClose: closes.at(-1) ?? null,
    sma20,
    sma50,
    latestVolume,
    baselineVolume10d: baseline,
    volumeMultiple,
    anomaly,
    date: sorted.at(-1)?.date ?? null,
  };
}

export function sentimentFromNews(news: SectorsNewsItem[]) {
  const positive = ['acquire', 'acquisition', 'profit', 'growth', 'dividend', 'buyback', 'contract', 'expansion', 'surge', 'upgrade', 'positive', 'record'];
  const negative = ['fraud', 'lawsuit', 'loss', 'decline', 'downgrade', 'investigation', 'default', 'cut', 'negative', 'warning', 'debt'];
  let score = 0;
  let samples = 0;

  for (const item of news) {
    const text = `${item.title ?? ''} ${item.body ?? ''}`.toLowerCase();
    if (!text.trim()) continue;
    samples += 1;
    score += positive.filter((w) => text.includes(w)).length;
    score -= negative.filter((w) => text.includes(w)).length;
  }

  const normalized = Math.max(-1, Math.min(1, samples ? score / Math.max(samples, 3) : 0));
  const label = normalized > 0.18 ? 'Bullish' : normalized < -0.18 ? 'Bearish' : 'Neutral';
  const confidence = Math.min(0.95, 0.45 + Math.min(0.45, Math.abs(normalized) * 0.7) + Math.min(0.1, samples * 0.01));
  return { label, score: normalized, confidence, sampleSize: samples };
}

export function extractPeerRows(raw: unknown, subjectTicker: string) {
  const candidates: any[] = Array.isArray(raw) ? raw : raw && typeof raw === 'object' ? Object.values(raw as Record<string, unknown>) : [];
  return candidates.flatMap((item) => {
    if (Array.isArray(item)) return item as any[];
    return item && typeof item === 'object' ? [item] : [];
  }).map((peer) => ({
    ticker: String(peer.symbol ?? peer.ticker ?? peer.company_symbol ?? '').replace(/\.JK$/i, '').toUpperCase(),
    name: String(peer.company_name ?? peer.name ?? peer.company ?? 'Peer'),
    pe: num(peer.pe ?? peer.per),
    pbv: num(peer.pb ?? peer.pbv),
    roe: num(peer.roe),
    der: num(peer.der ?? peer.debt_to_equity),
    npm: num(peer.npm),
  })).filter((peer) => peer.ticker && peer.ticker !== subjectTicker).slice(0, 3);
}
