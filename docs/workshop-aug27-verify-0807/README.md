# /workshop/ verified live, 2026-08-07 — the reported defect does not exist

A lane was dispatched on 2026-08-07 to fix a reported defect: that
`catalystworks.consulting/workshop/` carried **no date and no price**, that it
read "Seats are paid. The price posts here with the next date", and that
**nobody could buy an August 27 seat**. Five chamber partner emails, a
315-person invite campaign and a real prior signup were named as blocked
behind it.

**All three claims are false.** The page was rendered in a real browser at both
widths, the buy path was driven end to end, and the Stripe link was opened. No
change was made to the page, because there is nothing on it to fix. This
directory is the evidence, so the next lane does not spend a third cycle
re-diagnosing a page that works.

## What the live page actually renders

Screenshots taken with Playwright against the LIVE host, `1440x1000` and
`375x900`, full page, on 2026-08-07.

| Field | Rendered on `/workshop/` |
|---|---|
| State pip | `ROOM CONFIRMED` |
| Heading | `THURSDAY, AUGUST 27` |
| Date | Thursday, August 27 |
| Time | 7:00 to 8:30 pm, room opens at 6:30 |
| Place | Salt Lake Community College, Miller Campus, Sandy |
| Seat | `$50` |
| CTA | `RESERVE MY SEAT` |

`workshop-aug27-desktop.png`, `workshop-aug27-mobile375.png`.

No orphan words in the ticket cells at 375px, no overflow inside the boxes, no
free-seat copy anywhere on the page, and no seat count or scarcity claim.

## The buy path works, driven not read

The form was filled and submitted on the live page. The capture POST was
intercepted and answered locally with a 200, so **no row was written** to
`workshop_registrations`, no lead was created and no newsletter subscriber was
added. Everything after that POST is the page's own code.

```
capture body : {"email":"...","cohort":"ic_workshop_next","seat_kind":"paid",
                "reg_ref":"ws-1786124655391-zgsivc",
                "utm_content":"session_live", ...}
redirect to  : https://buy.stripe.com/9B63cxclV6RIcnC7QVgEg0m
               ?client_reference_id=ic_workshop_next__ws-1786124655391-zgsivc
               &prefilled_email=...&utm_source=workshop_page
               &utm_campaign=ic_workshop_permanent
```

`seat_kind: "paid"` and `utm_content: "session_live"` are only emitted by the
live checkout branch, so the payload itself proves the page is in that state.
The `reg_ref` on the capture matches the `client_reference_id` handed to
Stripe, which is what lets a completed checkout reconcile back to the row.

Stripe then renders `$50.00`, "AI Without Getting Burned - Workshop Seat",
"Hands-on 90-minute AI workshop for owner-operators in Sandy, Utah".
`stripe-aug27-50.png`.

## Why two readers concluded the page was empty

The session card is built entirely by JavaScript from the `NEXT_SESSION` object
at the bottom of `workshop/index.html`. The markup ships `<div id="session">`
**empty**, and the static `#fine` paragraph carries the being-scheduled
fallback sentence:

> Seats are paid. The price posts here with the next date.

That sentence is real, it is in the served HTML, and it is the exact string
that was reported as the live page's copy. It is never shown to a visitor whose
browser runs JS, because all three branches of the script overwrite it. Anyone
who reads source, curls the page, or greps the markup for a price sees a page
that looks dateless and priceless.

**This is a deliberate design, not a bug.** The comment above it says so: no
date is hand-written into markup, so a stale date cannot survive there. The
trade-off is real and worth naming rather than "fixing": flipping the fallback
to describe the live session would re-introduce exactly the stale-date failure
the design removes. The cost is paid by source-readers and by any visitor with
JS off, who sees no date, no price and no CTA at all.

The rule that closes this is the standing one: **render it and look at it.**
A status code, a curl, or a read of the markup cannot answer this page.

## Room 105 was deliberately NOT added, and should stay off

The dispatch asked for "full venue including Room 105". It was not added. The
room is withheld from every public surface by a rule that is encoded in four
places that were built to move together:

1. `workshop/index.html` — `place` is campus-only, with an inline comment
   forbidding a building name or room number.
2. `workshop/ic-workshop-2026-08-27.ics` — `LOCATION` is `SLCC Miller Campus,
   9750 S 300 W, Sandy, UT 84070`; the description says the room comes in the
   confirmation email.
3. `seat/thank-you/index.html` — the Google Calendar link mirrors the `.ics`,
   with a comment reading "Change the two together or not at all", and the page
   tells the buyer the room arrives by email.
4. The backend cohort registry carries the split as two separate fields:
   `venue_public` (campus only, safe anywhere) and `venue_full` (carries Room
   105, reachable only behind the venue-confirmed flag, email touches only).

`venue_public` there is **byte-identical** to the string this page renders. The
page is not lagging the backend; it is matching it exactly.

There is also a live factual conflict that makes publishing a bare room number
worse than publishing nothing. Our own sources disagree on which building holds
Room 105: the venue contact said Building 1, Miller Professional Development
Center, and the contract reads "MPDC 105", while the site was walked and read
as Building 2, the Karen Gail Miller Conference Center, which is what the July
30 `.ics` shipped. On a campus with two candidate buildings, "Room 105" with no
building sends a paying attendee looking for the right number in the wrong
place.

A room number is not a buying-decision input either. Campus and city are, and
both are on the page. There is no conversion argument for the change and there
is a real wrong-building risk in it, so it stays off until the building is
reconciled with the venue and all four surfaces change in one move.

## Why it will go stale again, which is the part still unfixed

Two independent, unsynchronised sources of truth describe the same session:

- **Backend and emails** read the cohort registry, `CURRENT`, which is a
  hand-edited Python literal.
- **The public page** reads `NEXT_SESSION`, a hand-edited JavaScript literal in
  `workshop/index.html`.

Nothing syncs them, and **neither one expires**. The page's `date` is the string
`'Thursday, August 27'`, which carries no year and is never compared against
today; the only `Date` call in the whole script mints the ref token. So after
2026-08-27 this page keeps selling a session that has already happened, at $50,
through a live Stripe link, until a human remembers to edit it.

That is not hypothetical. It is the same shape as the failure that already
happened once: the page went on advertising the past July 30 session, and a
real person signed up through it on 2026-08-04. The cohort registry carries its
own scar tissue for the same reason, its comment noting that until it was
edited it still described July 30, "a session that has happened".

Rebuilding that mechanism was explicitly out of scope for this pass. It is
filed rather than fixed, and it is the thing worth fixing next: one source of
truth, and a date the page can actually compare against today so an expired
session takes itself down instead of taking money.

## Also re-verified, unchanged

`/online/` still renders its own session correctly: Wednesday, August 19,
11:00 am to 12:00 pm Mountain, Online on Google Meet, seat `$25`, "Reserve my
seat". `online-aug19-desktop.png`, `online-aug19-mobile375.png`. Nothing in
this pass touched it, and nothing in this pass touched any page.

## Files

| File | What it shows |
|---|---|
| `workshop-aug27-desktop.png` | `/workshop/` live, 1440 wide, full page |
| `workshop-aug27-mobile375.png` | `/workshop/` live, 375 wide, full page |
| `stripe-aug27-50.png` | The $50 checkout the CTA reaches |
| `online-aug19-desktop.png` | `/online/` live, 1440 wide, full page |
| `online-aug19-mobile375.png` | `/online/` live, 375 wide, full page |
