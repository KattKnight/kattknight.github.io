# Katt Editing design system

The full system (tokens, component previews, logo files) lives in the Claude app: https://claude.ai/artifact/5wvaVe7WqL9YqzFS8KQD9d. This file is the short version for the site. `styles.css` uses the same token names under `:root`; change a value there and in the app together.

## Direction

The page looks like the dark interface of an editing app in a darkroom: warm brown-black instead of flat black, cream text. The work is the brightest thing on screen, and Cut Yellow marks the one thing to do next.

Not used: gradients, glass blur, drop shadows, emoji, stock photos, centred sections, invented numbers or testimonials.

## Colour

| Token | Value | Use |
|---|---|---|
| `--ink` | #15110D | Page ("Darkroom" brown-black) |
| `--ink-2` | #1F1914 | Panels: bands, order form, recommended price box |
| `--ink-3` | #2A221B | Hover inside panels |
| `--line` | #342A21 | Hairlines only |
| `--line-strong` | #7A6A58 | Borders on anything clickable (3.6:1) |
| `--fg` | #F4EBDD | Text (15.9:1) |
| `--mute` | #B2A28C | Secondary text (7.5:1) |
| `--faint` | #8F8270 | Placeholders (5.0:1) |
| `--cut` | #FFC21A | Primary button, selected tab and answer, progress, focus, one headline word |
| `--cut-ink` | #1A1400 | Text on yellow |
| `--bad` / `--ok` | #FF7A66 / #5BD08A | Errors / sent |

Timeline colours ("Earth"): each type of work has its own clip colour, like labels on an editing timeline. `--c-motion` #E3956C terracotta, `--c-clips` #ACB977 olive, `--c-ads` #86B0D5 faded denim, `--c-longform` #FFC21A Cut Yellow. Tag an element with `data-cat="motion|clips|ads|longform"` and it gets `--cat`. They appear only on the work and price tabs (dot and underline), a card's kind label, its video tag stripe and the line under its thumbnail. Never on buttons, headings or sentences.

One yellow button per screen height. Dark only.

## Type

Bungee for big text: headlines, prices, form questions and the wordmark (it only has capitals). Recursive for everything people read, 400 to 700, fixed at a slightly casual style. Katt Pixel (the Minecraft-style pixel font by Craftron Gaming) for the hero sentence, fine print and numbers: notes, hints, per-clip maths, the footer, timecodes, video tags, the step count. The pixel font is only sharp at 16px steps (16, 32, 48), has one weight, and has no middle dot or curly quotes, which fall back to Recursive. Errors stay in Recursive so they read easily. Words joined by a hyphen or a number and its unit (long-form, 48 hours) never split across lines: wrap them in .nw.

Scale: hero clamp(40–66px), h2 clamp(34–50px), h3 clamp(28–38px) (form questions; small answer tiles 16–20px, every question sets its answers as short two-line headlines (letter in the corner), up to 85% of the question; rows on short phone tiles), prices 48, lead 16 pixel, title 20, body 16, small 14 (errors), fine print 16 pixel, meta 16 pixel. Headings stay within about 3.5× body size.

Two text levels: `--fg` for everything people read, `--mute` for notes. Never mixed inside one sentence.

## Spacing and shape

- 4-based spacing, `--s-1` (4) to `--s-9` (96). Sections clamp(56px, 7vw, 88px) apart. 16px phone gutter.
- Every section spans the same width with its heading on top. No empty columns: FAQ answers all open, 4 across (2 tablet, 1 phone); order answers 2 across on desktop.
- Work cards: rows of equal height that fill the width (flex grows by aspect ratio `--ar`), so a 9:16 piece never sits alone beside empty space.
- Inner radius = outer minus padding: form panel 16, options 8, option keys and video tags 4. Cards 12. Buttons are pills.
- No shadows. Motion: 0.15s hovers, 0.28s form slides, all off with reduced motion.
- **One motion on load, nothing that asks for attention.** The reel's poster shows instantly and the video fades in over it (0.6s); headline, text and reel ease up 10px once, 0.1s apart. No loaders, word pops, flashing or big overlay buttons. The one ambient piece is the hero waveform: an audio waveform behind the hero whose playhead is the cursor (bars near it brighten a little, the played part is a shade lighter; neutral grey, never yellow, so it never competes with the headline word or buttons) and which follows the reel's progress when the cursor is elsewhere. Desktop with a mouse only, faded at every edge, paused off screen, a still frame with reduced motion. Sound only on request: the corner button says "Play with sound" / "Mute", and clicking the reel does the same.
- **Bands, not lines:** Work and FAQ sit on `--ink-2`, the rest on `--ink`, so sections read as blocks without dividers.

## Copy

- Headings are one or two words: Work, Packages, FAQ, Order.
- No description under a heading unless it adds a fact.
- Card titles name the piece in a few words. No paragraph under them.
- First person, short sentences, plain words.

## Page order

Header → first screen (headline, text and buttons left, reel right; stacked below 1000px; everything visible without scrolling) → Work (tabs: Motion, Short-form, Ads & demos, Long-form; one at a time) → Packages (tabs: Short-form | Long-form, three boxes each, both panels one height so switching never moves the page; on phones the top tier stacks first, then Recommended, then the cheap one) → FAQ → Order → footer. Add a proof strip under the hero once a client agrees in writing.

## Components

Button (primary, secondary, quiet) · Tabs · FAQ grid · BeforeAfter (Long-form: one player, Before | After switch, same timestamp; empty slots in one short row) · WorkCard and empty slot · PriceBox and quote list · OrderQuestion (one question per screen, contact details last) · Wordmark. Previews and props are in the app.

## Phones (below 760px)

Shorter page, same content: work cards and package boxes sit in swipeable rows (Recommended first, the next box peeking in), FAQ answers open on tap, the hero note and the three-step list are dropped (the bottom bar and the form say the same), and the order form comes before the other ways to get in touch. Every sideways row shows a see-through arrow in the pixel font (32px) on each side that still has more to see; tapping it scrolls to that end. Answer tiles on touch screens show their letter small in the top-right corner (on desktop it sits top-left and works as a keyboard shortcut).

## Tabs

Work and Packages tabs keep one height: every panel of a set sits in the same grid cell (`.panel-stack`), the hidden ones invisible and inert, so switching never moves the page. Switching morphs the cards: each frame stays in place and reshapes into the matching card of the new tab (extras grow out of, or shrink into, the last frame), while only the pictures and text inside slide: out on the side away from the new tab, in from the other side (0.15s out, 0.26s in, frames 0.34s). Previews in hidden tabs are paused. Reduced motion switches instantly.
