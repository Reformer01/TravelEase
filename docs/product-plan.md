# VoyageFlow — Product Completeness Plan

**Assumptions (change these, plan changes):**
- Target user: **Aisha, 28, Lagos, solo/group leisure traveler**, books 2–3x/year on mobile, pays with Paystack (card/bank/USSD), wants NGN pricing, needs quick rebook and guest flexibility. JTBD: *“Find a trusted place to stay/fly/drive and pay once without surprises.”*
- Deliverable: **Complete-product roadmap + design fixes** to reach shippable v1 (book end-to-end, retain). Fidelity: mid-fi now → high-fi handoff after sprint.
- Stage: pre-launch. Build is green (`npm run build` ✓ 32 routes), but dirty git + missing Vercel link block ship (`docs/vercel-deploy-plan.md:1`). Critique compliance **34.6% F** (`docs/design-critique-answers.json`).

---

## 1) Journey Map — VoyageFlow (adapted from ecommerce template)

```json
// see docs/journey-ecommerce.json for baseline; customized below
```

| STAGE | Actions (today) | Touchpoint | Emotion (1-5) | Pain point | Opportunity (behavioral) |
|-------|-----------------|------------|---------------|------------|--------------------------|
| **Awareness** | Lands on `/` hero, types “Where to?”, picks Flights/Hotels/Cars | `src/app/page.tsx:58` hero + `page.tsx:109` categories | 3 — curious but no trust signal | Static deals (Bali/Alps/London hard-coded `page.tsx:148-200`), no social proof, no real inventory | Add verified reviews + live availability badges (reduces uncertainty aversion) |
| **Consideration** | Filters on `/search` (price slider `SearchPageContent.tsx:182`, rating `189`), taps Book Now | `SearchPageContent.tsx:225` mock `getResults()` 6 fake hotels/cars/flights | 3 — anxious (are these real?) | Mock data, no dates/guests linking, sort does nothing (`216`), filter hides on mobile (`173 hidden lg:flex`), random picsum images | Replace mocks with Supabase/search API, wire dates/guests from hero (present bias: show price now) |
| **Basket** | Reviews items by type, sees Order Summary, clicks Check Out → verify | `src/app/basket/page.tsx:28` `handleVerify` → `/api/availability/verify` (stub `TODO`) | 2 — frustrated | Guest users blocked late (`111` guest banner), verify failure silent (`56 console.error`), Save for Later does nothing (`392`), token is URL param (loses on refresh `checkout/page.tsx:60`) | Persist `availabilityToken` in sessionStorage + show inline errors; merge guest→auth basket (status-quo bias: don’t make them start over) |
| **Purchase** | Fills 5-section form, picks guests/class/insurance/car, redirects to Paystack | `src/app/checkout/page.tsx:187-359` + `/api/payments/paystack/initialize` | 2 — overwhelmed | 5 sections at once, no stepper (`N1 major`), dates not carried, phone required but no format check (`N5`), First Class (+₦5k) never added to total, Insurance (+₦8k) never charged — price lie | Collapse to stepper (2 steps), make insurance/class affect `computePriceBreakdown` truthfully, validate inline |
| **Confirm** | Returns `checkout/complete?reference=`, polling verify, finalize booking | `src/app/api/payments/paystack/verify` + `bookings/finalize:65` | 4 — relieved if works | Webhook not registered pre-deploy, finalize idempotency exists but no retry UX, confirmation `[id]/page.tsx` bare | Add webhook + polling UX, celebrate with haptics/animation (“bend not break” moment) |
| **Retain** | Views `/profile/bookings`, maybe modifies/cancels | `src/app/profile/page.tsx`, `bookings/[id]/page.tsx:278` | 2 — at risk | No rebook, no receipt, no reminder, no loss-aversion hook (Jackson: “7 days → retain”) | Add “Rebook in 1 tap” + 7-day streak email (what they’d lose) |

**Drop-off hot spots:** Search→Basket (fake inventory), Basket→Checkout (silent verify + guest friction), Checkout submit (form overload + price mismatch).

---

## 2) Design Critique Summary

Ran `scripts/design_critique.py --answers docs/design-critique-answers.json`:
- **Compliance 34.6% F, 34 failed / 52 total**, 19 Major. Top 5 Majors: `N1 Progress indicators`, `N1 feedback`, `N3 exit without losing progress`, `N4 navbar consistency`, `N4 terminology (TravelEase≠VoyageFlow)`. Full report above.
- **Accessibility failures:** `A1 contrast #2A6CF5 4.1:1 <4.5:1`, `A2 focus:ring-0 removes keyboard ring on hero inputs`, `A3 hero inputs no <label> only placeholder`, `SearchPageContent aside hidden on mobile`.

