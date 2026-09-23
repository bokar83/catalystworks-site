# STYLE_LOCK — Catalyst Works, v1 revenue path

> **FROZEN on write.** This file is the source of truth for the Catalyst Works visual system.
> The generator reads it before writing markup. The reviewer scores against IT, not only against
> the universal ban list (`skills/design-audit` Dimension 5). A change to this file is a new
> change-log line in `agentsHQ/docs/prds/catalystworks-design-refresh-2026-09/PRD.md`, signed by
> `dev-product-manager` — never a silent edit by whoever is building next.
>
> **Scope:** the nine v1 pages named in PRD §8c. The other 56 pages keep their inline token
> blocks and are byte-unchanged.
> **Authority:** PRD §8a. Mechanism: absorb R1
> (`memory/project_antislop_design_tooling_absorb_2026_09_22.md` §4).
> **Phase:** 1 of 6 (`cw-design-style-lock`). No CSS and no HTML is written by this phase.
> **Date:** 2026-09-22 · **Branch:** `feat/cw-design-style-lock-2026-09-22`
> **Amended 2026-09-23:** five typography and accessibility fixes (§1 rust row, §2), approved by
> Boubacar ("proceed on all"), Karpathy + Council re-run on the delta (§12). PRD change-log line
> of the same date.

---

## 0. Why a positive lock, in one paragraph

Every anti-slop mechanism we own is negative and fires *after* generation. A ban list produces
the absence of slop; only a positive, specific, pre-generation commitment produces the thing
Boubacar has been asking for since 2026-05-27. **You cannot subtract your way to taste.** This
file is the positive half. Section 9 is the negative half, and it is deliberately the shorter one.

---

## 1. Palette — eight tokens, and no color may appear on a v1 page that is not one of them

```
--ink: #0A0E14
--ink-raised: #121826
--paper: #F5EFE2
--clay: #B47C57
--amber: #E8A66B
--rust: #C95F4D
--line: rgba(245,239,226,0.12)
--t-mid: rgba(245,239,226,0.78)
--t-muted: rgba(245,239,226,0.55)
```

| Token | Value | The ONE job it has | Hard ceiling |
|---|---|---|---|
| `--ink` | `#0A0E14` | base surface. Near-black with a cold blue undertone, never pure `#000000` | — |
| `--ink-raised` | `#121826` | the ONLY elevated-panel color on the site | one elevation step. There is no second. |
| `--paper` | `#F5EFE2` | primary text. Bone, never `#FFFFFF` | — |
| `--clay` | `#B47C57` | structural accent: rules, indices, margin rail, borders | unlimited — it is structure, not emphasis |
| `--amber` | `#E8A66B` | single highlight + CTA fill + base link color | **one per viewport, maximum** |
| `--rust` | `#C95F4D` | emphasis / alert ONLY. Never decorative | **max one instance per page.** As TEXT it sits on `--ink` only (4.81:1). On `--ink-raised` it measures 4.41:1 and fails 4.5:1, so there rust is a non-text mark only (a rule, a dot, a border) |
| `--line` | `rgba(245,239,226,0.12)` | the hairline. The separator of record | — |
| `--t-mid` | `rgba(245,239,226,0.78)` | body text at reading weight | — |
| `--t-muted` | `rgba(245,239,226,0.55)` | captions, small print, mono labels | — |

**Why cold-undertone near-black and not pure black.** Measured against the exemplar corpus:
`hqforwork.com` sits on true `rgb(0,0,0)` (computed style, 2026-09-22 render). We deliberately
do **not** copy that. `#0A0E14` carries a blue undertone that pushes the warm accents
(`--clay`/`--amber`/`--rust`) forward optically; on pure black the same warm accents read as
muddy rather than lit. This is a refinement *away* from the exemplar, stated on purpose — and it
is independently corroborated by `lovable.dev/guides/website-design-trends-2026` trend 4, which
prescribes **dark grey rather than pure black** as the primary dark surface. That source is a
mixed signal overall (see §10) and this is one of the three places its advice survives.

**Why exactly one accent at a time.** `wavespace.agency/blog/best-website-design-examples`
describes Jeton (jeton.com) as a black-and-white platform carrying a single signature orange
accent — the same structural bet this lock makes with `--amber`. **BORROW as corroboration:**
near-monochrome plus one warm accent is a system; the site's current six accents are not. The
ceiling in the table above is the operative rule, not the observation.

**Elevation is a consolidation, not an invention.** `index.html:216-217` currently carries TWO
elevated surfaces, `--ink-2 #0F141C` and `--ink-3 #161D27`. Two elevation steps on a page with
no z-axis story is how a palette becomes six palettes. `--ink-raised #121826` replaces both.

### Link states — mandatory and explicit on every v1 page

HARD rule, five prior violations. Never blue, never an unstyled `<a>` falling back to `#0000ee`.

