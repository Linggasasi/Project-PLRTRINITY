import { createUser, setSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    if (typeof name !== 'string' || name.trim().length < 2) return Response.json({ error: 'Nama minimal 2 karakter.' }, { status: 400 });
    if (typeof email !== 'string' || !email.includes('@')) return Response.json({ error: 'Email tidak valid.' }, { status: 400 });
    if (typeof password !== 'string' || password.length < 8) return Response.json({ error: 'Password minimal 8 karakter.' }, { status: 400 });
    const user = await createUser(name, email, password);
    await setSession(user);
    return Response.json({ user: { name: user.name, email: user.email } }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Signup gagal.' }, { status: 400 });
  }
}