---

## 3) Information Architecture — Today vs Target

**Today (code):**
```
Home (/) — hero search (no dates/guests) + 4 category pills + 3 hard-coded deals
Search (/search?type=) — mock 6 results, filters (price+rating), Book Now → toast+ basket
Basket (/basket) — grouped by type, Order Summary, Verify → token → Checkout
Checkout (/checkout?availabilityToken=) — 5 sections + summary, → Paystack hosted
Complete (/checkout/complete?reference=) — polling verify → /confirmation/[id]
Profile (/profile, /profile/bookings, /bookings/[id], /payments, /settings)
Support (/support, /cancellation, /terms)
```

**Gaps:** No type-ahead, no map view, no detail page (Book Now goes straight to basket — skips consideration), no order timeline, no help center search.

**Target IA (v1-shippable, 1-level deeper):**
```
Home
├─ Search (type+location+dates+guests+filters) — real results, sort wired
│  └─ Detail (/search/[id]) — gallery, amenities, reviews, availability, Add to Basket
├─ Basket — merge guest, coupon placeholder, timer (“Prices held 20 min”)
├─ Checkout (stepper: 1 Travelers → 2 Pay) — validated, price truth
│  └─ Complete (+ receipt)
└─ My Trips (/profile/bookings) — tabs: Upcoming/Past/Cancelled, Rebook
Support — searchable, article per error
```

Card sort validation: run closed sort (Flights, Hotels, Cars, Activities vs Support) with 6 users before IA freeze.

---

## 4) What’s Missing / Broken (engineering + design)

**P0 — blocks launch:**
1. Mock search `getResults()` — no Supabase query, no pagination, no dates (`SearchPageContent.tsx:13`). 
2. Silent verify fail `basket/page.tsx:56` + Checkout `availabilityToken` loss on refresh.
3. Price lies: First Class/Insurance UI never hits `computePriceBreakdown` (`src/lib/pricing.ts:10` SSOT). Fix server + client.
4. Navbar 3 variants diverge; hamburger `page.tsx:51` dead.
5. Terminology: TravelEase vs VoyageFlow (`docs/blueprint.md:1` vs `page.tsx:37`).
6. Vercel link + env not set (`docs/vercel-deploy-plan.md:2`) — not a design bug but blocks all testing.
7. Paystack webhook not registered post-deploy.

**P1 — hurts conversion/retention:**
- No stepper/progress on 5-step flow (N1), no inline validation (N5), hero dates/guests not wired (N5).
- Mobile filters hidden (`SearchPageContent:173`), sort inert (`216`).
- Guest→auth basket merge not communicated; “Save for Later” dead button.
- Contrast + focus + labels a11y failures (A1-A3).
- No onboarding, no contextual help, no empty-state recovery (“No matches” no reset action).
- Images generic `alt`, picsum random (undermines trust).

**P2 — retention loops missing (behavioral):**
- No “what you’d lose” hook (loss aversion), no defaults beyond guestCount=1 (should be 2, status-quo bias), no pause/celebrate moment after book, no 7-day re-engagement.

---

## 5) Prioritized Backlog (MoSCoW) — Ponytail small diffs win

**Must (ship v1):**
- M1 Replace mock `getResults` with Supabase query (reuse `src/components/travel/service-card.tsx`).
- M2 Wire hero dates/guests → `/search` query params; add `<input type=date>` + guests steppers (native, no lib).
- M3 Checkout stepper (shrink 5 sections → 2), wire Insurance/Class into `pricing.ts` & `finalize:65`, inline validate.
- M4 Fix verify UX: toast on error, store token in `sessionStorage`, show retry.
- M5 Unify navbar → single `src/components/layout/navbar.tsx`, wire hamburger to `MobileNavigation.tsx:1`.
- M6 Rename to VoyageFlow everywhere or decide TravelEase (pick one, grep replace).
- M7 Ship Vercel env + webhook (`docs/vercel-deploy-plan.md:4`).

