# Free / $0 workshop surfaces taken offline — 2026-08-07

Both August sessions are paid. August 19 is the online session at $25. August 27
is the in-person session at Salt Lake Community College, Miller Campus, at $50.
Free-seat copy is a standing defect on its own now, independent of any date, so
every surface still offering or confirming a $0 seat came down in one pass.

Commit: `639f0b7` on `main` (routing), `bea7456` the same morning (the July 16
page, by the systems lane, before this pass).

## What was still live before the change

Enumerated against the live host from the VPS, not from the repo, because the
laptop's TLS is intercepted and its own curl output is not trustworthy here.

| URL | Before | What it served |
|---|---|---|
| `/free-thank-you/` | 200 | "You're in. Your free seat is saved" — July 30 |
| `/free-thank-you/index.html` | 200 | same page, explicit index form |
| `/ai-checklist/index.html` | 200 | "Claim my free seat **$0**" capture form |
| `/rsvp-0730/index.html` | 200 | "$0, no card" comp-seat RSVP, July 30 |
| `/seat/index.html` | 200 | $47 July 30 "Reserve my seat" CTA |
| `/workshop-b/index.html` | 200 | $47 July 30 variant of the workshop page |

The last four already carried a retirement 301 from the 2026-08-04 sweep, but
every one of those rules was written `^page/?$`, which never matches the
explicit `index.html` form. The file was reached directly and served
unredirected. This is the same gap the July 16 retirement found and closed on
its own page; the fix here is the same shape, `(/index\.html)?/?$` with `NC`.

## What it is now

| URL | After | Mechanism |
|---|---|---|
| `/free-thank-you/` (all forms) | **404** | `RewriteRule ^free-thank-you(/index\.html)?/?$ - [NC,R=404,L]` |
| `/ai-checklist/` (all forms) | 301 → `/workshop/` | existing rule, pattern widened |
| `/rsvp-0730/` (all forms) | 301 → `/workshop/` | existing rule, pattern widened |
| `/seat/` (all forms) | 301 → `/workshop/` | existing rule, pattern widened |
| `/workshop-b/` (all forms) | 301 → `/workshop/` | existing rule, pattern widened |

**No file was deleted.** `free-thank-you/index.html` and all four retired pages
stay in the repo exactly as they were. Only routes changed. Each rule carries
its own restore instructions inline in `.htaccess`.

### Why `/free-thank-you/` 404s instead of redirecting

Every other retired page here is a **landing** page, where someone holding an
old link should land on the live offer. `/free-thank-you/` is a **confirmation**
page. Redirecting it would take a visitor who was told their free seat is saved
and drop them on a $50 sales page, which reads worse than the page simply being
gone. It is linked from nowhere (repo-wide grep finds one code comment and no
href), it is absent from `sitemap.xml`, and it already carried
`noindex,nofollow`. The 404 is what removes it from any index that still holds
it.

## Untouched on purpose

`/seat/thank-you/` and `/online/thank-you/` are **active Stripe return URLs**
and must keep resolving — `/seat/thank-you/` for the $50 August 27 link and the
$25 credit link, `/online/thank-you/` for the $25 August 19 link. `/workshop/`
and `/online/` themselves were not edited at all.

## Stripe: how "no live link leads to a free seat" was established

All 25 payment links on the account were listed read-only through the Stripe API
(`GET /v1/payment_links?limit=100&expand[]=data.line_items`, `has_more:false`, so
the enumeration is complete and not truncated), with each link's
`after_completion.redirect.url` and its line-item `unit_amount`.

- Exactly **one** link's redirect points at `/free-thank-you/`:
  `plink_1TtUuGQWqcWWuBB05dFBgLDD` — "AI Workshop - Free Seat (July 30, Sandy
  UT)", `unit_amount: 0`. It was **already INACTIVE** before this pass. Opening
  it in a browser renders "The link is no longer active."
  (`stripe-free-0-inactive-*.png`).
