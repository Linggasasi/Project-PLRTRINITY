import { authenticateUser, setSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (typeof email !== 'string' || typeof password !== 'string') return Response.json({ error: 'Email dan password wajib diisi.' }, { status: 400 });
    const user = await authenticateUser(email, password);
    if (!user) return Response.json({ error: 'Email atau password salah.' }, { status: 401 });
    await setSession(user);
    return Response.json({ user: { name: user.name, email: user.email } });
  } catch {
    return Response.json({ error: 'Login gagal.' }, { status: 500 });
  }
}
