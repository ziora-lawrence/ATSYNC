# ATSYNC — Backend Work for V1 Launch

You're picking up backend work on ATSYNC, a client management SaaS for African digital agencies. Frontend (React + Vite + Supabase) is largely built. This document lists every backend bug, gap, and addition needed before V1 launch, in priority order. Read the whole thing before starting — some items depend on earlier ones.

**Stack context:** React + Vite frontend, Supabase (Postgres + Auth + Realtime + Edge Functions), Paystack for payments, Vercel for frontend hosting. There is also a legacy Render/Express/MongoDB backend that may or may not still be needed — see Step 0.

---

## STEP 0 — Confirm what's still alive (do this first)

Before touching anything, figure out: is the Render/Express/MongoDB backend still serving any active traffic, or has everything migrated to Supabase (Auth, invites, data)? If nothing in the frontend calls the Render backend anymore, flag it for retirement so it's not silently maintained for no reason. If it IS still used for something, document what, because that context is missing right now.

---

## STEP 1 — BUG: Invite emails aren't sending (P0, blocking launch)

**Symptom:** Agency approves a client intake submission. The approval saves correctly to the database. The Edge Function `send-invite` fires correctly (calling `supabase.auth.admin.inviteUserByEmail`). But the client never receives an email.

**Root cause (near certain):** Supabase's default built-in email service is for demo/testing only. It either rate-limits hard (2-3 emails/hour) or — in many configurations — only delivers to email addresses that belong to the Supabase project's own team members, silently dropping everything else without a visible error.

**Fix steps:**
1. Go to Supabase Dashboard → Authentication → Logs. Check for delivery errors around the timestamp of a test approval.
2. Go to Authentication → Settings → SMTP Settings. Confirm Custom SMTP is currently OFF (this is almost certainly the case).
3. Set up a custom SMTP provider — Resend is recommended (generous free tier, used elsewhere in this project already for consideration).
   - Sign up at resend.com
   - Verify a sending domain (or use their shared test domain temporarily while testing)
   - Copy the SMTP host, port, username, and password Resend provides
   - Paste into Supabase → Authentication → SMTP Settings → enable Custom SMTP
4. Test again: approve a real client intake submission and confirm the email arrives.
5. Also check Edge Function logs (Supabase Dashboard → Edge Functions → send-invite → Logs) for any silent errors on the function side, in case there's a secondary issue beyond SMTP.

This is a config fix, not a code fix — no redeploy needed once SMTP is set up correctly.

---

## STEP 2 — Approval flows are UI-only, not wired to a real database (P0, core product feature)

**Current state:** The dashboard has visual concepts for "Delivery Approval," "Change Request," and "Scope Creep Flag" but there is no `approvals` table in Supabase. None of this persists or does anything real yet.

**What to build:**

1. Create an `approvals` table:
```sql
create table public.approvals (
  id               uuid primary key default gen_random_uuid(),
  agency_client_id uuid not null references public.agency_clients(id) on delete cascade,
  project_id       uuid references public.projects(id) on delete cascade,
  type             text not null check (type in ('delivery_approval', 'change_request', 'scope_creep_flag')),
  title            text not null,
  description      text,
  status           text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_by     uuid references auth.users(id),
  requested_at     timestamptz default now(),
  resolved_at      timestamptz
);

alter table public.approvals enable row level security;

create policy "Conversation members can read approvals"
  on public.approvals for select
  using (
    exists (
      select 1 from public.agency_clients ac
      where ac.id = approvals.agency_client_id
        and (ac.agency_id = auth.uid() or ac.client_id = auth.uid())
    )
  );

create policy "Agency can create approvals"
  on public.approvals for insert
  with check (
    exists (
      select 1 from public.agency_clients ac
      where ac.id = approvals.agency_client_id and ac.agency_id = auth.uid()
    )
  );

create policy "Client can update approval status"
  on public.approvals for update
  using (
    exists (
      select 1 from public.agency_clients ac
      where ac.id = approvals.agency_client_id and ac.client_id = auth.uid()
    )
  );
```

