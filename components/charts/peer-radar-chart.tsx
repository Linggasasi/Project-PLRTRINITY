'use client';

import { Bar, BarChart, CartesianGrid, Legend, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Peer = { ticker: string; PE: number | null; PBV: number | null; ROE: number | null; NPM: number | null; DER: number | null };

export function PeerRadarChart({ data }: { data: Peer[] }) {
  if (!data?.length) return null;
  const clean = data.map((d) => ({ ...d, ROE: d.ROE ?? 0, NPM: d.NPM ?? 0, PE: d.PE ?? 0, PBV: d.PBV ?? 0, DER: d.DER ?? 0 }));
  const radar = clean.map((d) => ({ metric: d.ticker, PE: d.PE, PBV: d.PBV, ROE: d.ROE, NPM: d.NPM, DER: d.DER }));
  const bar = clean.map((d) => ({ ticker: d.ticker, ROE: d.ROE, NPM: d.NPM * 1 }));
  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
      <div className="glass rounded-2xl p-4">
        <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Peer Radar</div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radar}>
              <PolarGrid strokeOpacity={0.18} />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Radar name="ROE" dataKey="ROE" stroke="#34d399" fill="#34d399" fillOpacity={0.16} />
              <Radar name="NPM" dataKey="NPM" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.10} />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="glass rounded-2xl p-4">
        <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Profitability Bar</div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bar}>
              <CartesianGrid vertical={false} strokeOpacity={0.08} />
              <XAxis dataKey="ticker" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="ROE" fill="#34d399" radius={[5,5,0,0]} />
              <Bar dataKey="NPM" fill="#f59e0b" radius={[5,5,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="glass rounded-2xl p-4 xl:col-span-2">
        <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Comparative Matrix</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="text-slate-600">
              <tr className="border-b border-slate-800">
                <th className="px-3 py-2 font-medium">Ticker</th>
                <th className="px-3 py-2 font-medium">PE</th>
                <th className="px-3 py-2 font-medium">PBV</th>
                <th className="px-3 py-2 font-medium">ROE</th>
                <th className="px-3 py-2 font-medium">NPM</th>
                <th className="px-3 py-2 font-medium">DER</th>
              </tr>
            </thead>
            <tbody>
              {clean.map((row) => (
                <tr key={row.ticker} className="border-b border-slate-900">
                  <td className="px-3 py-2 font-bold text-emerald-300">{row.ticker}</td>
                  <td className="px-3 py-2 text-slate-300">{row.PE ? row.PE.toFixed(1) : '—'}</td>
                  <td className="px-3 py-2 text-slate-300">{row.PBV ? row.PBV.toFixed(1) : '—'}</td>
                  <td className="px-3 py-2 text-slate-300">{row.ROE ? `${row.ROE.toFixed(1)}%` : '—'}</td>
                  <td className="px-3 py-2 text-slate-300">{row.NPM ? `${row.NPM.toFixed(1)}%` : '—'}</td>
                  <td className="px-3 py-2 text-slate-300">{row.DER ? row.DER.toFixed(2) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
