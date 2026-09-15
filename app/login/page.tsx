'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Activity, BarChart3, ShieldCheck } from 'lucide-react';
import { AuthForm } from '@/components/auth/auth-form';

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => { if (status === 'authenticated') router.replace('/'); }, [router, status]);

  return (
    <main className="min-h-screen bg-slate-950 text-white lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.85fr)]">
      <section className="relative hidden overflow-hidden border-r border-slate-800/80 lg:flex lg:flex-col lg:justify-between lg:p-12"><div className="absolute inset-0 bg-radial-grid bg-[size:26px_26px] opacity-70" /><div className="relative"><div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400"><span className="h-2 w-2 rounded-full bg-emerald-400" />Private intelligence desk</div><h2 className="mt-20 max-w-xl text-6xl font-black leading-[0.95]">See the signal<br /><span className="text-emerald-400">before the price.</span></h2><p className="mt-7 max-w-md text-base leading-7 text-slate-400">Satu workspace untuk membaca fundamentals, peer structure, sentiment, dan momentum pasar IDX.</p></div><div className="relative grid max-w-xl grid-cols-3 gap-3"><div className="border-l border-emerald-400/40 pl-4"><BarChart3 className="mb-3 h-5 w-5 text-emerald-400" /><div className="text-sm font-bold">Evidence-led</div><div className="mt-1 text-xs text-slate-500">Data sebelum opini</div></div><div className="border-l border-slate-700 pl-4"><Activity className="mb-3 h-5 w-5 text-slate-400" /><div className="text-sm font-bold">Live workflow</div><div className="mt-1 text-xs text-slate-500">Signal dalam konteks</div></div><div className="border-l border-slate-700 pl-4"><ShieldCheck className="mb-3 h-5 w-5 text-slate-400" /><div className="text-sm font-bold">Controlled</div><div className="mt-1 text-xs text-slate-500">Desk pribadi Anda</div></div></div></section>
      <section className="flex min-h-screen flex-col px-6 py-8 sm:px-12 lg:justify-center lg:px-20"><AuthForm /><p className="mt-10 max-w-md text-[10px] uppercase leading-5 tracking-[0.16em] text-slate-600">Dengan melanjutkan, Anda menyetujui penggunaan workspace analitis IDX Sentinel AI.</p></section>
    </main>
  );
}
