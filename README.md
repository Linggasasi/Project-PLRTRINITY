# IDX Sentinel AI

Institutional-style AI Financial Intelligence Platform for the Indonesia Stock Exchange (IDX).

## Stack

- Next.js App Router + TypeScript
- Vercel AI SDK + Google Gemini
- Sectors Financial API (v2)
- Recharts + Lucide React
- Tailwind CSS

## Run

1. Copy `.env.example` to `.env.local` and fill both API keys.
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

## Authentication

The dashboard and data APIs require a session. Users can create an account at `/signup` and sign in at `/login`. Sessions use an httpOnly signed cookie, and passwords are stored as `scrypt` hashes in the local `.data/users.json` file for development.

Set a long random `AUTH_SECRET` in `.env.local` before deploying. For production or multiple instances, replace the local `.data` store with a managed database because deployment filesystems may be ephemeral.

