'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Point = { date: string; close: number; volume: number };

export function MomentumChart({ series }: { series: Point[] }) {
  if (!series?.length) return null;
  const data = series.map((point) => ({
    date: point.date.slice(5),
    close: point.close,
    volume: point.volume,
  }));
  return (
    <section className="glass rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Price & Volume Tape</div>
          <div className="mt-1 text-xs text-slate-600">45 latest Sectors observations</div>
        </div>
        <div className="flex gap-3 text-[10px] uppercase tracking-widest text-slate-500"><span className="text-emerald-300">Close</span><span className="text-amber-300">Volume</span></div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="closeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34d399" stopOpacity={0.3} /><stop offset="100%" stopColor="#34d399" stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#334155" strokeOpacity={0.25} />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis yAxisId="price" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} width={42} />
            <YAxis yAxisId="volume" orientation="right" hide />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 10, fontSize: 12 }} labelStyle={{ color: '#94a3b8' }} />
            <Area yAxisId="price" type="monotone" dataKey="close" name="Close" stroke="#34d399" fill="url(#closeFill)" strokeWidth={2} dot={false} />
            <Area yAxisId="volume" type="monotone" dataKey="volume" name="Volume" stroke="#f59e0b" fill="none" strokeOpacity={0.35} strokeWidth={1} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