- It is also the **only** `unit_amount: 0` link that exists anywhere on the
  account. No other link is free.
- No active link's redirect points at any free-seat page.

**No Stripe object was created, changed or deactivated.** There was nothing to
deactivate. Every Stripe call made here was a read.

## Screenshots in this folder

Captured with Playwright against the live host at 1440x900 and 375x812, both
widths for every target. `verification.json` holds the requested URL, HTTP
status, final URL after all redirects, and page title for each.

- `free-thank-you-slash-*`, `free-thank-you-indexhtml-*` — 404, "This Page Does
  Not Exist"
- `ai-checklist-indexhtml-*`, `rsvp-0730-indexhtml-*` — land on `/workshop/`
  with their UTMs intact
- `paid-workshop-aug27-*` — Thursday, August 27, 7:00 to 8:30 pm, Salt Lake
  Community College Miller Campus, seat $50, "Reserve my seat"
- `paid-online-aug19-*` — Wednesday, August 19, 11:00 am to 12:00 pm Mountain,
  online on Google Meet, seat $25, "Reserve my seat"
- `stripe-aug27-50-*` — $50.00, "AI Without Getting Burned - Workshop Seat"
- `stripe-aug19-25-*` — $25.00, "AI Without Getting Burned, online session"
- `stripe-free-0-inactive-*` — "The link is no longer active."

The live pages were also read back from the VPS to confirm the deployed HTML
carries the right checkout: `/workshop/` → `9B63cxclV6RIcnC7QVgEg0m`
(`plink_1U0tVO`, $50.00, active); `/online/` → `dRmfZjadN7VM73i1sxgEg0n`
(`plink_1U1CWw`, $25.00, active).

## Two branches closed, neither merged

Both are preserved as annotated tags and can be restored with one command. The
tag messages carry the full reasoning.

- `archive/w-july16-free-rsvp` (was `feat/w-july16-free-rsvp`, tip `e910970`).
  Re-adds the $0 July 16 page `main` deleted at `bea7456`, plus `.htaccess`
  hunks already superseded and `workshop/index.html` hunks patching July 30 copy
  that no longer exists on the page. Conflicts on both files.
- `archive/ai-checklist-name-capture-before-stripe-0725` (was
  `fix/ai-checklist-name-capture-before-stripe-0725`, tip `2abe781`). Touches
  only `ai-checklist/index.html`, a page that now 301s on every form and whose
  $0 Stripe link is inactive, so the code cannot run for anyone. The real ad-UTM
  pass-through it adds is already live on both money pages, which build their
  capture payload from `qs.get('utm_source'|'utm_medium'|'utm_campaign'|
  'utm_content')` with fallbacks.

## Open, reported rather than acted on

Three findings that sit on the damage list (money, checkout flow) and are
Boubacar's call, not an agent's:

1. **`plink_1U1DRSQWqcWWuBB0s36nUw4E` is ACTIVE** — $25.00, "AI Without Getting
   Burned - Workshop Seat", returning to `/seat/thank-you/`. This is the August
   19 attendees' $25 credit seat for August 27. Its page `/seat/aug19-credit/`
   was retired on 2026-08-06 because it publicly undercut the $50, but the
   payment link itself is still live and reachable by anyone holding the URL.
2. **Neither money page captures a name.** `/workshop/` and `/online/` collect
   email only, and post no `name` field. The closed branch above had the fix,
   scoped to a page that is now offline. Porting it to the two live pages is a
   change to both August checkout flows.
3. **`/seat/index.html` and `/workshop-b/index.html` were serving a $47 July 30
   CTA** whose Stripe link (`plink_1TgCDE...`) is already inactive, so a click
   dead-ended on a Stripe error page. The routes are closed here. The pages are
   $47, not free, so they sat just outside the literal scope of this pass —
   flagged so the call is visible rather than silent.