```
a           { color: var(--amber); }
a:visited   { color: var(--clay); }
a:hover     { color: var(--paper); }
a:active    { color: var(--rust); }
```

Inside an `--ink-raised` panel, `a:active` uses `--paper`, not `--rust` (rust text fails 4.5:1
on `--ink-raised`, §1).

Ship gate: `python scripts/check_no_blue_on_dark.py` must exit `0` on all nine. A hex grep is not
sufficient — the most common real violation is a *missing* base `a{color}` rule.

### The binding rule is the ALLOWLIST, not a kill-list

**Any hex on a v1 page that is not one of the six above is deleted. No exceptions, no
grandfathering, no "it was already there."** This is stated as an allowlist deliberately, and
the reason is measured:

> **Counted over the nine v1 pages on `origin/main`, 2026-09-22: 35 distinct hex values are
> live. Six are the allowlist. 28 of the remaining 29 are named nowhere — not in PRD §8a's
> "killed by name" list and not in ACCEPTANCE_CONTRACT line 12's explicit absent-list.**

PRD §8a's kill-list names 14 hexes. Checked against the actual tree, almost all of them live on
the **other 56 pages**, which are out of scope. A generator that treated that list as the spec
would delete nearly nothing and still believe it had complied. Contract line 12 gets this right
— it asserts *"output contains **only** the six hexes"* — and this section now matches its shape
rather than its examples.

The full measured set of 29 to be removed, for the phase-2/3 engineer, so nobody re-derives it:

```
#0F141C #14202B #161D27 #17222E #1A2E4A #1B2331 #1e3560 #22c55e #26333F #2C4A7C
#3d4466 #5BC0BE #7a8099 #A5691F #B0722C #c4c9d8 #c98010 #C98A3F #D08A50 #e05252
#E4DBC7 #E8A020 #E8DFCB #eef0eb #f59e0b #F0E8D8 #F5D6B8 #F7F6F2 #F8F3E9 #ffffff
```

Four of these are worth naming individually, because each is a different class of defect:

- **`#E8A020`** — 14 occurrences, the second-most-common hex on the revenue path, all in
  `audit/index.html`, and declared as **`--teal: #E8A020`** (`audit/index.html:20`) — a token
  named *teal* holding an *orange*. Migration must be driven by **value**, never by token name.
- **`#f59e0b`** (`audit/index.html:29`, verified) — the unchanged Tailwind `amber-500` default.
  Automatic deduction under the 2026-05-27 decision doc's E4 list. **`#22c55e`** is Tailwind
  `green-500`, the same defect, and the PRD missed it.
- **`#2C4A7C` / `#1e3560` / `#1A2E4A`** — navy. PRD §2 places navy only on out-of-scope client
  and audit pages; it is in fact **live on the v1 revenue path**, which makes anti-reference 2
  an active removal rather than a precaution.
- **`#ffffff`** — pure white, 3 occurrences, against a lock that sets `--paper #F5EFE2`
  "never `#FFFFFF`." The rule already existed; the violation was simply never counted.

`#0F141C` and `#161D27` are the two elevation steps collapsed above. `#5BC0BE` (cyan) is dropped
because six accents is not a system.

*Verified this session, not recalled:* `grep -oh '#[0-9A-Fa-f]\{6\}' $NINE | sort -uf` over the
nine files at `origin/main`. The homepage's Three.js hero was checked separately and carries
**no hex literals inside `<script>`** — so ACCEPTANCE_CONTRACT line 12 (only six hexes) and line
21 (Three.js byte-unchanged) do **not** collide. That risk was real enough to test and is
disproven.

---

## 2. Type — three faces, no fourth

| Face | Weights | Role |
|---|---|---|
| `Spectral` | 600 / 700, italic 600 | display, headings, pull-quotes, prices |
| `Public Sans` | 400 / 500 / 600 | body and UI |
| `JetBrains Mono` | 400 / 500 | eyebrows, indices, labels (4 words or fewer) |

**Removed site-wide from the v1 pages:** `Inter` (live right now at `index.html:233`,
`--sans: 'Inter'`), `Fraunces`, `Anton`, `Spline Sans`, `Spline Sans Mono`, `Gloock`.

Public Sans is chosen over Inter on evidence, not taste: it is already carried by 20+ pages of
this site, it is on no banned-reflex list, and it reads as a civic grotesque rather than a 2023
SaaS default.

**Three faces against a two-face convention — answered, not ignored.**
`wavespace.agency/blog/best-website-design-examples` states the common rule as *"no more than
two types, one for headings, one for body."* This lock carries three and that is deliberate:
`JetBrains Mono` is not a third display voice, it is a **functional register** confined to
eyebrows, indices, labels, prices-small and the margin rail (§6). It never sets a heading and
never sets body copy. Under the convention's own logic — one heading face, one body face — this
lock complies; the mono is instrumentation. A reviewer who flags "three faces" should check
whether the mono ever sets running text. If it does, that is the violation, not the count.

