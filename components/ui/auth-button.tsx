'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { LogIn, LogOut } from 'lucide-react';

export function AuthButton() {
  const { data: session, status } = useSession();
  async function handleSignOut() {
    await signOut({ callbackUrl: '/login' });
  }

  if (status === 'loading') return <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-900" />;
  if (session?.user) {
    return <button onClick={handleSignOut} className="flex items-center gap-2 rounded-lg border border-slate-800 px-3 py-2 text-xs text-slate-300 transition hover:border-slate-700 hover:bg-slate-900" title="Keluar dari akun">{session.user.image ? <img src={session.user.image} alt="" className="h-5 w-5 rounded-full" /> : null}<span className="hidden max-w-24 truncate sm:inline">{session.user.name ?? session.user.email}</span><LogOut className="h-3.5 w-3.5" /><span className="sm:hidden">Keluar</span></button>;
  }

  return <Link href="/login" className="flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-400"><LogIn className="h-3.5 w-3.5" /> Masuk</Link>;
}
