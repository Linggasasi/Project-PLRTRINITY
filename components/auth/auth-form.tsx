'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { ArrowRight, LockKeyhole, Mail, UserPlus } from 'lucide-react';

export function AuthForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? 'Pendaftaran gagal.');
      }

      const result = await signIn('credentials', { email, password, callbackUrl: '/' });
      if (result?.error) throw new Error('Email atau password salah.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Terjadi kesalahan.');
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-300"><span className="text-xl font-black">⌁</span></div>
        <div><div className="text-sm font-black tracking-[0.2em] text-white">IDX SENTINEL AI</div><div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Institutional intelligence</div></div>
      </div>
      <div className="mb-8"><p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Private market terminal</p><h1 className="text-4xl font-black tracking-tight text-white">{mode === 'login' ? 'Masuk ke ruang kerja Anda.' : 'Bangun akses analisis Anda.'}</h1><p className="mt-3 text-sm leading-6 text-slate-400">{mode === 'login' ? 'Lanjutkan ke terminal intelligence IDX dengan akun Anda.' : 'Daftar sekali untuk menyimpan akses ke workspace CIO.'}</p></div>
      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-xs leading-5 text-slate-400">Gunakan email dan password untuk masuk ke workspace Anda.</div>
      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === 'signup' ? <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 focus-within:border-emerald-400"><UserPlus className="h-4 w-4 text-slate-500" /><input required minLength={2} value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama lengkap" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600" /></label> : null}
        <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 focus-within:border-emerald-400"><Mail className="h-4 w-4 text-slate-500" /><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email kerja" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600" /></label>
        <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 focus-within:border-emerald-400"><LockKeyhole className="h-4 w-4 text-slate-500" /><input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password, minimal 8 karakter" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600" /></label>
        {error ? <p className="text-xs text-red-300">{error}</p> : null}
        <button disabled={loading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3.5 text-sm font-black text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50">{loading ? 'Memproses...' : mode === 'login' ? 'Masuk ke Terminal' : 'Buat Akun'}<ArrowRight className="h-4 w-4" /></button>
      </form>
      <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} className="mt-6 w-full text-center text-xs text-slate-500 transition hover:text-emerald-300">{mode === 'login' ? 'Belum punya akun? Daftar dengan email' : 'Sudah punya akun? Kembali ke login'}</button>
    </div>
  );
}
