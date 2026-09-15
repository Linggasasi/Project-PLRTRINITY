# IDX Sentinel AI

Institutional-style AI Financial Intelligence Platform for the Indonesia Stock Exchange (IDX).

## Stack

- Next.js App Router + TypeScript
- Vercel AI SDK + OpenAI
- Sectors Financial API (v2)
- Recharts + Lucide React
- Tailwind CSS

## Run

1. Copy `.env.example` to `.env.local` and fill the provider, database, and auth variables.
2. Install dependencies with `npm install`.
3. Start with `npm run dev`.

## Important Sectors API note

Sectors Financial API v1 was discontinued on 11 May 2026. This project keeps the requested wrapper function names, but targets the current `/v2/*` API so live requests do not hit deprecated endpoints.

## AI tools

- `analyze_company_fundamentals`
- `get_market_sentiment`
- `peer_comparison_analyzer`
- `technical_momentum_check`

All Sectors secrets stay server-side.

to## Vercel deployment

Configure these variables in Vercel Project Settings -> Environment Variables for **Production** and **Preview**:

- `NEXTAUTH_SECRET`: long random value, for example `openssl rand -base64 32`
- `NEXTAUTH_URL`: the exact deployed URL, for example `https://your-project.vercel.app`
- `DATABASE_URL`: a hosted PostgreSQL connection string for production. XAMPP/phpMyAdmin uses MySQL and is not compatible with this schema.
- `SECTORS_API_KEY`
- `OPENAI_API_KEY`

After saving variables, run `npx prisma db push` once with the production `DATABASE_URL`, then redeploy the project. The local `.env.local` file is ignored by Git and is never uploaded to Vercel.

## Authentication

The dashboard and data APIs require a session. Users can create an account at `/signup` and sign in at `/login`. Sessions use NextAuth JWT cookies, and passwords are stored as `bcrypt` hashes in the Prisma `User` table.

Use a hosted PostgreSQL database for production. Vercel deployment filesystems are not a durable place to store SQLite or local user files.

