# VoyageFlow — Bottleneck Audit & Vercel Deploy Plan

> Ponytail pass: smallest diff that ships. No new deps. No scaffolding for later.

## 1. Build Status (verified `2026-08-28`)

- `npm run build` ✓ 32 routes (30.3s)
- `tsc --noEmit` ✓ no errors
- `next lint` — warnings only (13 unused vars, 3x `<img>` → `<Image>`, custom font warning). Non-blocking because `next.config.ts:8-13` ignores build errors. **Do not keep this long-term.**
- Stack: Next 15 App Router, Supabase (auth + DB), Paystack, Tailwind/shadcn. Port 9002 in dev, default on Vercel.

## 2. Bottlenecks Blocking Deployment (ranked)

| # | Bottleneck | Evidence | Fix | Cost if skipped |
|---|------------|----------|-----|-----------------|
| **1** | **Dirty git tree — 28 files unstaged** | `git diff --stat` shows 2165+2453 lines changed: deleted `src/firebase/**` (9 files), deleted `src/app/api/checkout/create-payment-intent`, deleted `src/lib/redis.ts`, modified 12 routes/pages, untracked `src/lib/pricing.ts:1-26` | Commit in one atomic commit. No code change. | Vercel deploys whatever is pushed. Current `origin/main` still has Firebase cruft → deploy will fail or ship dead code. |
| **2** | **No Vercel project linked** | `.vercel/` missing, `vercel env ls` → "Not linked" | `vercel link` (or create new project `voyageflow`) interactive once | `vercel deploy` refuses. |
| **3** | **Env vars gitignored, not in Vercel** | `.env.local:1-5` has 3 secrets, `.gitignore:26` ignores `.env*.local`. No `.env.example`. `src/lib/supabase-route.ts:44-50` expects `SUPABASE_SERVICE_ROLE_KEY` variants, `src/app/api/payments/paystack/**:5` expects `PAYSTACK_SECRET_KEY`, plus `PAYMENT_CURRENCY=NGN` | Create `.env.example`, then `vercel env add` for 4 keys (URL, ANON, SERVICE_ROLE, PAYSTACK_SECRET) across Preview+Production | Build will succeed but every `/api/*` returns 500 `Missing ...`. Supabase auth breaks. |
| **4** | **Firebase leftovers confuse deploy target** | `.firebaserc:3` → `studio-6497293217-820ff`, `apphosting.yaml:6` `maxInstances:1`, `firestore.rules:1-35`, `docs/backend.json` (Firestore schema), `README.md:34` says "Backend: Firebase" | Delete `apphosting.yaml`, `.firebaserc`, `firestore.rules`, update README, keep or delete `docs/backend.json` (ponytail: delete if no migration ref) | Reviewers deploy to Firebase by habit; Vercel env doc lies about stack. |
| **5** | **Paystack webhook URL unknown pre-deploy** | `src/app/api/webhooks/paystack/route.ts:18-25` validates `x-paystack-signature` with `PAYSTACK_SECRET_KEY`. Needs public URL `https://<vercel-domain>/api/webhooks/paystack` registered in Paystack dashboard | After first prod deploy, copy Vercel URL → Paystack Dashboard → Settings → Webhooks | Payments stay `pending`, `bookings/finalize` never succeeds. |
| **6** | **`ignoreBuildErrors` hides debt** | `next.config.ts:8-13` `typescript.ignoreBuildErrors` + `eslint.ignoreDuringBuilds` | Remove after one green `typecheck+lint` clean run. Keep only if you consciously want fast preview. | Silent type regressions ship to prod. |
| **7** | **Stubbed availability check** | `src/app/api/availability/verify/route.ts:1` comment `TODO: Replace with real inventory` | Already gated: checkout requires `availabilityToken` from `/api/availability/verify` then passed to `/api/payments/paystack/initialize`. Leave stub for now; real inventory later. | No booking race-condition protection if left forever. |
| **8** | **Port mismatch dev vs prod** | `package.json:6` `dev -p 9002`, Vercel defaults to 3000 | No fix needed — Vercel ignores `dev` script. Document only. | None. |

## 3. Minimal Fix Plan (3 commits max)

### Commit 1 — `chore: purge firebase, add pricing single-source` (already staged locally, just commit)
```bash
git add src/lib/pricing.ts src/lib/supabase-client.ts \
  src/app/api/bookings/** src/app/api/payments/** src/app/api/profile/me \
  src/app/basket/page.tsx src/app/booking-cancelled/page.tsx src/app/checkout/page.tsx \
  src/app/confirmation/[id]/page.tsx src/app/profile/page.tsx
git rm -r src/firebase src/lib/redis.ts src/app/api/checkout/create-payment-intent --cached 2>/dev/null; git rm -r src/firebase src/lib/redis.ts 2>/dev/null
git status # should show only apphosting.yaml/.firebaserc/firestore.rules/doc cleanup remaining
git commit -m "chore: purge firebase, harden supabase client and paystack flow"
git push origin main
```

