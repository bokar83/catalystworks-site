# Design Audit — IC Workshop / AI Checklist Conversion Page

**Date:** 2026-06-19
**Path:** ai-checklist/index.html (catalystworks-site, feat/ic-leadmagnet-optin)
**Type:** HTML landing page (dual-path conversion: Stripe seat + Beehiiv email capture)

## Score: 17/20 — Good (ship with P1 fixes)

| Dimension | Score | One-line summary |
|---|---|---|
| Accessibility | 3/4 | Native form semantics, labels, focus rings, aria-busy/live; one faint-text contrast risk |
| Performance | 4/4 | transform/opacity only, downscaled cover (256KB), fonts async print-swap, single small inline JS |
| Theming | 4/4 | Full CW token system (navy/clay/action + Spectral/Public Sans/JetBrains Mono), config-driven |
| Responsive | 3/4 | Mobile-first verified at 390px; book sized per-breakpoint; wide-screen measure to confirm |
| Anti-Patterns | 3/4 | No card grid, no gradient text, no side-stripes, real logo, organic geometry |

## Issues

### P0 (blockers)
none

### P1 (high)
- **[Accessibility] faint text contrast** — hero `.cta-note` `rgba(244,238,228,.66)` on navy and `--ink-faint #6B7E8C` on paper approach WCAG AA 4.5:1 for small text. Bump to `rgba(244,238,228,.78)` and `#5A6B78`. Verify before deploy. WCAG 1.4.3.

### P2 (medium)
- **[Responsive]** confirm section-02 right `.lede` ≤66ch on 1440px+ (already close).

### P3 (low)
- **[Performance]** optional WebP cover (~120KB) if LCP needs shaving.

## Anti-Pattern Tells
None of: side-stripes, gradient text, glassmorphism, hero-metric template, identical card grid, modal CTA, em-dashes (0), bounce-default, reflex fonts, generic stock hero, newsletter-only CTA. Real CW logo used. Organic geometry throughout (torn seams, ink ribbons, rough-edge stamps).

## Category-Reflex Check
- Category: AI consulting / workshop.
- Palette: navy + clay + action-teal on warm paper, film-grain, ink/torn-paper geometry, Spectral serif.
- Guessable from palette? NO. Reads as a field-guide/publishing brand, not the reflex navy+cyan+orange SaaS look.

## Recommendation
Ship after P1 contrast bumps. Strong anti-pattern posture. Mobile-first premium for QR scan verified. Do NOT deploy until Boubacar approves.
