# Katt Editing design system

The full system (tokens, component previews, logo files) lives in the Claude app: https://claude.ai/artifact/5wvaVe7WqL9YqzFS8KQD9d. This file is the short version for the site. `styles.css` uses the same token names under `:root`; change a value there and in the app together.

## Direction

The page looks like the dark interface of an editing app. The work is the brightest thing on screen, and Cut Yellow marks the one thing to do next.

Not used: gradients, glass blur, drop shadows, emoji, stock photos, centred sections, invented numbers or testimonials.

## Colour

| Token | Value | Use |
|---|---|---|
| `--ink` | #0B0B0D | Page |
| `--ink-2` | #141417 | Panels: order form, recommended price box |
| `--ink-3` | #1C1C21 | Hover inside panels |
| `--line` | #26262C | Hairlines only |
| `--line-strong` | #66646C | Borders on anything clickable (3.4:1) |
| `--fg` | #F3F0E7 | Text (17:1) |
| `--mute` | #9C988D | Secondary text (6.8:1) |
| `--faint` | #85827A | Placeholders (5.1:1) |
| `--cut` | #FFC21A | Primary button, selected tab and answer, progress, focus, one headline word |
| `--cut-ink` | #1A1400 | Text on yellow |
| `--bad` / `--ok` | #FF7A66 / #5BD08A | Errors / sent |

One yellow button per screen height. Dark only.

## Type

Anton for headlines, prices and form questions, always uppercase. Inter for everything people read, 400 and 600. IBM Plex Mono for numbers only: timecodes, video tags, the step count.

Scale: hero clamp(48–88px), h2 clamp(36–56px), h3 clamp(34–48px) (form questions; small answer tiles 16–20px, every question sets its answers as short two-line headlines (letter in the corner), up to 85% of the question; rows on short phone tiles), prices 48, lead 20, title 20, body 16, small 14, meta 12 mono. Headings stay within about 3.5× body size.

Two text levels: `--fg` for everything people read, `--mute` for notes. Never mixed inside one sentence.

## Spacing and shape

- 4-based spacing, `--s-1` (4) to `--s-9` (96). Sections clamp(56px, 7vw, 88px) apart. 16px phone gutter.
- Every section spans the same width with its heading on top. No empty columns: FAQ answers all open, 4 across (2 tablet, 1 phone); order answers 2 across on desktop.
- Work cards: rows of equal height that fill the width (flex grows by aspect ratio `--ar`), so a 9:16 piece never sits alone beside empty space.
- Inner radius = outer minus padding: form panel 16, options 8, option keys and video tags 4. Cards 12. Buttons are pills.
- No shadows. Motion: 0.15s hovers, 0.28s form slides, all off with reduced motion.
- **One motion on load, nothing that asks for attention.** The reel's poster shows instantly and the video fades in over it (0.6s); headline, text and reel ease up 10px once, 0.1s apart. No loaders, word pops, flashing or big overlay buttons. Sound only on request: the corner button says "Play with sound" / "Mute", and clicking the reel does the same.
- **Bands, not lines:** Work and FAQ sit on `--ink-2`, the rest on `--ink`, so sections read as blocks without dividers.

## Copy

- Headings are one or two words: Work, Pricing, FAQ, Order.
- No description under a heading unless it adds a fact.
- Card titles name the piece in a few words. No paragraph under them.
- First person, short sentences, plain words.

## Page order

Header → first screen (headline, text and buttons left, reel right; stacked below 1000px; everything visible without scrolling) → Work (tabs: Motion, Clips, Ads & demos, Long-form; one at a time) → Pricing (tabs: Clips | Long-form, three boxes each; on phones the top tier stacks first, then Recommended, then the cheap one) → FAQ → Order → footer. Add a proof strip under the hero once a client agrees in writing.

## Components

Button (primary, secondary, quiet) · Tabs · FAQ grid · BeforeAfter (Long-form: one player, Before | After switch, same timestamp; empty slots in one short row) · WorkCard and empty slot · PriceBox and quote list · OrderQuestion (one question per screen, contact details last) · Wordmark. Previews and props are in the app.