**Variable-font axes: considered and refused.** The same trend source (trend 9) prescribes
variable fonts for continuous weight/width control. All three faces here ship variable versions
on Google Fonts, so this was available. **AVOID.** Continuous axes invite an unbounded set of
weights, which is precisely how a locked type system drifts back into six systems. The discrete
weights named in the table above are the point of the lock.

### Type scale — five steps, nothing between them

```
13px                        mono label
15px                        body-small
19px                        body
clamp(21px, 2.6vw, 27px)    subhead
clamp(40px, 6vw, 72px)      display
```

Mono eyebrow fixed at 10.5–13px, `letter-spacing: 0.14em`, uppercase.
Display tracking: `-0.03em`. Subhead tracking: `-0.015em`.

**Line-height (added 2026-09-23; the lock previously named none):**

```
body, body-small    1.5 minimum
subhead             1.2 to 1.3
display             1.05 to 1.1
```

Paragraph spacing is at least 1.5× the body line-height. Every v1 page must survive the WCAG 2.x
SC 1.4.12 user overrides (line-height 1.5, paragraph spacing 2em, letter-spacing 0.12em, word
spacing 0.16em) with no clipped or overlapping text. *Source:* British Dyslexia Association
Dyslexia Style Guide 2023 (line spacing 1.5); WCAG SC 1.4.8 and 1.4.12.

**Uppercase is for short labels only.** Uppercase mono is permitted on labels of **4 words or
fewer**: eyebrows, button labels, indices. Anything longer (small print, disclaimers, any
sentence-length line) is set in `Public Sans` at the 15px body-small step, sentence case, never
uppercase mono. *Source:* BDA 2023, "avoid capitals for continuous text."

**Emphasis inside body copy is bold, never italic.** `Public Sans` 600. Italic in running text
is banned. The only italic on a v1 page is the one display-size word below. *Source:* BDA 2023
("use bold for emphasis, avoid italics"); Rello & Baeza-Yates 2013, ACM ASSETS (italic read
worse for dyslexic readers).

### The one permitted typographic emphasis device

**A single word inside a display headline may be set in `Spectral` italic 600 while the rest of
the line stays in `Spectral` roman.** Headings are Spectral, per the table above. Maximum one
such word per page, and only in the display step.

*(Corrected 2026-09-23. This sentence previously ended "stays in `Public Sans`", which
contradicted the table. The table governs.)*

*Source:* `hqforwork.com`, rendered 2026-09-22 — its H1 reads "The company *brain* that AI runs
on," where `brain` alone is a serif italic (`Fraunces`, computed `font-style: italic`) inside an
otherwise sans headline. **BORROW.** It is the single cheapest move in the corpus that produces
a distinctly authored headline without adding a face, a color, or a graphic. Our lock already
carries Spectral italic 600 (PRD §8a), so this costs nothing new — it only names a use for a
weight that was otherwise going to sit unused. We borrow the *mechanic* and not the face:
`Fraunces` is on our banned list (anti-reference 6) and Spectral italic does the same job.
The source mixes two faces in one line; we do not. Our version is italic against roman
inside one face.

---

## 3. Grid and rhythm

**8pt base grid.** Every spacing value resolves to a token or a multiple of 8. No arbitrary px.

**Three section steps only — there is no fourth:**

| Breakpoint | Steps |
|---|---|
| ≥1024px | `96` / `144` / `192px` |
| ≤768px | `64` / `88` / `112px` |

**Body measure hard-capped at 68ch.** (`services/index.html:108` currently caps `.rung-desc` at
`52ch`, which is inside the cap and stays.)

**A 12-column grid is refused, and the refusal is the archetype talking.**
`wavespace.agency` prescribes a 12-column desktop grid and *"standard paddings, margins and
gutters so layouts breathe evenly."* The second half is this lock's 8pt rule and is already in.
The first half is **AVOID**: a 12-column grid is the substrate of the card layouts §5 bans, and
`EDITORIAL_NARRATIVE` is a single reading column with a margin rail — a two-track structure, not
a twelve-track one. Adopting 12 columns would quietly re-authorize the card grid.

