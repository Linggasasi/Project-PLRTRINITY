import 'server-only';

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const scrypt = promisify(scryptCallback);
const dataDirectory = path.join(process.cwd(), '.data');
const usersFile = path.join(dataDirectory, 'users.json');
const sessionCookie = 'idx_sentinel_session';
const sessionLifetime = 60 * 60 * 24 * 7;

type User = { id: string; name: string; email: string; passwordHash: string; createdAt: string };
type SessionPayload = { userId: string; email: string; exp: number };

function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') throw new Error('AUTH_SECRET wajib diisi pada production.');
  return secret || 'development-only-change-this-auth-secret';
}

async function readUsers(): Promise<User[]> {
  try {
    return JSON.parse(await fs.readFile(usersFile, 'utf8')) as User[];
  } catch {
    return [];
  }
}

async function writeUsers(users: User[]) {
  await fs.mkdir(dataDirectory, { recursive: true });
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2), { mode: 0o600 });
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function verifyPassword(password: string, storedHash: string) {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(key, 'hex');
  return expected.length === derivedKey.length && timingSafeEqual(expected, derivedKey);
}

function sign(value: string) {
  return createHmac('sha256', authSecret()).update(value).digest('base64url');
}

function createSessionToken(payload: SessionPayload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

function verifySessionToken(token?: string): SessionPayload | null {
  if (!token) return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature || sign(encoded) !== signature) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
    return payload.exp > Math.floor(Date.now() / 1000) ? payload : null;
  } catch {
    return null;
  }
}

export async function createUser(name: string, email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const users = await readUsers();
  if (users.some((user) => user.email === normalizedEmail)) throw new Error('Email sudah terdaftar.');
  const user: User = {
    id: randomBytes(16).toString('hex'),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  await writeUsers([...users, user]);
  return user;
}

export async function authenticateUser(email: string, password: string) {
  const user = (await readUsers()).find((candidate) => candidate.email === normalizeEmail(email));
  if (!user || !(await verifyPassword(password, user.passwordHash))) return null;
  return user;
}

export async function setSession(user: User) {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookie, createSessionToken({ userId: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) + sessionLifetime }), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: sessionLifetime,
    path: '/',
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookie);
}

export async function getSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(sessionCookie)?.value);
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  return session;
}

export function getSessionCookieName() {
  return sessionCookie;
}

export function verifySessionValue(value?: string) {
  return verifySessionToken(value);
}
