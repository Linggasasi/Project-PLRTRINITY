import { ShieldCheck, Swords, Target } from 'lucide-react';
import { formatIdr, pct } from '@/lib/utils';

type Metrics = {
  pe?: number | null;
  pbv?: number | null;
  roe?: number | null;
  der?: number | null;
  npm?: number | null;
  price?: number | null;
  marketCap?: number | null;
};

export function PitchbookCard({ ticker, company, metrics }: { ticker: string; company?: string; metrics?: Metrics }) {
  const m = metrics ?? {};
  const quality = (m.roe ?? 0) > 0.12 && (m.npm ?? 0) > 0.08;
  const balance = (m.der ?? 99) < 1.5;
  const valuation = (m.pe ?? 99) < 22 && (m.pbv ?? 99) < 4;
  const score = [quality, balance, valuation].filter(Boolean).length;
  const verdict = score >= 3 ? 'ACCUMULATE' : score >= 2 ? 'SELECTIVE BUY' : 'WATCH / AVOID';
  return (
    <section className="glass w-full rounded-2xl p-5 shadow-glow">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-400">Investment Thesis</p>
          <h3 className="mt-1 text-xl font-semibold text-white">{ticker} · {company ?? 'Company'}</h3>
        </div>
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-right">
          <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">CIO Verdict</div>
          <div className="mt-1 text-sm font-black text-emerald-200">{verdict}</div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white"><Swords className="h-4 w-4 text-emerald-400" /> Bull Case</div>
          <p className="mt-2 text-sm leading-6 text-slate-400">ROE {pct(m.roe)} dengan NPM {pct(m.npm)} mendukung quality profile{m.price ? `, sementara harga observasi ${formatIdr(m.price)}` : ''}. Leverage yang terkendali memperkuat durability earnings.</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white"><ShieldCheck className="h-4 w-4 text-amber-300" /> Bear Case</div>
          <p className="mt-2 text-sm leading-6 text-slate-400">Risiko utama datang dari multiple PER {m.pe?.toFixed(1) ?? '—'}× / PBV {m.pbv?.toFixed(1) ?? '—'}×, pressure margin, atau leverage DER {m.der?.toFixed(2) ?? '—'}×. Thesis harus diturunkan bila data baru membatalkan quality signal.</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500"><Target className="h-3.5 w-3.5" /> Evidence score {score}/3 · data-driven, not personalized advice</div>
    </section>
  );
}
