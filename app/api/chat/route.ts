import { createOpenAI } from '@ai-sdk/openai';

const customOpenAI = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL || 'https://core.snifoxai.com/v1',
  apiKey: process.env.OPENAI_API_KEY,
});
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from 'ai';
import { z } from 'zod';
import { calculateFundamentals, analyzeMomentum, extractPeerRows, sentimentFromNews } from '@/lib/analysis';
import { runCioScan } from '@/lib/orchestrator';
import { getCompanyFinancials, getDailyTransaction, getLatestNews, getSectorPeers } from '@/lib/sectors';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM_PROMPT = `
You are IDX Sentinel AI, acting as a Chief Investment Officer (CIO) and senior equity analyst specializing in the Indonesia Stock Exchange (IDX).

Operating mandate:
- Use Sectors Financial API tools as the primary source of market evidence. Never invent live figures.
- Separate verified data from interpretation. Always identify the ticker and relevant observation date/year.
- Analyze valuation, quality, momentum, peers, catalysts, and risks.
- For financial ratios, show the formula and the exact source fields used when possible.
- Be skeptical: flag data gaps, stale observations, contradictory signals, and model uncertainty.
- Do not give personalized financial advice or guarantee returns.
- Be concise but institutional-grade. Use markdown tables when comparisons are dense.

Tool routing:
1) Fundamentals / investment thesis -> analyze_company_fundamentals
2) News / market mood -> get_market_sentiment
3) Compare competitors -> peer_comparison_analyzer
4) Price/volume trend or anomalies -> technical_momentum_check

When a question spans multiple dimensions, use multiple tools and synthesize them into one CIO view.
`;

const tickerSchema = z.object({
  ticker: z.string().min(2).max(10).describe('IDX ticker such as BBCA, BMRI, TLKM, ASII'),
});

export async function POST(req: Request) {
  try {
    if (!(await getServerSession(authOptions))) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    const { messages }: { messages: UIMessage[] } = await req.json();
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: customOpenAI.chat(process.env.OPENAI_MODEL || 'gpt-4o-mini'),
    system: SYSTEM_PROMPT,
      messages: modelMessages,
      temperature: 0.15,
      maxRetries: 0,
      stopWhen: stepCountIs(6),
      onError: ({ error }) => {
        console.error('AI stream error:', error);
      },
      tools: {
        analyze_company_fundamentals: tool({
          description: 'Fetch Sectors company financials and calculate PER, PBV, ROE, DER, and NPM with transparent formulas.',
          inputSchema: tickerSchema,
          execute: async ({ ticker }) => {
            const report = await getCompanyFinancials(ticker);
            const metrics = calculateFundamentals(report);
            return {
              tool: 'analyze_company_fundamentals',
              ticker: metrics ? ticker.toUpperCase() : ticker,
              company: report.company_name ?? report.name ?? ticker.toUpperCase(),
              metrics,
              formulas: {
                PER: 'Price / EPS atau Market Cap / Net Income',
                PBV: 'Market Cap / Equity',
                ROE: 'Net Income / Equity',
                DER: 'Total Liabilities / Equity',
                NPM: 'Net Income / Revenue',
              },
              source: 'Sectors Financial API v2',
            };
          },
        }),
        get_market_sentiment: tool({
          description: 'Read latest IDX company news from Sectors, classify sentiment Bullish/Bearish/Neutral, and provide confidence.',
          inputSchema: tickerSchema,
          execute: async ({ ticker }) => {
            const news = await getLatestNews(ticker, 18);
            return {
              tool: 'get_market_sentiment',
              ticker: ticker.toUpperCase(),
              sentiment: sentimentFromNews(news),
              news: news.slice(0, 8),
              source: 'Sectors Financial API v2 /news',
            };
          },
        }),
        peer_comparison_analyzer: tool({
          description: 'Map a stock against up to three major sector peers using valuation and profitability metrics.',
          inputSchema: tickerSchema,
          execute: async ({ ticker }) => {
            const report = await getSectorPeers(ticker);
            const subjectMetrics = calculateFundamentals(report);
            const peers = extractPeerRows(report.peers, ticker.toUpperCase().replace(/\.JK$/i, ''));
            const rows = [
              { ticker: ticker.toUpperCase(), name: report.company_name ?? report.name ?? ticker.toUpperCase(), pe: subjectMetrics.pe, pbv: subjectMetrics.pbv, roe: subjectMetrics.roe, der: subjectMetrics.der, npm: subjectMetrics.npm },
              ...peers,
            ];
            return {
              tool: 'peer_comparison_analyzer',
              ticker: ticker.toUpperCase(),
              peers: rows,
              radar: rows.map((row) => ({ ticker: row.ticker, PE: row.pe, PBV: row.pbv, ROE: row.roe != null ? row.roe * 100 : null, NPM: row.npm != null ? row.npm * 100 : null, DER: row.der })),
              source: 'Sectors Financial API v2 / company report peers',
            };
          },
        }),
        technical_momentum_check: tool({
          description: 'Calculate SMA20, SMA50, and detect abnormal volume spikes above 300% of the 10-day baseline.',
          inputSchema: tickerSchema,
          execute: async ({ ticker }) => {
            const transactions = await getDailyTransaction(ticker, 60);
            const momentum = analyzeMomentum(transactions);
            return {
              tool: 'technical_momentum_check',
              ticker: ticker.toUpperCase(),
              momentum,
              series: transactions.slice(-30),
              source: 'Sectors Financial API v2 /daily',
            };
          },
        }),
        cio_market_scan: tool({
          description: 'Run a coordinated CIO market scan across fundamentals, price-volume momentum, news sentiment, and sector peers. Use this for a complete evidence-backed view of an IDX ticker.',
          inputSchema: tickerSchema,
          execute: async ({ ticker }) => ({
            tool: 'cio_market_scan',
            ...(await runCioScan(ticker)),
          }),
        }),
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
