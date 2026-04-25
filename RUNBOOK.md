# RUNBOOK.md — Local Dev, Deploy & Ops

---

## Prerequisites

- Node.js 18+
- pnpm 10+
- A Neon account (free tier): https://console.neon.tech
- A Resend account (free tier): https://resend.com

## Local Setup

```bash
# 1. Clone and install
git clone <repo>
cd pool
pnpm install

# 2. Copy env
cp .env.example .env.local
# Fill in DATABASE_URL, DIRECT_URL, AUTH_SECRET, AUTH_RESEND_KEY

# 3. Generate AUTH_SECRET
openssl rand -base64 32

# 4. Run migrations
pnpm db:migrate

# 5. Start dev server
pnpm dev
```

## Environment Variables

| Variable          | Description                                         |
| ----------------- | --------------------------------------------------- |
| `DATABASE_URL`    | Neon pooled connection string                       |
| `DIRECT_URL`      | Neon direct connection string (for migrations)      |
| `AUTH_SECRET`     | Random 32-byte secret for Auth.js                   |
| `AUTH_RESEND_KEY` | Resend API key (`re_xxx`)                           |
| `RESEND_FROM`     | From address for magic link emails                  |
| `NEXTAUTH_URL`    | Full URL of the app (http://localhost:3000 for dev) |

## Neon Setup

1. Create project in Neon console, region: AWS ap-south-1 (Mumbai)
2. Create branches: `main` (production), `dev` (development), `test` (integration tests)
3. Copy connection strings to `.env.local`

## Deploy to Vercel

1. Push repo to GitHub
2. Import into Vercel
3. Add all env vars in Vercel project settings
4. Set `DATABASE_URL` to the production Neon branch connection string
5. Vercel auto-deploys on every push to `main`

## Database Operations

```bash
pnpm db:migrate    # Run pending migrations (dev)
pnpm db:push       # Push schema directly (quick, no migration files)
pnpm db:generate   # Regenerate Prisma client
pnpm db:studio     # Open Prisma Studio GUI
pnpm db:seed       # Seed demo data
```

## Rotating Secrets

- `AUTH_SECRET`: Generate new with `openssl rand -base64 32`, update in Vercel env vars, redeploy. All existing sessions will be invalidated.
- `AUTH_RESEND_KEY`: Rotate in Resend dashboard, update Vercel env var.
