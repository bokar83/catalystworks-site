#!/usr/bin/env node
/* ===========================================================================
   build-present-house.js  --  generates kit/deck-present.html from kit/deck.html

   The house-style deck renders its sheets from a data array at runtime, so the
   old build-present.js (which parses <section class="s"> out of the bone deck)
   cannot read it and aborts. It is kept for the bone deck, which stays as the
   projector fallback.

   This generator does almost nothing on purpose. The presenter behaviour lives
   INSIDE deck.html behind data-present, so the presenting copy is the same
   document with one attribute flipped. There is no second implementation to
   keep in sync, which is the failure mode a hand-maintained second copy has.

   Presenter keys, all implemented in deck.html:
     T  elapsed clock. The chip auto-hides after 2.2s idle and the clock keeps
        running behind the fade. A running timer must NEVER pin the chip open:
        whatever sits in the corner is burned onto the wall the room is looking
        at. A mouse nudge summons it back.
     R  reset the clock.   B / W  blank black / white.   Any key restores.

   IN:   kit/deck.html
   OUT:  kit/deck-present.html   (self-contained, opens from file://)
   ======================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const SRC = path.join(DIR, 'deck.html');
const OUT = path.join(DIR, 'deck-present.html');

const src = fs.readFileSync(SRC, 'utf8');

/* Refuse to ship a deck that needs the venue wifi. */
const external = src.match(/(?:src|href)\s*=\s*["']https?:\/\/[^"']+/g) || [];
if (external.length) {
  console.error('ABORT: deck.html has runtime-external references, offline is not safe:');
  external.forEach(u => console.error('  ' + u));
  process.exit(1);
}
if (!/data-present/.test(src)) {
  console.error('ABORT: deck.html carries no presenter layer (no data-present hook).');
  process.exit(1);
}
if (!/if \(hold === true\) return;/.test(src)) {
  console.error('ABORT: the idle rule is missing or altered. A running timer must not pin the chip.');
  process.exit(1);
}
const sheets = (src.match(/\{t:'/g) || []).length;
if (sheets < 30) {
  console.error(`ABORT: expected the full sheet set, found ${sheets}.`);
  process.exit(1);
}

let out = src.replace('<html lang="en">', '<html lang="en" data-present="1">');
out = out.replace(/<title>[^<]*<\/title>/,
                  '<title>AI Without Getting Burned - PRESENTER - 2026-07-30</title>');
if (out === src) {
  console.error('ABORT: nothing was substituted, the <html> tag did not match.');
  process.exit(1);
}

fs.writeFileSync(OUT, out);
console.log('deck-present.html written');
console.log('  sheets           ' + sheets + ' (identical markup to deck.html)');
console.log('  external refs    0');
console.log('  idle rule        if (hold === true) return;   verified present');
