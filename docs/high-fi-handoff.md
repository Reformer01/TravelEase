# TravelEase — High-Fi Dev Handoff

**Brand lock:** TravelEase (was VoyageFlow per `docs/blueprint.md:1` — fixed). **Fidelity:** high-fi handoff, not sprint prototype. **Stack:** Next 15 App Router, Tailwind + shadcn (`components.json:4` default, `tailwind.config.ts:1`), Supabase, Paystack NGN (`src/lib/pricing.ts:1`).

This is the single engineering truth for the remaining completeness work. Pair with `docs/product-plan.md:1` (why) and `docs/vercel-deploy-plan.md:1` (ship) and `docs/design-tokens.json:1` (tokens) and critique `docs/design-critique-answers.json:1` (34.6% → target 80%).

---

## 1. IA — Final for v1 (dev implements this tree)

```
Home `/` (page.tsx:1)
├─ Search `/search?type=&location=&dates=&guests=` (SearchPageContent.tsx:1)
│  ├─ Detail `/search/[id]` ← NEW (was missing; today Book Now skips detail)
│  └─ Filters/sort wired (price+rating now, add dates/guests)
├─ Basket `/basket` (basket/page.tsx:1) — grouped Flights/Hotels/Cars/Activities + Verify
├─ Checkout `/checkout?availabilityToken=` (checkout/page.tsx:1) — REDESIGNED to stepper (see §3)
│  └─ Complete `/checkout/complete?reference=` (CheckoutCompleteContent.tsx)
├─ My Trips `/profile/bookings` + `/profile/bookings/[id]` (profile/bookings/[id]/page.tsx:1)
├─ Profile `/profile` (+ `/payments`, `/settings`)
└─ Support `/support`, `/support/cancellation`, `/support/terms`
```

Validation: closed card sort with 6 Lagos travelers before freeze (8 cards: Flights, Hotels, Cars, Activities, My Trips, Basket, Support, Profile).

---

## 2. Design Token System — Apply Literally

Source `docs/design-tokens.json:1`, implemented via `src/app/globals.css:6` HSL vars and `tailwind.config.ts:18`.

| Token | Value | Usage | WCAG note |
|-------|-------|-------|-----------|
| `--primary` `19 85% 50%` → `#ec5b13` | Buttons, links, active nav, progress | **3.2:1 on white FAIL for small text** — use `primary-600 #d4550f` (4.6:1) for any text <18px on white. Keep `#ec5b13` for 48px btn bg + large headings only. |
| `background-light #f8f6f6`, `background-dark #221610` | Page bg | Already in `globals.css:8,31` |
| `text primary #1c1917` / secondary `#78716c` | Use `text-foreground` / `text-muted-foreground` |  |
| Radius `0.5rem` (`--radius`) → extend to `2xl 24px` for cards, `full 9999px` for pills | Current drift `xl` vs `3xl` — consolidate to `xl 12px` (small cards) + `2xl 24px` (hero/deals) + `full` (badges/avatars) | |
| Font `Public Sans` `display/body` | Already `tailwind.config.ts:13` | Blueprint said Inter — decision: keep Public Sans (already shipped), ignore blueprint Inter. |

**Engineering rule:** no hard-coded hex except via token. If `bg-primary` used for *text on white*, swap to `text-[#d4550f]`.

---

## 3. Screen-by-Screen High-Fi Spec (what changes from today)

### 3.1 Home `src/app/page.tsx:1` — minimal touches
- Keep hero `58` + search bar `79`. **Fix:** add `<label>` + `type=date` for Dates, `type=number min=1` with stepper for Guests (a11y A3, N5). Wire to `/search?dates=&guests=` (today discards). Add explicit `aria-label`.
- Nav: kill duplicate hamburger `51` inert menu; wire to unified `src/components/layout/navbar.tsx:1` + `MobileNavigation.tsx:1`. Single nav component everywhere (fixes N4).
- Deals `144` hard-coded 3 cards — keep for v1 but replace picsum `picsum.photos/seed/...` with deterministic Unsplash from `tailwind.config.images` allowlist or move to Supabase `featured` table in v1.1. Alt must be real: `alt="{title} — {location}"` not “luxury resort”.

### 3.2 Search `SearchPageContent.tsx:1` — MAJOR REWORK
| Issue | Fix | Spec |
|-------|-----|------|
| Mock `getResults():13` 6 fake rows | Query Supabase `search_services(type, location)` or temp JSON `src/lib/placeholder-images.json`; paginate 12/page | Loading skeleton same as basket `basket/page.tsx:128`; empty state unified `EmptyState` (see §4) |
| Sort inert `216` | Wire `select onChange` → sort by `price asc/desc`, `rating`, `reviews` client-side | Persist in URL `?sort=` |
| Filters hidden mobile `173 hidden lg:flex` | Drawer: hamburger → slide-over with same `Slider` + `Checkbox` | Trigger `Filter (n)` pill on mobile |
| `Book Now` skips detail | Becomes two actions: card click → `/search/[id]` (detail), secondary `Add to Basket` button | Detail page spec §3.3 |
| Badge `Live Availability` fake `63` | Show real from verify API or hide until verified | |
| Images `picsum.photos` random | Deterministic + meaningful alt `alt="{title} in {subLocation}"` | |