**Its type scale is also refused, deliberately.** That source's worked example is `H2 24px /
body 16px`. This lock sets body at **19px** and subhead at `clamp(21px, 2.6vw, 27px)`. Larger
body on a 68ch measure is an editorial reading setting rather than a SaaS-marketing one, and it
is the setting the archetype requires. Noted so a later reviewer does not "correct" it toward
the convention.

**Performance is a non-regression check, not a budget to chase.** Same source, trend 10 from
`lovable.dev`: LCP under 2.5s. **BORROW, narrowly scoped:** the requirement here is that LCP on
each of the nine pages is **no worse than it is on `origin/main`**. The homepage loads a pinned
Three.js r149 hero which dominates its LCP and which PRD §4.4 forbids touching in either
direction. Chasing an absolute 2.5s target would mean changing that include, which is out of
scope; preventing a regression is in scope and is cheap to measure.

---

## 4. Motion — "settle, never bounce"

```
--ease: cubic-bezier(0.22, 1, 0.36, 1)   /* the ONLY easing token */
240ms   micro-interaction
520ms   entrance
```

- Entrance is `opacity 0→1` plus `translateY(12px)`. Nothing else. No scale, no blur, no rotate.
- ScrollTrigger reveals fire **once**. Never scrub.
- Banned outright: parallax, count-up numbers, typewriter effects, **scroll-jacking**, kinetic
  typography (letters that scale, rotate or track the cursor), morphing page transitions,
  background video, and any overshoot or bounce curve.
- `prefers-reduced-motion: reduce` disables **every** transform. Not a subset.

*Corpus note on the scroll-animation reflex.* `details.so/inspo` publishes tag counts for its
library: **Scroll Animations 406, Heroes 374, Editorial 277, Minimal 244, Pinned Scroll 196,
Brutalist 53.** Read honestly, that is a **supply-side** count — it says scroll animation is the
most-supplied pattern in the inspiration economy, and it says nothing about whether it works on
a consulting site. It is cited here as a reason for caution about a reflex, never as evidence
that motion converts badly. `deadsimplesites.com` states its selection criterion as exactly
three exclusions, quoted verbatim: *"No overly animated content. No scroll jacking. No excessive
storytelling. Less, but better."* **BORROW** — "no scroll jacking" is a concrete ban this lock
did not previously name, and it is now in the list above.

**This is a measured tightening, not a restatement.** Grep over the v1 pages on `origin/main`
(2026-09-22) found **ten distinct durations in live use** — 180, 200, 220, 240, 280, 300, 320,
600, 700, 800ms — and **two** easing curves: `cubic-bezier(0.22, 1, 0.36, 1)` and
`cubic-bezier(0.16,1,0.3,1)`. The second curve is deleted. Ten durations collapse to two.
A page whose micro-interactions land on three near-identical timings reads as assembled rather
than designed, and no reviewer catches it by eye.

Also deleted: `--shadow: 0 24px 64px rgba(0,0,0,0.5)` (`index.html:237`). Depth on this site is
carried by the hairline and by `--ink-raised`, never by a drop shadow (see §5).

---

## 5. Structural archetype — ONE, named: `EDITORIAL_NARRATIVE`

A single reading column with a mono index rail. **Hairline rules are the separator of record.**
Sections are separated by rules and rhythm, not by boxes.

**Not** `CINEMATIC_AGENCY`. **Not** `CONVERSION_FIRST` card grids.

Binding consequences, stated so they are checkable rather than aspirational:

1. No element groups content with a border box, a rounded card, a tinted panel or a drop shadow
   where a hairline and spacing would do.
2. `border-radius` is `0` on structural containers. It survives only on genuinely interactive
   controls (buttons, inputs), and there at a single value.
3. There is no "three cards in a row" section anywhere in the nine pages.

*Corpus confirmation:* `hqforwork.com` executes this exactly, and it is the site Boubacar told
us to look at beyond the code. Its three-up value section (rendered 2026-09-22, desktop 1440px)
uses a mono `// 01` `// 02` `// 03` index, vertical hairline rules between columns, and **no
card, no border box, no shadow and no background fill of any kind.** Independent confirmation of
the archetype the PRD had already chosen, arrived at from a site he selected himself.

---

## 6. The one signature move — the five-lens index rail

**The step/lens index sits in the left margin in `JetBrains Mono` at `--clay`; the content hangs
off a `--line` hairline; no card, border box or drop shadow groups it.**

There is exactly one signature move. Two would be decoration, not identity.

**This is a change, not a restatement — and the PRD's own wording understates it.** PRD §8a calls
the rail "already latent on the homepage (`.rung-index`, `services/index.html:104`)." The mono
index element is indeed there. **The rail is not.** Read in full at `services/index.html:95-116`,
each `.rung` is currently a card:

```
.rung.is-primary { background: linear-gradient(180deg, rgba(232,166,107,0.07) 0%, rgba(15,20,28,0.6) 100%);
                   border-color: rgba(232,166,107,0.34); }
.rung.is-primary::before { ...height: 2px; background: linear-gradient(90deg, transparent, var(--amber), transparent); }
.rung:hover      { transform: translateY(-2px); }
.rung-guarantee  { border-radius: 10px; background: rgba(232,166,107,0.08); border: 1px solid ... }
.rung-cta        { border-radius: 9px; ... }
.rung-cta:hover  { box-shadow: 0 10px 26px rgba(232,166,107,0.30); }
```

