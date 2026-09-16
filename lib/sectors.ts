import 'server-only';

const BASE_URL = 'https://api.sectors.app';

type Json = Record<string, unknown> | unknown[];

export type DailyTransaction = {
  symbol: string;
  date: string;
  close: number;
  volume: number;
  market_cap: number;
};

export type CompanyReport = {
  symbol?: string;
  company_name?: string;
  name?: string;
  overview?: Record<string, unknown>;
  valuation?: Record<string, unknown>;
  financials?: Record<string, unknown>;
  peers?: Record<string, unknown> | unknown[];
  future?: Record<string, unknown>;
  dividend?: Record<string, unknown>;
  raw?: Json;
};

export type SectorsNewsItem = {
  id?: string | number;
  title?: string;
  body?: string;
  source?: string;
  timestamp?: string;
  published_at?: string;
  symbol?: string;
  symbols?: string[];
};

function getApiKey() {
  const apiKey = process.env.SECTORS_API_KEY;
  if (!apiKey || apiKey === 'masukkan_api_key_sectors_di_sini') {
    throw new Error('SECTORS_API_KEY belum diisi.');
  }
  return apiKey;
}

function normalizeTicker(ticker: string) {
  return ticker.trim().toUpperCase().replace(/\.JK$/i, '');
}

async function sectorsFetch<T extends Json>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Authorization': getApiKey(), // Diubah dari 'X-API-KEY' menjadi 'Authorization'
        'Accept': 'application/json',
        ...(init?.headers ?? {}),
      },
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Sectors API ${response.status}: ${body.slice(0, 240)}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Sectors API timeout setelah 20 detik.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function pickRecord(report: CompanyReport, keys: string[]) {
  for (const key of keys) {
    const value = report[key as keyof CompanyReport];
    if (value && typeof value === 'object') return value as Record<string, unknown>;
  }
  return undefined;
}

export async function getCompanyOverview(ticker: string) {
  const t = normalizeTicker(ticker);
  const data = await sectorsFetch<CompanyReport>(`/v2/company/report/${encodeURIComponent(t)}/?sections=overview,valuation`);
  return { ticker: t, ...data, overview: pickRecord(data, ['overview']), valuation: pickRecord(data, ['valuation']) };
}

export async function getCompanyFinancials(ticker: string) {
  const t = normalizeTicker(ticker);
  const data = await sectorsFetch<CompanyReport>(`/v2/company/report/${encodeURIComponent(t)}/?sections=financials,valuation,overview`);
  return { ticker: t, ...data, financials: pickRecord(data, ['financials']), valuation: pickRecord(data, ['valuation']) };
}

export async function getSectorPeers(ticker: string) {
  const t = normalizeTicker(ticker);
  const data = await sectorsFetch<CompanyReport>(`/v2/company/report/${encodeURIComponent(t)}/?sections=peers,financials,valuation,overview`);
  return { ticker: t, ...data, peers: data.peers ?? [] };
}

export async function getDailyTransaction(ticker: string, days = 60) {
  const t = normalizeTicker(ticker);
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - Math.min(Math.max(days, 10), 90));
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  
  const rawData = await sectorsFetch<Json>(
    `/v2/daily/${encodeURIComponent(t)}/?start=${fmt(start)}&end=${fmt(end)}`
  );

  if (Array.isArray(rawData)) {
    return rawData as DailyTransaction[];
  }
  if (rawData && typeof rawData === 'object' && 'data' in rawData && Array.isArray((rawData as { data: unknown }).data)) {
    return (rawData as { data: DailyTransaction[] }).data;
  }

  return [];
}

export async function getLatestNews(ticker: string, limit = 18) {
  const normalized = normalizeTicker(ticker);
  const data = await sectorsFetch<Json>(`/v2/news/?extension=idx&limit=${Math.min(Math.max(limit, 5), 50)}`);
  const rows = Array.isArray(data) ? data : Array.isArray((data as Record<string, unknown>)?.results) ? ((data as Record<string, unknown>).results as unknown[]) : [];
  return (rows as SectorsNewsItem[])
    .filter((item) => {
      const symbols = [item.symbol, ...(Array.isArray(item.symbols) ? item.symbols : [])].filter(Boolean).map((x) => String(x).toUpperCase().replace(/\.JK$/i, ''));
      return symbols.includes(normalized);
    })
    .slice(0, limit);
}