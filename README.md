# Zone2

Training-partner platform: landing page → user dashboard → admin panel → sub-admin (club) panel.
Stack: Next.js 16 (App Router, TypeScript) + Supabase (Postgres, Auth). See
`.claude/plans` history or ask for the original build plan for the full architecture writeup.

## 1. Create the Supabase project (one-time, manual)

This can't be automated — it needs your own Supabase account.

1. Go to [supabase.com](https://supabase.com), create a project (any region/plan is fine for dev).
2. In **Project Settings → API**, copy:
   - Project URL
   - `anon` `public` key
   - `service_role` key (keep this one secret — never expose it to the browser)
3. Copy `.env.local.example` to `.env.local` and fill in the three values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```
4. In **Authentication → Providers → Email**, decide whether to require email confirmation.
   Turning it off makes local dev faster (no inbox to check); turn it back on before any real launch.

## 2. Apply the database schema

In the Supabase SQL Editor, run these three files **in order** (they're idempotent-ish but
still ordered — schema, then RLS, then functions/triggers, since the RLS policies and
triggers reference tables/enums the first file creates):

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_rls.sql`
3. `supabase/migrations/0003_functions.sql`

Then optionally run `supabase/seed.sql` for two demo clubs (Riverside Run Club, Iron Works).

If you install the Supabase CLI and link it to this project, `supabase db push` will apply
the migrations for you instead of pasting them manually.

## 3. Run the app

```bash
npm install
npm run dev
```

Open http://localhost:3000. Sign up at `/signup` — this creates a real Supabase Auth user
and, via the `handle_new_user` trigger, a matching `profiles` row with `role = 'user'`.

## 4. Try the three roles

- **User**: sign up normally → `/dashboard`. Build a profile, log a workout, browse
  candidates on the Matches page, schedule a session once a match is mutual, check in
  afterward.
- **Admin**: no self-serve path by design. Promote your own account: in the Supabase
  SQL Editor, `update profiles set role = 'admin' where id = '<your-auth-user-id>';`
  (find the id in **Authentication → Users**). Then visit `/admin`.
- **Sub-admin**: as an admin, create a club under `/admin/clubs/new`, then go to
  `/admin/users/<user-id>` for the account you want to promote and set role → `sub_admin`
  with that club. They'll then see `/sub-admin` instead of `/sub-admin/pending`. Note: a
  sub-admin's roster is populated by users joining a club (`club_members`) — there's no
  join-a-club UI yet in this first pass, so seed a row directly in `club_members` for testing.

## What's deliberately out of scope for this pass

- Real wearable OAuth (Strava/Apple Health/Garmin/Whoop) — workouts are logged manually.
  The `workouts.source` enum already includes those values so a real sync can be added
  without a schema change.
- A join-a-club UI for regular users (only admins currently create clubs and the roster
  is managed by inserting `club_members` rows directly).
- Duo streaks, Zone2 Socials, monetization — v2 per the product spec.

## Architecture notes

- **Authorization boundary is Postgres Row Level Security**, not application code — see
  `supabase/migrations/0002_rls.sql`. `src/proxy.ts` (Next.js 16 renamed `middleware.ts` →
  `proxy.ts`) only does UX-layer redirects; it is not what actually stops unauthorized access.
- Every Server Action in `src/app/**/actions.ts` re-checks `requireUser`/`requireAdmin`/
  `requireSubAdmin` itself — a layout-level check does not extend to actions defined within it.
- `src/lib/types/domain.ts` is hand-authored to mirror the SQL schema. Once you've applied
  the migrations, `npx supabase gen types typescript --project-id <id> > src/lib/types/database.ts`
  can generate the real thing if you want full Supabase-client type inference later.