A bordered, radiused, gradient-filled card with a highlighted "primary" variant carrying a
gradient top-bar and a hover lift **is** anti-reference 3 (the three-card pricing grid with a
"Most Popular" ring and a gradient backdrop), live on the revenue path today. Realizing the
signature move means **deleting the card**, not styling it: drop the gradient fill, the
`::before` gradient bar, the hover lift, the panel radii and the CTA glow; keep the mono index,
promote it to the left margin, and let a single `--line` hairline do the grouping.

The rail is the only structural device on this site a competitor cannot copy without adopting
the diagnostic method, because it *is* the method.

**Also borrowed from the corpus, one detail:** the index glyph may carry a `//` prefix
(`// 01`), as `hqforwork.com` does. **BORROW** — it costs nothing, it is mono-native, and it
reads as a code comment, which is on-method for a diagnostic firm. It is a refinement of the
existing bare `01` at `services/index.html:214`, not a new device.

---

## 7. Controls

- **Buttons are square.** `border-radius: 0` — replacing the current `9px`/`10px` mix.
  Primary is `--amber` fill on `--ink` text. Secondary is a `--line` hairline outline on
  transparent. *Source:* `hqforwork.com` renders both its hero CTAs at zero radius with
  uppercase wide-tracked labels. **BORROW** — square corners are the single clearest signal of
  restraint available, and the current 9px/10px inconsistency is itself a defect.
- Button labels: `JetBrains Mono`, uppercase, `letter-spacing: 0.14em`, 13px, 4 words or
  fewer (§2).
- Hover on a button is a **color** change, never a lift and never a glow. The existing
  `translateY(-1px)` + `box-shadow: 0 10px 26px rgba(232,166,107,0.30)` is deleted — a glow is
  the "real glow" of his personal-brand palette leaking onto the business site (PRD §19 D-2).
- Touch targets ≥44px on every viewport.

### Accessibility floor — checkable, not aspirational

This section exists because the corpus exposed a real gap: PRD §8a specified color, type, grid,
motion and archetype, but named no contrast ratio and no keyboard requirement. Filled from
`lovable.dev/guides/website-design-trends-2026` trend 7 (Accessibility-First) and trend 4, whose
accessibility mechanics survive independent judgement even where the rest of that source does not.

- **WCAG 4.5:1 minimum** contrast for all body text and all link text against its own background.
  `--t-muted` on `--ink` is the tightest pair in the system and is the one to measure first.
- Every interactive control reachable and operable by **keyboard alone**, with a visible focus
  state drawn in `--amber` — never the browser default outline suppressed with `outline: none`.
- Every `<img>` carries descriptive `alt`. Every form field carries a real associated `<label>`.
- **No dark/light theme toggle** (PRD §4.8). The trend source prescribes dual-mode theming; we
  refuse that half and keep only the contrast floor and the near-black-not-pure-black rule.
- A nav that exists on mobile is a **hamburger**. A horizontal pill/scroll jump-nav is not a
  substitute below the breakpoint (HARD rule 2026-07-14). *Corpus note:* `hqforwork.com` renders
  a hamburger at 375px, verified by screenshot.

---

## 8. Imagery

**v1 adds no new imagery, no new illustration and no new 3D** (PRD §4.4). The pinned Three.js
r149 hero on `index.html` is left exactly as-is — neither extended nor removed.

Stated so a later phase does not mistake silence for permission: `hqforwork.com`'s strongest
craft move is a full-bleed painterly illustration band carrying a texture built from the brand's
own letterforms (the `H`/`Q`/`#`/`/` glyph scatter visible across its hero canopy at 1440px).
It is genuinely excellent and it is **AVOID for v1** — not because it is wrong, but because it
requires commissioned art and is explicitly out of scope. Logged to the PRD §17 parking lot
rather than borrowed. An agent that adds an illustration to v1 has broken §8c, not improved it.

---

## 9. Anti-references — named for THIS build

1. Dark + purple/violet + neon glow. His 2026-05-27 verbatim complaint. Banned here **even
   though it is his personal-brand direction elsewhere** (PRD §19 D-2).
2. Navy + orange — the contractor/agency category reflex, currently live on two pages.
3. The three-card pricing grid with a "Most Popular" ring and a gradient backdrop.
   **Currently live at `services/index.html:95-102`** — see §6.
4. Tailwind or shadcn defaults at any hex, unchanged. Specifically `#f59e0b` at
   `audit/index.html:29`.
5. Glassmorphism panels, gradient text, side-stripe card borders, identical card grids.
6. `Inter` / `Fraunces` / `DM Sans` / `Plus Jakarta Sans` / `Space Grotesk` / `Geist Sans`.
7. Stock-photo hero, "trusted by" monochrome logo strip, 4-column identical-link footer.
8. The `boubacarbarry.com` afrofuturist-neon system — a sibling brand's voice, deliberately not
   this one's.
