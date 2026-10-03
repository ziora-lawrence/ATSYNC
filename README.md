# ATSYNC

Client management platform built for African digital agencies. Intake, approvals, payments, and client communication in one place instead of scattered across WhatsApp, email, and spreadsheets.

Live demo: <atsync.app>

![ATSYNC dashboard](./docs/dashboard.png)

## What it does

- **Agency dashboard** to manage clients, projects, and approvals
- **Intake links** so new clients submit their details through a shareable form
- **Approval flow** with Paystack payments, gated so work only proceeds once payment is verified
- **Real-time chat** between agency and client via Supabase Realtime
- **Client portal** (in progress)

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React, Vite, custom CSS |
| Auth / DB / Realtime | Supabase (Postgres, RLS) |
| Payments | Paystack |
| Backend | Node.js / Express |
| Hosting | Vercel |

## Security

- Row Level Security on client data in Supabase
- Paystack webhooks verified with HMAC-SHA512, with duplicate-event protection
- CSP and HSTS headers configured through `vercel.json`
- Scanned and hardened using OWASP ZAP

## Project structure

ATSYNC/
├── frontend/ # React + Vite app
├── backend/ # Node/Express API
└── supabase_setup.sql # database schema


## Getting started

1. Clone the repo
2. Run `supabase_setup.sql` in your Supabase project's SQL editor
3. Set up environment variables (see `.env.example`)
4. Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

## Status

Agency dashboard and auth are live. Client portal and full backend integration are in progress.

## Team

- **Daniel Iwuji** ([@ziora-lawrence](https://github.com/ziora-lawrence)): founder, frontend
- **muhayad olamilekan** ([simisola16]): cofounder, backend
