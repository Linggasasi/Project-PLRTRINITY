import { analyzeMomentum, calculateFundamentals, extractPeerRows, sentimentFromNews } from './analysis';
import { getCompanyFinancials, getDailyTransaction, getLatestNews, getSectorPeers } from './sectors';

export type CioScanResult = {
  ticker: string;
  generatedAt: string;
  evidence: {
    fundamentals: ReturnType<typeof calculateFundamentals> | null;
    momentum: ReturnType<typeof analyzeMomentum> | null;
    sentiment: ReturnType<typeof sentimentFromNews> | null;
    peers: ReturnType<typeof extractPeerRows>;
  };
  sources: string[];
  limitations: string[];
  completedChecks: number;
  totalChecks: number;
};

export async function runCioScan(ticker: string): Promise<CioScanResult> {
  const normalized = ticker.trim().toUpperCase().replace(/\.JK$/i, '');
  const [fundamentalsResult, momentumResult, sentimentResult, peersResult] = await Promise.allSettled([
    getCompanyFinancials(normalized),
    getDailyTransaction(normalized, 60),
    getLatestNews(normalized, 18),
    getSectorPeers(normalized),
  ]);
  const limitations: string[] = [];
  const sources: string[] = [];
  let completedChecks = 0;

  const fundamentals = fundamentalsResult.status === 'fulfilled'
    ? calculateFundamentals(fundamentalsResult.value)
    : null;
  if (fundamentals) {
    completedChecks += 1;
    sources.push('Sectors /v2/company/report financials, valuation, overview');
  } else {
    limitations.push('Fundamentals unavailable for this ticker.');
  }

  const momentum = momentumResult.status === 'fulfilled'
    ? analyzeMomentum(momentumResult.value)
    : null;
  if (momentum) {
    completedChecks += 1;
    sources.push('Sectors /v2/daily price and volume history');
  } else {
    limitations.push('Price and volume history unavailable for this ticker.');
  }

  const sentiment = sentimentResult.status === 'fulfilled'
    ? sentimentFromNews(sentimentResult.value)
    : null;
  if (sentiment) {
    completedChecks += 1;
    sources.push('Sectors /v2/news filtered by ticker');
  } else {
    limitations.push('News sentiment unavailable for this ticker.');
  }

  const peers = peersResult.status === 'fulfilled'
    ? extractPeerRows(peersResult.value.peers, normalized)
    : [];
  if (peersResult.status === 'fulfilled') {
    completedChecks += 1;
    sources.push('Sectors /v2/company/report peers');
  } else {
    limitations.push('Peer comparison unavailable for this ticker.');
  }

  return {
    ticker: normalized,
    generatedAt: new Date().toISOString(),
    evidence: { fundamentals, momentum, sentiment, peers },
    sources,
    limitations,
    completedChecks,
    totalChecks: 4,
  };
}