9. Pure `#000000` as a page background. See §1.
10. Drop shadows used to create depth or to group content. The hairline does that job.
11. More than one easing curve, or more than two durations, anywhere in the nine pages.
12. A second signature move. One is identity; two is decoration.
13. Scroll-jacking, pinned-scroll sequences and morphing page transitions.
14. Kinetic typography — letters that scale, rotate, or respond to cursor position.
15. Organic/anti-grid layout devices: curved section dividers, SVG shape dividers, soft blob
    shapes, asymmetric "flowing" section boundaries.
16. A 12-column grid as the page substrate. See §3.
17. Neo-brutalist high-contrast color slabs. (The one neo-brutalist trait this lock keeps is
    zero-radius geometry — §7 — and it keeps it for restraint, not for the style.)
18. Behavior-based personalization, dynamic hero swapping, or any runtime content variation.
    The site is static HTML with frozen copy (PRD §3.1, §9).
19. `outline: none` on a focus state without a visible replacement. See §7.

---

## 10. Source log — every call traces to a named source

No borrow in this file rests on "inspired by modern trends." Each row names what was examined,
what was taken or refused, and why.

Boubacar supplied a corpus of seven inspiration links on 2026-09-22, resolving PRD §18 OQ-1 —
the "pages he has personally approved" that both design absorbs flagged as the missing ground
truth. The full per-link analysis lives in **agentsHQ** at
`docs/prds/catalystworks-design-refresh-2026-09/INSPIRATION_CORPUS.md`. It is deliberately NOT
in this repo: ACCEPTANCE_CONTRACT line 18 asserts this build's diff is **exactly 11 paths**, and
a twelfth file here would fail it.

