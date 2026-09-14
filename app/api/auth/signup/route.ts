import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  try {
    const input = signupSchema.parse(await request.json());
    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
    if (existingUser) return Response.json({ error: 'Email sudah terdaftar.' }, { status: 409 });

    const passwordHash = await bcrypt.hash(input.password, 12);
    await prisma.user.create({
      data: { name: input.name, email: input.email, passwordHash },
    });

    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Nama, email, atau password tidak valid.' }, { status: 400 });
    }
    return Response.json({ error: 'Pendaftaran gagal. Coba lagi.' }, { status: 500 });
  }
}