2. Wire the existing UI buttons (agency-side "Request changes," client-side "Approve" / "Request changes") to actually insert/update rows in this table.
3. Client portal right panel should pull real pending approvals from this table instead of showing static/empty data.
4. When a client approves a "Delivery Approval," that should be the trigger point for Step 3 (payment release) if a payment is tied to that milestone.

---

## STEP 3 — Payments are not wired up at all (P0, blocks revenue)

**Current state:** There's a Payments tab in the dashboard UI. Paystack is the intended provider. Nothing is connected — no webhook, no payment records in the database, no link between an approval and a payment release.

**What to build:**

1. Create a `payments` table:
```sql
create table public.payments (
  id               uuid primary key default gen_random_uuid(),
  agency_client_id uuid not null references public.agency_clients(id) on delete cascade,
  project_id       uuid references public.projects(id) on delete cascade,
  amount           numeric not null,
  currency         text default 'NGN',
  status           text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  paystack_reference text,
  approval_id      uuid references public.approvals(id),
  created_at       timestamptz default now(),
  paid_at          timestamptz
);

alter table public.payments enable row level security;
-- mirror the same RLS pattern as approvals (agency + client of that agency_client_id only)
```

2. Build a Paystack webhook handler. This needs a server endpoint (Supabase Edge Function is the cleanest option here, consistent with `send-invite`):
   - Verify the Paystack webhook signature (critical for security — don't trust unsigned payloads)
   - On successful payment event, update the matching `payments` row to `status = 'paid'`
   - Optionally trigger a notification back to the agency

3. Wire the frontend Payments tab to read real data from this table instead of placeholder content.

4. Decide and document: does payment release require approval first (approval-triggered payments, per the original product spec), or are they independent? This affects how tightly Step 2 and Step 3 connect.

---

## STEP 4 — Staff / Team Member accounts are decorative (P1, not blocking V1 but should be flagged)

**Current state:** The login modal has a "Team Member" role tab and asks for an Agency ID, but there is no `staff` table and no actual backend logic connecting a team member to an agency or granting them any permissions. Right now this login path doesn't really work — it navigates to `/workspace/:agencyId` but nothing backs that route meaningfully.

**Recommendation:** Decide whether staff accounts are in scope for V1. If not, consider hiding the Team Member option from the login modal for now rather than shipping a broken-looking option. If it IS in scope, it needs:
- A `staff` table linking a user to an `agency_id` with a role/permission level
- RLS policies scoping staff access to only their agency's data
- A real `/workspace/:agencyId` experience

---

## STEP 5 — General checks before launch

- Confirm Realtime is correctly enabled in production for the `messages` table (Database → Replication) — this was set up during dev but should be re-verified.
- Confirm RLS is enabled and correctly scoped on every table that holds client or agency data — `profiles`, `agency_clients`, `projects`, `messages`, plus the new `approvals` and `payments` tables. A client should never be able to query another client's row.
- Double check the Edge Function secret `SUPABASE_SECRET_KEYS` (not the deprecated `SUPABASE_SERVICE_ROLE_KEY`) is what `send-invite` is actually using — this was flagged as a deprecation during dev and may not have been fully migrated.
- Test the full loop end to end once SMTP is fixed: intake form submission → agency approval → invite email received → client sets password → client lands in their portal → chat works both directions.

---

## Out of scope for V1 (don't get distracted by these)

- Bob (AI agent) — needs its own LLM integration, real conversation handling, likely its own Edge Function. This is a V2 feature.
- Marketplace (lead exchange between agencies) — no schema exists yet, not needed for launch.

Focus order: Step 1 (email) → Step 2 (approvals) → Step 3 (payments) → Step 5 (security checks) → Step 4 (staff, only if time allows).