### Commit 2 — `chore: vercel deploy prep`
- Add `src/lib/pricing.ts` already covers fee math (`src/lib/pricing.ts:10-24` is SSOT, consumed by `src/app/checkout/page.tsx:32` and `src/app/api/bookings/finalize:65`).
- Create `.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PAYSTACK_SECRET_KEY=
PAYMENT_CURRENCY=NGN
```
- Delete `apphosting.yaml`, `.firebaserc`, `firestore.rules` (or keep if you plan Firebase rollback — ask).
- Update `README.md:34` Tech Stack line from `Firebase` → `Supabase + Paystack`.
- Optional: add `vercel.json` only if you need `cleanUrls` or `framework: nextjs` override — ponytail says skip unless Vercel auto-detect fails (it won't).

### Commit 3 — (after Vercel link) — no code, env only

## 4. Vercel Deploy Steps (interactive, ~10 min)

```bash
# 1. Link (one-time, prompts for project name)
vercel link
#   ? Set up VoyageFlow? → Y
#   ? Which scope? → reformerejembi-iworldnetwors-projects (or personal)
#   ? Link to existing project? → N (create new "voyageflow")
#   ? Directory? → ./

# 2. Pull env template and push secrets (repeat for each key, choose Production+Preview+Development)
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add PAYSTACK_SECRET_KEY
vercel env add PAYMENT_CURRENCY   # value NGN

# 3. Preview deploy (verifies env wired)
vercel --yes

# 4. If preview green, promote
vercel --prod --yes

# 5. Register webhook (after prod URL known)
# Paystack Dashboard → Settings → API Keys & Webhooks → Webhook URL:
# https://<your-vercel-url>.vercel.app/api/webhooks/paystack
```

**Vercel auto-settings:** Framework = Next.js (detected), Build = `next build`, Install = `npm install`, Node 20+. No extra config needed. `next.config.ts:5-6` turbopack root is fine; Vercel builds with webpack/turbo automatically.

## 5. Post-Deploy Smoke Test (5 min)

- `https://<url>/` → home renders
- `/auth/login` → Supabase login (use existing user on `mftjdjtegxgvpkdjpbas.supabase.co`)
- Add item → `/basket` → Verify Availability → `/checkout?availabilityToken=...` → "Continue to Paystack" redirects to `paystack.co/pay/...` → pay with test card `408408...` → callback to `/checkout/complete?reference=<uuid>` → poll `/api/payments/paystack/verify` → `status: succeeded` → `/api/bookings/finalize` creates `bookings` row → `/confirmation/[id]` shows booking. Check Supabase `payments.status` flipped by webhook vs verify fallback.

## 6. What Was Skipped (ponytail)

- Skipped `vercel.json`, Redis, custom cache, Stripe adapter, inventory service, image optimization fix (`<img>` → `<Image>`), lint auto-fix, strict `typecheck` gate. Add when:
  - `vercel.json` when you need rewrites/headers/cron
  - Redis/`src/lib/redis.ts` when you actually need rate-limit or session cache (deleted intentionally — YAGNI)
  - Image optimization when LCP measured >2.5s
  - `ignoreBuildErrors: false` when lint warnings cleaned (enforce in CI)

## 7. Behavioral Design Note (skill context)

Retention bottleneck = users have nothing to lose after 7-day absence (Shuttleworth: loss aversion). VoyageFlow's paystack-booking loop already creates a loss (paid trip) but pre-payment drop-off at `checkout` is highest friction. Recommendations (no code now, validate first):
- Set smart default `guestCount=2` (already done `src/app/checkout/page.tsx:220`) — leverages status-quo bias.
- Add progress bar + "Your basket expires in 20 min" (creates pause moment + loss aversion) — measure drop-off at `availabilityToken` step before building.
- Reduce checkout fields: prefill email/name from supabase `user.email` (already done:214) — remove phone if optional.

## 8. Decision Needed From You

1. Delete Firebase files now? (Recommended: yes — Supabase is live. Keep `docs/backend.json` only if you need migration history.)
2. Vercel project name: `voyageflow` ? Scope: `reformerejembi-iworldnetwors-projects` or personal?
3. Ready to run `vercel link` + push env vars now, or want me to commit the cleanup first? → Reply `ship cleanup` or `link now`.

---
Generated from live repo inspection: `package.json:1-68`, `next.config.ts:1-38`, `git diff --stat` 28 files, `.env.local:1-5`, `src/lib/supabase-route.ts:1-73`, `src/app/api/webhooks/paystack/route.ts:1-62`.
