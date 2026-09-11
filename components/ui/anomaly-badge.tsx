import { AlertTriangle, Activity } from 'lucide-react';

export function AnomalyBadge({ multiple = 0, date, compact = false }: { multiple?: number | null; date?: string | null; compact?: boolean }) {
  const hot = multiple != null && multiple > 3;
  const classes = hot ? 'border-red-400/30 bg-red-500/10 text-red-200' : 'border-amber-400/30 bg-amber-500/10 text-amber-100';
  const Icon = hot ? AlertTriangle : Activity;
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${classes}`}>
      <Icon className="h-3.5 w-3.5" />
      {hot ? 'VOLUME ANOMALY' : 'MOMENTUM WATCH'}
      <span className="opacity-80">{multiple ? `${multiple.toFixed(1)}× 10D` : 'n/a'}</span>
      {!compact && date ? <span className="opacity-60">{date}</span> : null}
    </div>
  );
}