**Should (v1.1, after usability test):**
- S1 Mobile filters drawer, wire sort (Best Value/Price/Rating).
- S2 Detail page `/search/[id]` + gallery/amenities (reduces uncertainty aversion).
- S3 A11y pass: fix contrast (`--color-primary-500` bump to #2456E6 for 4.5:1), restore focus rings, add `<label htmlFor>`, alt="{title}".
- S4 Merge guest basket toast on login + remove `Save for Later` or implement.
- S5 Order summary timer + sticky CTA (loss aversion: “Held 20 min”).

**Could:**
- C1 Rebook-one-tap, receipt PDF, calendar export.
- C2 VoyageFlow “7-day trip streak” celebration (haptics if PWA).

**Won’t (now):** Redis, custom cache, map view, AR try-on — YAGNI until metrics show need.

---

## 6) Design System Fixes (tokens & components)

Tokens (`src/app/globals.css` — audit first):
```css
--color-primary-500: #2456E6; /* was #2A6CF5, fixes 4.5:1 */
--space: 4px base, --radius-xl:16px, --radius-2xl:24px (consolidate current xl/2xl/3xl drift)
```

Components:
- Button variants already via `src/components/ui/button.tsx:1` (Primary/Secondary/Destructive, 32/40/48) — enforce everywhere; kill ad-hoc `bg-primary` buttons.
- Add `Stepper` (3 dots, already have `checkout/page.tsx:170` breadcrumb — reuse).
- Add `EmptyState` (used 2x, inconsistent: search “No matches” vs basket “empty” — unify).
- `ServiceCard` exists (`service-card.tsx:1`) — use it in Search instead of duplicated markup.

---

## 7) Design Sprint (5-day) to Reach Shippable

| Day | Activity | Output | Owner |
|-----|----------|--------|-------|
| Mon | Map: expert interviews (2 travelers + PM), challenge = “Checkout overload + fake inventory break trust” | Challenge map, target = Basket→Paystack | You + eng |
| Tue | Sketch: Crazy 8s for stepper checkout, detail page | 8 sketches/person | Designer |
| Wed | Decide: storyboard stepper + honest pricing | Storyboard, hypothesis: “Stepper + honest fees cuts drop-off 30%” | Team vote |
| Thu | Prototype: mid-fi Figma clickable (hero→search→detail→basket→stepper→Paystack mock→confirm) + one error state (verify fail) | Clickable prototype | Designer |
| Fri | Test: 5 users (3 new Lagos mobile, 2 returning), tasks below | Validated / invalidated | Researcher |

---

## 8) Usability Test Plan (runs Fri + after v1 ship)

**Objectives:** confirm user can finish book <3 min, find where fees surprise.

Participants: 6 (3 new, 3 returning), mobile-first (70% traffic assumed), mix NGN card/USSD.

Tasks:
1. “Find a hotel in Bali for 2 guests next week and add it” (browse+add) — target 100% / <60s
2. “Check out and pay with card” (basket→paystack) — target 90% / <180s
3. “Change guests from 2 to 1 after booking” (modify) — target 80% / <90s

Metrics: `scripts/usability_scorer.py --sus-responses responses.csv --task-data tasks.csv` → SUS target >68 (aim 80), completion >85%, time <2× expected, error count, severity per critique.

Success criteria per `product-designer` skill: SUS >80, critique compliance >80% after fixes (today 34.6% → must double).

---

## 9) What to Do Monday

1. **Decide name** (VoyageFlow or TravelEase) — 1-line fix, highest leverage for consistency (N4).
2. **Run `docs/vercel-deploy-plan.md:4` link+env** — unblocks all manual QA (5 min after name).
3. **Quick-win PR (1 file):** fix hero dates/guests inputs → `<input type=date>` + wire to search (N5 major, native, no deps).
4. **Schedule sprint Mon-Fri above** — don’t code M1-M7 before storyboard; verify “stepper solves overload” with 5 users first.

Skipped: new deps, custom picker lib, full design token generator (`scripts/token_generator.py`) until a11y contrast proven in prod; revisit after SUS.

---

**Files touched/created:** `docs/design-critique-answers.json`, `docs/journey-ecommerce.json` (tool output), `docs/vercel-deploy-plan.md`, this plan. Next artifact: Figma mid-fi prototype (not code) — share link for decision Wed.

**Questions for you (2 that change output):**
1. **Name lock:** VoyageFlow or TravelEase? (flips every header/SEO)
2. **Fidelity now:** mid-fi sprint prototype (days) or jump straight to dev handoff high-fi (weeks)?

Reply with those 2 and I’ll draft the Figma frames or start M1 mock-replacement immediately.