| # | Call | Source | Reason |
|---|---|---|---|
| 1 | BORROW: un-carded index rail, hairline separators | `hqforwork.com`, rendered 1440px 2026-09-22 | Its three-up uses `// 01` + vertical hairlines and zero boxes. Confirms `EDITORIAL_NARRATIVE` (§5) from a site he chose. |
| 2 | BORROW: `//` prefix on the index glyph | same | Mono-native, reads as a code comment, on-method for a diagnostic firm. Refines the bare `01` at `services/index.html:214`. |
| 3 | BORROW: one italic word inside a roman display headline (the source's serif-in-sans mix is not borrowed; ours is Spectral italic in a Spectral line, corrected 2026-09-23) | same, H1 "The company *brain*…" | Cheapest authored-headline move available. Uses Spectral italic 600, already in the lock. Face itself refused (anti-ref 6). |
| 4 | BORROW: zero-radius buttons, uppercase wide-tracked labels | same, both hero CTAs | Clearest available signal of restraint; fixes the live 9px/10px inconsistency. |
| 5 | AVOID: pure `#000000` background | same, computed `body` background | Warm accents read muddy on true black; `#0A0E14`'s cold undertone lifts them. Deliberate divergence from the exemplar. |
| 6 | AVOID: `Geist Sans` / `Fraunces` / `Urbanist` | same, computed font stack | `Fraunces` is a named banned face (PRD §8a); Geist is the Vercel default reflex, same class of tell as Inter. |
| 7 | AVOID (park, do not build): painterly full-bleed illustration + brand-letterform texture | same, hero canopy glyph scatter | Genuinely excellent and genuinely out of scope — needs commissioned art. PRD §4.4 / §17. |
| 8 | KILL: `cubic-bezier(0.16,1,0.3,1)`, 8 of 10 live durations, `--shadow` | grep over the nine v1 pages on `origin/main`, 2026-09-22 | Ten durations and two curves measured in live use. Assembled, not designed. |
| 9 | KILL: `--ink-2 #0F141C` + `--ink-3 #161D27` | `index.html:216-217` | Two elevation steps with no z-axis story. Collapsed to one `--ink-raised`. |
| 10 | KILL: `.rung` card, gradient bar, hover lift, CTA glow | `services/index.html:95-116`, read in full | Is anti-reference 3, live on the revenue path today. |
| 11 | BORROW: near-black, not pure black | `lovable.dev` trend 4 | Independently corroborates §1's divergence from the `hqforwork.com` exemplar. |
| 12 | BORROW: WCAG 4.5:1, keyboard operability, alt text, labeled fields | `lovable.dev` trends 4 + 7 | Fills a real gap — PRD §8a named no contrast ratio and no keyboard requirement. |
| 13 | BORROW: motion scoped to functional moments only | `lovable.dev` trend 3 | Corroborates "settle, never bounce" and the 240ms micro token. |
| 14 | BORROW: LCP no worse than `origin/main` | `lovable.dev` trend 10 | Scoped to non-regression; the absolute 2.5s target would require touching the pinned Three.js hero, which PRD §4.4 forbids. |
| 15 | BORROW: "No scroll jacking. Less, but better." | `deadsimplesites.com`, stated criterion, quoted verbatim | A concrete ban the lock did not previously name. Now anti-reference 13. |
| 16 | BORROW: near-monochrome + exactly one accent | `wavespace.agency`, on Jeton | Corroborates the one-accent-per-viewport ceiling in §1. |
| 17 | AVOID: kinetic typography, scroll choreography, 3D/WebGL, background video, morphing transitions | `lovable.dev` trends 2 + 8; `wavespace.agency` on Lusion and Noomo; `details.so` tag counts | Violates the §4 motion lock and PRD §4.4. This is the single largest block of advice in the corpus and it is refused wholesale. |
| 18 | AVOID: AI personalization / dynamic hero swapping | `lovable.dev` trend 1 | Static HTML, no build step (PRD §9), and copy is frozen (PRD §3.1). |
| 19 | AVOID: organic shapes, curved/SVG section dividers, soft shadows | `lovable.dev` trend 5 | Violates the 8pt grid, the hairline-as-separator rule and the no-drop-shadow rule. |
| 20 | AVOID: neo-brutalist high-contrast color slabs; PARTIAL BORROW of zero-radius geometry only | `lovable.dev` trend 6 | The palette half is a category reflex; the geometry half independently supports §7. |
| 21 | AVOID: variable-font continuous axes | `lovable.dev` trend 9 | Unbounded weights are how a locked type system drifts. Discrete weights are the lock. |
| 22 | AVOID: 12-column grid substrate; AVOID its `H2 24px / body 16px` scale | `wavespace.agency`, stated principles | 12 columns re-authorizes the card grid; 19px body on 68ch is the editorial setting the archetype requires. |
| 23 | NO BORROW — honest null result | `siteofsites.co/?p=1`, `details.so/inspo`, `ixdf.org/...ui-design-patterns` | All three are directories/taxonomies. They name sites and tags; they state **no hex, no typeface, no spacing number and no easing value** for any entry. Nothing was taken because nothing concrete was on offer, and inventing plausible detail from a thumbnail grid is the failure this log exists to prevent. Their value is as a future reference corpus, logged to PRD §17. |
| 24 | Governing principle of this exercise | `details.so/inspo`, stated verbatim | *"The goal isn't to copy what you see. It's to train your eye... Great work is not copied from one source. It is assembled from many good decisions."* |

---

## 11. What would change these conclusions

Stated per the non-code-work rule: a document with no failure condition has no failure signal.

- **Checkpoint 1 (one page, his eyes) reads as still-generic.** Then the body face is the
  suspect, not the palette — PRD §18 OQ-3's parked alternative to Public Sans is the first
  lever, not a palette reopen.
- **Boubacar says the warm-on-near-black direction is wrong.** PRD §19 D-2 is the reasoned
  refusal of afrofuturist-neon for this site; it is reasoning, not a measurement, and his word
  overrides it. That reverses §1 and cascades through §5-§7.
- **The un-carded rail tests worse than the card at 375px.** The rail's left margin is the one
  element with real mobile risk. If it collapses badly, §6 becomes a top-aligned mono index
  above the content rather than beside it — a degradation of the same device, never a return
  to the card.
- **A v1 page genuinely needs a second elevation step.** Then §1's one-elevation ceiling is
  wrong and gets a change-log line — not a quietly added `--ink-raised-2`.

---

## 12. Review record — Karpathy + Council

Recorded in full in `agentsHQ/docs/prds/catalystworks-design-refresh-2026-09/PRD.md` §23, which
is the contract's checked location (ACCEPTANCE_CONTRACT line 5). Summary verdicts:

Both ran against this file on 2026-09-22, before any CSS existed, per the 2026-08-29 install gate.

**Karpathy — FINAL CALL: SHIP.** Two non-blocking WARNs: P2 (472 lines against R1's "small
artifact"; normative rules interleaved with justification — not fixed, because a compact token
restatement would break ACCEPTANCE_CONTRACT line 3's exactly-9 assertion) and P10 (bounded,
justified Kitchen Sink — the accessibility floor and LCP clause exceed PRD §8a's literal ask).
**One real defect caught and fixed before the verdict:** §1's "Killed by name" list implied
completeness while missing 28 of the 29 non-allowlisted colors actually live on the nine pages;
it is now allowlist-shaped with the measured set enumerated. One hypothesis tested and
disproven: contract line 12 (six hexes) does **not** collide with line 21 (Three.js unchanged) —
the hero carries no hex literals inside `<script>`.

**Council — RECOMMENDATION: KEEP, ship as-is, with one rename and one escalation.**

*Convergence, four of five voices independently:* **this is a coherence lock, not a WOW lock.**
The document is ~80% subtraction (29 colors, 8 durations, 1 curve, 1 face, 1 card removed)
against three additive garnishes. The Contrarian's sharpest form: *a signature move that another
site in your own reference corpus executes identically is a convention, not a signature* —
`hqforwork.com` runs the same mono-index-plus-hairline device this lock nominates as the Catalyst
Works signature. First Principles named the mis-specification: PRD §7 defines value as *"the
absence of a jolt"* (coherence) while §13 demands Apple-caliber WOW (distinctiveness); the lock
is graded on the second and built for the first. All four identify the same missing ingredient —
a **proprietary visual asset**, which the corpus found (hqforwork's brand-letterform imagery
texture), which §8 correctly named "genuinely the best craft in the corpus," and then parked.

*Divergence, named not averaged:* the Executor dissents on priority and is right to. He judges
the lock **buildable** — the allowlist, the enumerated hex set and the grep-checkable motion
rules are directly executable — and his findings mean it is already at the edge of what phase 3
can absorb. Enlarging the lock now makes his §2 worse. The two positions resolve by sequence,
not compromise: ship, then let checkpoint 1 settle the WOW question with evidence.

*Executor's four phase-3 breakages, recorded here because they are not elsewhere:*
1. `audit/index.html` is a rebuild, not a migration — 14× `#E8A020` under a token named
   `--teal`, plus two Tailwind defaults. Sequence it last; it is ~3× the other eight.
2. **Escalation, blocking phase 3:** deleting the `.rung` card (§6) removes the mechanism that
   groups price + includes + CTA, so it is a **layout change to the primary pricing surface**.
   PRD §3.1 forbids copy changes and §4.7 forbids IA changes; neither authorizes this. Goes back
   to `dev-product-manager` as a change-log line — never decided by an engineer mid-build.
3. §3's "no arbitrary px" is unachievable as written — the live pages carry `15.5px`, `14.5px`,
   `13.5px`, `10.5px`. Type scales are not grid-bound; phase 2 needs a stated type carve-out or
   it violates its own lock on line one.
4. No defined intermediate state for a page's inline `:root` between phase 2 (CSS exists, zero
   pages wired) and the end of phase 3 (contract line 11: no `:root` survives). An engineer will
   otherwise guess.

*Correction Council makes to this file's own §11:* if checkpoint 1 reads as still-generic, **the
body face is the wrong suspect.** The suspect is the absent proprietary asset. PRD §18 OQ-3's
Public Sans alternative should not be the first lever pulled.

*The one open question only Boubacar can answer, carried to checkpoint 1:* is this build "make
the nine pages stop contradicting each other" — in which case this lock is correct as written and
we proceed — or "make the front door undeniable," in which case we are one commissioned visual
asset short and it should be scoped in before phase 3 rather than after. Different builds,
different budgets. The lock is right for the first and insufficient for the second.

### 2026-09-23 amendment: Karpathy + Council on the delta

The delta was the five typography and accessibility fixes (§1 rust row and link states, §2, §7
button labels, §10 row 3). The source was the agentsHQ memo
`memory/project_cw_style_lock_typography_accessibility_verdict_2026_09_23.md`, and Boubacar gave
the go ("proceed on all").

**Karpathy: SHIP on content.** It first returned HOLD on process, and all of it was resolved before merge:
- It found that bundling a root `.htaccess` deny into this branch would add a 12th path against
  ACCEPTANCE_CONTRACT line 18. That deny now lands as its own commit on main, ahead of this branch.
- It found that this header claimed a re-run record and a PRD change-log line before either
  existed. Both exist now.

Every contrast ratio was recomputed (rust 4.81 on `--ink`, 4.41 on `--ink-raised`), and every
other token pair on `--ink-raised` passes. Contract lines 2-4 still pass, with line 3 at exactly
9. None of the five fixes needed changing.

Two non-blocking notes:
- The subhead line-height band (1.2 to 1.3) goes beyond the memo. The built CSS already uses it.
- Inside raised panels, active and hover links now share `--paper`.

**Council: KEEP.** All five voices judged the delta correct and non-contradictory. They also
agreed on what matters next: the lock is now stricter than the built homepage on the CSS branch.
That branch has six multi-word heading `<em>`s, where the lock allows one word per page, plus
sentence-length uppercase mono and paragraph spacing below 1.5×. Reconcile it before checkpoint 2.

The open question for Boubacar comes from the Contrarian. Should paragraph spacing stay at the
AAA reading (1.5× line-height), or relax to AA (survive the SC 1.4.12 overrides only)?

The Expansionist proposes a follow-up contract amendment: make these rules machine-checkable
(`font-style: italic` outside the display step, no more than one `<em>` per page, body
line-height 1.5 or higher).
