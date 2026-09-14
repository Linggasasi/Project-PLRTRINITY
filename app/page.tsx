'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import { Activity, Bot, BrainCircuit, ChevronRight, CircleDollarSign, Clock3, Database, Gauge, Menu, Send, Shield, Sparkles, TrendingUp, X } from 'lucide-react';
import { PeerRadarChart } from '@/components/charts/peer-radar-chart';
import { AnomalyBadge } from '@/components/ui/anomaly-badge';
import { PitchbookCard } from '@/components/ui/pitchbook-card';
import { AuthButton } from '@/components/ui/auth-button';

const chips = [
  'Bandingkan BBCA vs BMRI',
  'Cek Anomali Volume TLKM',
  'Deep Dive Investment Thesis ASII',
];

function toolLabel(type: string) {
  return type.replace('tool-', '').split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
}

const promptBySection: Record<string, string> = {
  Terminal: 'Buat CIO market scan BBCA dengan evidence lengkap',
  Fundamentals: 'Analisis fundamentals BBCA secara detail',
  Momentum: 'Cek momentum teknikal BBCA',
  'Risk & Alerts': 'Cari risk dan anomaly terbaru BBCA',
};

export default function HomePage() {
  const [input, setInput] = useState('');
  const [railOpen, setRailOpen] = useState(true);
  const [apiOk, setApiOk] = useState<boolean | null>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [activeSection, setActiveSection] = useState('Terminal');
  const [directFundamentals, setDirectFundamentals] = useState<any>(null);
  const [directFundamentalsLoading, setDirectFundamentalsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/health')
      .then((response) => response.json())
      .then((data) => { if (active) setApiOk(Boolean(data.ok)); })
      .catch(() => { if (active) setApiOk(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date());
    updateTime();
    const interval = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const value = input.trim();
    if (!value || isLoading) return;
    if (value.toLowerCase().includes('fundamental')) {
      runPrompt(value);
      setInput('');
      return;
    }
    await sendMessage({ text: value });
    setInput('');
  }

  function runPrompt(prompt: string) {
    if (isLoading) return;
    if (prompt.toLowerCase().includes('fundamental')) {
      setActiveSection('Fundamentals');
      setDirectFundamentalsLoading(true);
      fetch('/api/fundamentals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticker: 'BBCA' }) })
        .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
        .then(({ ok, data }) => { if (!ok) throw new Error(data.error); setDirectFundamentals(data); })
        .catch((requestError) => setDirectFundamentals({ error: requestError instanceof Error ? requestError.message : 'Fundamentals unavailable.' }))
        .finally(() => setDirectFundamentalsLoading(false));
      return;
    }
    setActiveSection(prompt.toLowerCase().includes('momentum') ? 'Momentum' : 'Terminal');
    void sendMessage({ text: prompt });
  }

  const apiState = apiOk == null ? 'CHECKING' : apiOk ? 'LIVE' : 'CONFIG REQUIRED';

  return (
    <main className="min-h-screen bg-slate-950 bg-radial-grid bg-[size:22px_22px]">
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setRailOpen((v) => !v)} className="rounded-lg border border-slate-800 p-2 text-slate-400 hover:bg-slate-900 md:hidden">{railOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/10"><BrainCircuit className="h-5 w-5 text-emerald-400" /></div>
            <div>
              <div className="text-sm font-black tracking-[0.18em] text-white">IDX SENTINEL AI</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500">Institutional Financial Intelligence</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <time dateTime={currentTime?.toISOString()} className="hidden items-center gap-1.5 text-slate-400 md:flex" title="Waktu Jakarta">
              <Clock3 className="h-3.5 w-3.5 text-emerald-400" />
              {currentTime ? currentTime.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) : '--:--:--'} WIB
            </time>
            <div className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 md:flex ${apiOk ? 'border-emerald-400/20 bg-emerald-500/5 text-emerald-300' : 'border-amber-400/20 bg-amber-500/5 text-amber-200'}`}><span className={`h-2 w-2 rounded-full ${apiOk ? 'animate-pulse bg-emerald-400' : 'bg-amber-300'}`} />Sectors API {apiState}</div>
            <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-slate-400 md:flex"><CircleDollarSign className="h-3.5 w-3.5" />IDX / JAKARTA</div>
            <AuthButton />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 md:grid-cols-[250px_minmax(0,1fr)]">
        <aside className={`${railOpen ? 'block' : 'hidden'} border-r border-slate-800/70 bg-slate-950/55 p-4 md:block`}>
          <div className="space-y-2">
            {[
              ['Terminal', Gauge],
              ['Fundamentals', Database],
              ['Momentum', TrendingUp],
              ['Risk & Alerts', Shield],
            ].map(([label, Icon]: any) => (
              <button
                key={label}
                onClick={() => {
                  setActiveSection(label);
                  runPrompt(promptBySection[label]);
                  document
                    .getElementById('cio-workspace')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
                  activeSection === label
                    ? 'bg-emerald-500/10 text-emerald-300'
                    : 'text-slate-500 hover:bg-slate-900/70 hover:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </span>

                <ChevronRight
                  className={`h-3.5 w-3.5 transition-transform ${
                    activeSection === label ? 'translate-x-0.5 opacity-100' : 'opacity-40'
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/45 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400"><Activity className="h-3.5 w-3.5 text-amber-300" />Anomaly Stream</div>
            <div className="space-y-3 text-xs">
              {['TLKM · volume monitor armed', 'BBRI · valuation regime check', 'ASII · catalyst watch'].map((x, i) => <div key={x} className="flex items-center justify-between gap-3"><span className="text-slate-500">{x}</span><span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-amber-300' : 'bg-slate-700'}`} /></div>)}
            </div>
          </div>
        </aside>

        <section className="min-w-0 px-4 py-5 md:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Chief Investment Officer · Agentic Terminal</p>
                <h1 className="mt-1 text-3xl font-black tracking-tight text-white md:text-4xl">Find the signal before the market prices it.</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Synthesize Sectors fundamentals, news, peer structure, and price-volume momentum through one controlled AI workflow.</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs text-slate-500">Node runtime · Server-side secrets</div>
            </div>

            <div className="glass mb-4 rounded-2xl p-3">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500"><Sparkles className="h-3.5 w-3.5 text-emerald-400" />Quick prompts</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {chips.map((chip) => <button key={chip} onClick={() => runPrompt(chip)} disabled={isLoading} className="rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-emerald-400/30 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40">{chip}</button>)}
              </div>
            </div>

            <div id="cio-workspace" className="scroll-mt-24 space-y-4 pb-40">
            <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3">
  <div>
    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
      Active Desk
    </div>
    <div className="mt-1 text-sm font-semibold text-emerald-300">
      {activeSection}
    </div>
  </div>

  <div className="text-xs text-slate-600">
    CIO Intelligence Workspace
  </div>
</div>
              {messages.length === 0 ? (
                <div className="glass rounded-3xl p-7 md:p-10">
                  <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-white"><Bot className="h-5 w-5 text-emerald-400" />CIO Workspace Ready</div>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">Tulis pertanyaan pasar seperti analyst di desk institusional. Agent akan memilih tool yang relevan, menjalankan evidence retrieval, lalu menyusun verdict.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {['Fundamentals', 'Sentiment', 'Peers', 'Momentum'].map((x) => <div key={x} className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-center text-slate-400">{x}</div>)}
                    </div>
                  </div>
                </div>
              ) : null}

              {error ? (
                <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-4 text-sm text-amber-100">
                  <div className="font-semibold">Analisis belum dapat dijalankan.</div>
                  <p className="mt-1 text-xs leading-5 text-amber-200/80">
                    Kuota model AI sedang habis atau provider sedang membatasi request. Tunggu beberapa saat atau gunakan API key Gemini dengan quota aktif, lalu kirim ulang.
                  </p>
                </div>
              ) : null}

              {directFundamentalsLoading ? <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-400">Mengambil fundamentals BBCA dari Sectors API…</div> : null}
              {directFundamentals?.error ? <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-4 text-sm text-amber-100">Fundamentals belum tersedia: {directFundamentals.error}</div> : null}
              {directFundamentals?.metrics ? <PitchbookCard ticker={directFundamentals.ticker} company={directFundamentals.company} metrics={directFundamentals.metrics} /> : null}

              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`${message.role === 'user' ? 'max-w-2xl rounded-2xl border border-emerald-400/15 bg-emerald-500/10' : 'w-full'} p-4`}>
                    {message.role === 'user' ? (
                      <p className="text-sm leading-6 text-emerald-100">{(message.parts?.find((p: any) => p.type === 'text') as any)?.text ?? ''}</p>
                    ) : (
                      <div className="space-y-4">
                        {message.parts?.map((part: any, index: number) => {
                          if (part.type === 'text') return <div key={`${message.id}-text-${index}`} className="rounded-2xl border border-slate-800 bg-slate-900/45 p-4 text-sm leading-7 text-slate-300 whitespace-pre-wrap">{part.text}</div>;
                          if (part.type === 'step-start') return null;
                          if (part.type.startsWith('tool-')) {
                            const output = part.output;
                            if (part.state !== 'output-available') {
                              return <div key={`${message.id}-tool-${index}`} className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs text-slate-500"><Activity className="h-3.5 w-3.5 animate-pulse text-emerald-400" />Running {toolLabel(part.type)}…</div>;
                            }
                            if (part.type === 'tool-analyze_company_fundamentals') return <div key={`${message.id}-tool-${index}`} className="space-y-3"><PitchbookCard ticker={output?.ticker ?? part.input?.ticker ?? ''} company={output?.company} metrics={output?.metrics} /></div>;
                            if (part.type === 'tool-peer_comparison_analyzer') return <PeerRadarChart key={`${message.id}-tool-${index}`} data={output?.radar ?? []} />;
                            if (part.type === 'tool-technical_momentum_check') return <div key={`${message.id}-tool-${index}`} className="glass rounded-2xl p-4"><div className="mb-3 flex items-center justify-between gap-3"><div><div className="text-sm font-semibold text-white">{output?.ticker} · Technical Momentum</div><div className="text-xs text-slate-500">{output?.momentum?.date ?? 'Latest observation unavailable'}</div></div><AnomalyBadge multiple={output?.momentum?.volumeMultiple} date={output?.momentum?.date} /></div><div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">{[['Close', output?.momentum?.latestClose], ['SMA 20', output?.momentum?.sma20], ['SMA 50', output?.momentum?.sma50], ['Volume vs 10D', output?.momentum?.volumeMultiple ? `${output.momentum.volumeMultiple.toFixed(2)}×` : '—']].map(([k,v]) => <div key={k as string} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"><div className="text-slate-500">{k}</div><div className="mt-1 font-semibold text-slate-200">{typeof v === 'number' ? v.toLocaleString('id-ID') : v}</div></div>)}</div></div>;
                            if (part.type === 'tool-cio_market_scan') { const e = output?.evidence; return <div key={`${message.id}-tool-${index}`} className="glass rounded-2xl border-emerald-400/20 p-4"><div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400">CIO Orchestrated Scan</div><div className="mt-1 text-lg font-semibold text-white">{output?.ticker} · Evidence Matrix</div><div className="text-xs text-slate-500">Generated {output?.generatedAt ? new Date(output.generatedAt).toLocaleString('id-ID') : '—'}</div></div><div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200">{output?.completedChecks ?? 0}/{output?.totalChecks ?? 4} checks complete</div></div><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{[['Fundamentals', e?.fundamentals ? 'Verified' : 'Unavailable'], ['Momentum', e?.momentum ? 'Verified' : 'Unavailable'], ['Sentiment', e?.sentiment ? e.sentiment.label : 'Unavailable'], ['Peers', e?.peers?.length ? `${e.peers.length} peers` : 'Unavailable']].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"><div className="text-xs text-slate-500">{label}</div><div className="mt-1 text-sm font-semibold text-slate-200">{value}</div></div>)}</div>{output?.limitations?.length ? <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-500/5 p-3 text-xs text-amber-200">Limitations: {output.limitations.join(' ')}</div> : null}<div className="mt-3 text-[11px] text-slate-500">Sources: {output?.sources?.join(' · ')}</div></div>; }
                            if (part.type === 'tool-get_market_sentiment') { const s = output?.sentiment; return <div key={`${message.id}-tool-${index}`} className="glass rounded-2xl p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-sm font-semibold text-white">{output?.ticker} · Market Sentiment</div><div className="text-xs text-slate-500">{s?.sampleSize ?? 0} filtered news samples</div></div><div className={`rounded-full border px-3 py-1.5 text-xs font-bold ${s?.label === 'Bullish' ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200' : s?.label === 'Bearish' ? 'border-red-400/30 bg-red-500/10 text-red-200' : 'border-slate-700 bg-slate-800/60 text-slate-300'}`}>{s?.label ?? 'Neutral'} · {s?.confidence ? `${Math.round(s.confidence * 100)}% conf.` : 'n/a'}</div></div></div>; }
                            return <div key={`${message.id}-tool-${index}`} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-xs text-slate-500">{toolLabel(part.type)} completed.</div>;
                          }
                          return null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-800/80 bg-slate-950/88 backdrop-blur-xl md:left-[250px]">
        <div className="mx-auto max-w-5xl px-4 py-3 md:px-8">
          <form onSubmit={onSubmit} className="glass flex items-end gap-2 rounded-2xl p-2">
            <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); (e.currentTarget.form as HTMLFormElement)?.requestSubmit(); } }} rows={1} placeholder="Ask the CIO about an IDX ticker, valuation, peers, sentiment, or momentum…" className="min-h-12 flex-1 resize-none bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600" />
            <button type="submit" disabled={!input.trim() || isLoading} className="flex h-12 items-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"><Send className="h-4 w-4" />{isLoading ? 'Analyzing' : 'Send'}</button>
          </form>
          <div className="mt-2 flex items-center justify-between px-1 text-[10px] uppercase tracking-widest text-slate-600"><span>AI outputs are analytical, not financial advice.</span><span>Sectors API v2 · Gemini</span></div>
        </div>
      </div>
    </main>
  );
}