Card anatomy (use existing `src/components/travel/service-card.tsx:1` instead of inline div `231`):
`[Image 16:9] + Live pill (top-left) + [stars] Title + subLocation + [rating / reviews] + [badges 3 max] + [leftCount red if <=5] + Price + CTA`

### 3.3 Detail `src/app/search/[id]/page.tsx` — NEW FILE (create)
- Gallery (3 images), title/location/provider/rating, amenities chips, description, map placeholder, reviews collapsed, sticky `Price + Guests selector + Add to Basket` bar on mobile. Reuses `ServiceCard` gallery + `src/components/ui/calendar.tsx:1` for dates.
- CTA → `addToBasket` + toast (consistent with `SearchPageContent:93`), then inline “View Basket (n)”.

### 3.4 Basket `src/app/basket/page.tsx:1` — MEDIUM TOUCHES
- Grouping Flights/Hotels/Cars/Activities already good `21-63`. Keep.
- **Verify flow `28 handleVerify`:** add toast on fail (`useToast`), store `token` in `sessionStorage.setItem('availabilityToken', token)` alongside URL param (fixes N3 refresh loss). Show inline `Verify failed — X unavailable, remove?` near items, not just console.
- Order Summary `358` math already uses `computePriceBreakdown` `26` — correct. Keep.
- Kill dead `Save for Later 392` or wire to Supabase `saved_items` (ponytail: kill for v1 — delete button, cheapest diff).
- Guest banner `111` good — keep, but merge flow: on login, toast “Basket saved — 3 items merged”.

### 3.5 Checkout `src/app/checkout/page.tsx:1` — REDESIGN TO STEPPER (biggest change)
**Today:** 5 sections stacked `188-359` overwhelming (N8), price lies (First Class +₦5k `241` + Insurance +₦8k `299` never added).

**Handoff — 2-step stepper:**
```
Header stepper: [1 Travellers ●] ── [2 Payment ○]  (use progress indicator N1)
Sticky summary right (desktop) / bottom sheet (mobile) shows live grandTotal from computePriceBreakdown + add-ons

Step 1 — Travellers (default expanded)
  Full Name (prefill user_metadata.full_name 196) *
  Email (prefill user.email 200) *
  Phone (* — validate +234 pattern, not freeform)
  Guests radios 1/2/3 (default 2, not 1 — status-quo bias) → affects pricing if per-guest
  Booking Class Economy/First (+₦5k) → must call computePriceBreakdown(subtotal + 5000 if First)
  Car Rental section: if no car, “Browse cars” 276 link pre-filtered by location
  [Continue to Payment →]

Step 2 — Payment (collapsed until Step 1 valid)
  Travel Insurance checkbox (+₦8k) → adds to grandTotal live
  Paystack method pills Card/Bank/USSD (state already 21)
  Legal line + SSL lock existing 333
  CTA “Pay ₦{grandTotal} with Paystack” → initialize (existing handleSubmit:80) — keep Bearer auth flow
  Inline error if availabilityToken missing (today only toast 62)
```

- Form validation: `react-hook-form + zod` already in `package.json:16,55` — use it (don’t hand-roll). Inline errors under fields, focus first invalid on submit (N5, A2).
- Behavioural: show “Prices held 20 min” countdown in summary (loss aversion, 7-day retention hook in plan).

Pricing truth: update `src/lib/pricing.ts:21` to `computePriceBreakdown(subtotal + addOns)` and ensure `finalize:65` uses same addOns from `payment.metadata` (guestCount already there, add insurance/class).

### 3.6 Confirmation `src/app/confirmation/[id]/page.tsx:1` + Complete `checkout/complete`
- Add success haptics/animation (spec: 320ms scale+check, `prefers-reduced-motion` respected).
- Receipt: show bookingReference, items, total, “Download invoice” (today button in `[id]/page.tsx:588` dead — wire to `jsPDF` or simple `window.print()` for v1, no new dep).
- Next: “Rebook” + “View My Trips”.

### 3.7 My Trips `[id]/page.tsx:1` — POLISH
- Fee calc `277 taxesAndFees floor(...*0.08)` conflicts with `pricing.ts 0.10 + 0.02` — unify to `computePriceBreakdown` (bug).
- Already good: itinerary `359`, accommodation `406`, car `447`, activities `488`, payment summary `540`, modals `640`. Add empty state if no bookings + Rebook CTA.
- Keep `RequireAuth` `285`.

---

## 4. Component Library — Dev Checklist

Use `src/components/ui/*:1` shadcn primitives. No new deps.

