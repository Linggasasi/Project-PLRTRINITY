'use client';

import { FormEvent, useState } from 'react';
import { BrainCircuit, LoaderCircle, LogIn, UserPlus } from 'lucide-react';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'signup' ? { name, email, password } : { email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Autentikasi gagal.');
      window.location.assign(new URLSearchParams(window.location.search).get('next') || '/');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Autentikasi gagal.');
    } finally {
      setLoading(false);
    }
  }

  const isSignup = mode === 'signup';
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 bg-radial-grid bg-[size:22px_22px] px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-7 shadow-2xl backdrop-blur-xl md:p-9">
        <div className="mb-8 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-500/10"><BrainCircuit className="h-6 w-6 text-emerald-400" /></div><div><div className="text-sm font-black tracking-[0.18em] text-white">IDX SENTINEL AI</div><div className="text-[10px] uppercase tracking-widest text-slate-500">Institutional Financial Intelligence</div></div></div>
        <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Secure access</p><h1 className="mt-2 text-3xl font-black text-white">{isSignup ? 'Create your desk' : 'Welcome back'}</h1><p className="mt-2 text-sm leading-6 text-slate-500">{isSignup ? 'Buat akun untuk mengakses CIO Intelligence Workspace.' : 'Login untuk membuka CIO Intelligence Workspace.'}</p></div>
        <form onSubmit={onSubmit} className="space-y-4">
          {isSignup ? <label className="block text-sm text-slate-400">Nama<input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-emerald-400" /></label> : null}
          <label className="block text-sm text-slate-400">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-emerald-400" /></label>
          <label className="block text-sm text-slate-400">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-emerald-400" /></label>
          {error ? <div className="rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div> : null}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50">{loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : isSignup ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}{loading ? 'Processing' : isSignup ? 'Create account' : 'Login'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">{isSignup ? 'Sudah punya akun?' : 'Belum punya akun?'} <a className="font-semibold text-emerald-300 hover:text-emerald-200" href={isSignup ? '/login' : '/signup'}>{isSignup ? 'Login' : 'Sign up'}</a></p>
      </section>
    </main>
  );
}