| Component | File | Variants/States | Handoff note |
|-----------|------|-----------------|--------------|
| Button | `ui/button.tsx:6` `buttonVariants` | default/destructive/outline/secondary/ghost/link × sm/default/lg/icon; + loading (spinner) + disabled | Enforce `buttonVariants` everywhere; kill ad-hoc `bg-primary` divs. Add `loading` prop with `animate-spin` (already used `basket:382`) |
| Stepper | NEW `src/components/ui/stepper.tsx` | 2 steps + progress bar + check icon on complete | 40px circles, `bg-primary` active, `border` inactive |
| EmptyState | NEW `src/components/ui/empty-state.tsx` | illustration + title + desc + [primary action] | Replace 3 ad-hoc empties (search 226, basket 151, bookings 258) |
| ServiceCard | `travel/service-card.tsx:1` | hotel/flight/car/activity; liked/saved | Use in Search + Detail, remove inline card `SearchPageContent:231` dupe |
| SearchBar | `travel/search-bar.tsx:1` | compact (header) + hero (large) | Unify hero vs header search (today two separate) |
| Navbar | `layout/navbar.tsx:1` + `MobileNavigation.tsx:1` | desktop / mobile drawer | Single source, wire hamburger; active state `text-primary` already in Search nav `128` |
| Modals | `cancellation-modal.tsx:1`, `booking-modification-modal.tsx:1`, `delete-confirmation-modal.tsx:1` | — | Keep, fix unused imports flagged lint `src/components/cancellation-modal.tsx:4` |

---

## 5. Interaction & Motion Spec

- Transitions: `transition-colors duration-200` (already used), `hover:shadow-xl hover:shadow-primary/5` on cards (keep).
- Celebration: on `/checkout/complete` success, 320ms checkmark scale (respect `prefers-reduced-motion`).
- Focus: restore rings — remove `focus:ring-0` from hero inputs `page.tsx:83`; rely on `ui/button 8 focus-visible:ring-2`. Ensure `focus-visible:outline-none` not stripping.
- Loading: skeletons `basket/page.tsx:128` pattern for Search + Detail; spinner `animate-spin` on verify/pay.

---

## 6. Accessibility — Must Pass Before Handoff Sign-off

From `design-critique-answers.json` majors:
- [ ] Contrast: primary text on white uses `#d4550f` (4.6:1) not `#ec5b13` (3.2:1) — grep `text-primary` on white → audit.
- [ ] Hero inputs: add `<label htmlFor>` with `sr-only` if design keeps placeholder look (`page.tsx:82`).
- [ ] Calendar/Slider keyboard: ensure `Slider` `onValueChange` + arrow keys work, visible focus ring.
- [ ] Alt text: audit every `Image alt` — no “travel destination” generic.
- [ ] Headings: ensure each route has one `h1` (`SearchPageContent` today starts at `h3 Filters` `176` — add `h1 {type}s in {location}`).

Target WCAG AA, critique compliance >80% (today 34.6% F).

---

## 7. Engineering Feasibility Check

- `computePriceBreakdown` is SSOT (`pricing.ts:21`) — eng confirmed; add-ons via `addOns` param is one-line change, finalize already reads `computePriceBreakdown` `finalize:65`.
- Paystack flow: `initialize 80` → `verify` → `finalize` idempotent already (`finalize:72 existingBooking`) — no schema change.
- Supabase search: if no backend search yet, temp `src/lib/placeholder-images.json:1` filtered client-side (same as today mock) — acceptable for handoff, swap to real query v1.1 without UI change.
- Dates/guests: `react-day-picker 9.11` + `date-fns 3.6` already in `package.json:49,42` + `ui/calendar.tsx:1` — feasible.
- Build still green `next build 32 routes`; keep `next.config.ts:8 ignoreBuildErrors` until a11y/contrast pass then flip false.

---

## 8. Handoff Deliverables & Files

1. **Tokens** `docs/design-tokens.json:1` (this)
2. **Handoff** `docs/high-fi-handoff.md:1` (this file)
3. **Plan** `docs/product-plan.md:1` + `docs/vercel-deploy-plan.md:1`
4. **Figma:** create frames mirroring §3 (Home, Search, Detail, Basket, Checkout Step 1/2, Confirm, My Trips) — use Tailwind spacing (4px base) and tokens; export via `scripts/asset_export.py --figma-file FILE_ID` when linked.
5. **QA:** `scripts/design_qa.py --spec spec.figma --impl https://staging` + `scripts/a11y_checker.py --url https://staging` before accept.

---

## 9. What To Build First (engineering order, smallest diffs)

1. Token contrast fix + navbar unify (1 PR).
2. Search wiring (mocks → JSON/Supabase, sort, mobile drawer) + Detail page shell.
3. Basket verify fix + kill Save for Later.
4. Checkout stepper + honest pricing (touches pricing.ts + finalize).
5. Confirm celebration + invoice print.

Each PR includes before/after screenshots at 375px + 1280px + keyboard nav video.

**Decision log:** VoyageFlow → TravelEase per your “both — TravelEase high-fi” (this message). If you meant “both brands keep”, reply — but handoff now assumes TravelEase everywhere.
