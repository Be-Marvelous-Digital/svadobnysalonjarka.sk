# UX audit — svadobnysalonjarka.sk

Method: static review of `frontend/src` plus live measurement in Chromium against the dev
server (stub API) at 320 / 375 / 768 / 900 / 1024 / 1280 px. Contrast ratios computed from
composited colours, WCAG 2.1 AA thresholds.

---

## P0 — blocking

### 1. Horizontal clipping below 360 px

`html.scrollWidth` exceeds the viewport on four routes at 320 px:

| Route | scrollWidth | overflowing block |
| --- | --- | --- |
| `/` | 340 px | `.story__grid` — `minmax(320px, 1fr)` |
| `/o-salone` | 360 px | `.about__top` — `minmax(340px, 1fr)` |
| `/kontakt` | 350 px | `.contact__grid` — `minmax(330px, 1fr)` |
| `/rezervacia` | 325 px | `.step__columns` — `minmax(280px, 1fr)` inside a padded card |

`body { overflow-x: hidden }` in [global.less](frontend/src/styles/global.less#L16) suppresses the
scrollbar, so the failure is silent: the right edge of the text is cut off instead of scrollable.
Every `repeat(auto-fit, minmax(Npx, 1fr))` where `N` approaches the viewport width has this bug.

Fix: `minmax(min(320px, 100%), 1fr)`. `min()` collapses the track to the container when there is
no room, which is what `auto-fit` cannot do on its own.

### 2. iOS Safari zooms on every form field

`.input` is `font-size: @font-size-base` = 15 px, `.input--compact` = 14 px
([Field.module.less](frontend/src/components/Field/Field.module.less#L26)). Safari on iOS
force-zooms the viewport whenever a focused input is under 16 px, and it does not zoom back out.
The reservation flow is the site's only conversion path, so every booking on an iPhone starts
with a broken viewport.

Fix: 16 px minimum on inputs (a `@media (max-width: 900px)` bump is enough if 15 px is wanted on
desktop).

### 3. Brand gold fails contrast as text — 3.39:1

`@color-primary` `#a9834f` on the cream background measures **3.39:1** (AA needs 4.5:1 for text
under 24 px). It is not a decorative accent here — it is the colour of:

- every section kicker (`.kicker()`, 11 px)
- every form field label and hint ([Field.module.less](frontend/src/components/Field/Field.module.less#L8))
- **every error message** (`.step__error`, `.field__error`) — the text a user most needs to read
- the default `a` colour in [global.less](frontend/src/styles/global.less#L23)

On `@color-surface-muted` it drops to **3.12:1**.

White on the gold button fill is the same **3.39:1** — that is the primary CTA, including the
sticky mobile bar.

Fix: `@color-primary-dark` `#8f6c3d` measures 4.68:1 on cream and 4.68:1 behind white text. Split
the token: `#a9834f` stays for rules, borders and fills behind dark text; `#8f6c3d` becomes the
text/CTA colour.

### 4. Reveal animation gates all content on JavaScript

`.reveal` starts at `opacity: 0` and only clears when IntersectionObserver fires
([RevealSection.module.less](frontend/src/components/RevealSection/RevealSection.module.less#L2)).
If the bundle fails, is blocked, or the observer never fires, every section below the hero stays
permanently invisible. A full-page render confirms it: hero, then 6 000 px of blank cream, then
the footer.

Fix: reveal is a progressive enhancement — set the initial `opacity: 0` from JS (a `js-reveal`
class on `<html>`), or add a `<noscript>` override. Same applies to `.reveal-up()`, which uses
`animation … both` and holds the element at `opacity: 0` if the animation never runs.

---

## P1 — significant

### 5. Touch targets under 44 px

Measured at 375 px:

| Element | Size |
| --- | --- |
| Footer nav links (14 all) | 335 × **21** |
| Footer Instagram / Facebook | 75 × **16** |
| `.collections__more` "Chcem skúšku →" | 133 × **25** |
| Header brand link | 147 × **35** |
| Lightbox "Zavrieť ✕" | ~70 × **14** |
| `Chip--time` (slot picker) | ~62 × **39** |
| `Button--sm` | ~130 × **40** |
| Contact phone / e-mail links | 335 × **21** |

The slot chips are the worst of these in practice: a 39 px target, in a wrap grid with 8 px gaps,
is where mis-taps cost a booking. Footer links at 21 px with 14 px gaps are a close second.

Fix: `min-height: 44px` on `Chip`, `Button--sm`, and footer/inline links (padding, or a
`::after` hit-area expander where padding would break the layout).

### 6. Hero lead is unreadable over the image

The kicker and `<h1>` carry `text-shadow`; `.hero__lead` does not
([HeroSection.module.less](frontend/src/components/home/HeroSection/HeroSection.module.less#L77)).
At 375 px the lead lands directly on the brightest part of the chandelier at
`rgba(253,252,250,0.82)`. The scrim is only 0.28 alpha at that height.

Fix: add the same `text-shadow`, and deepen the mid-stop of `.hero__scrim` under
`@breakpoint-tablet`.

### 7. Mobile bar ignores the iOS home indicator

`.bar` is `position: fixed; bottom: 0` with no `env(safe-area-inset-bottom)`
([MobileBar.module.less](frontend/src/components/MobileBar/MobileBar.module.less#L2)). On any
notched iPhone the home indicator sits on top of both buttons, and `.spacer` is short by the same
amount so the footer is clipped too.

```less
padding-bottom: env(safe-area-inset-bottom);
// and .spacer: height: calc(@mobile-bar-height + env(safe-area-inset-bottom));
```

### 8. Drawer and lightbox are not dialogs

[MobileDrawer](frontend/src/components/MobileDrawer/index.tsx) locks body scroll and nothing else:
no `role="dialog"`, no `aria-modal`, no Escape handler, no focus trap, no focus restore to the
burger on close. Tab order runs straight through the drawer into the page underneath.

[Lightbox](frontend/src/components/Lightbox/index.tsx) has Escape and arrow keys but is
`role="presentation"`, does not trap focus, and does not restore focus to the thumbnail that
opened it.

The burger itself is missing `aria-expanded` / `aria-controls`, and the header dropdown toggle is
missing `aria-haspopup` and an Escape handler.

### 9. Reservation flow is not a form

[ReservationPage](frontend/src/pages/ReservationPage/index.tsx) composes `<div>`s with
`type="button"` buttons. Consequences: Enter does not advance a step, browsers get no submit
signal for autofill, and there is no native validation fallback.

Also missing in that flow:

- **no `aria-live`** on `.step__error` or on the "no free slots" message — a screen reader user
  gets no announcement when a submit fails
- **no focus move** on step change or on `ReservationDone`; after tapping "Pokračovať" on mobile,
  the viewport stays where it was and the new step renders off-screen
- **`StepIndicator` hides its labels below 640 px** and offers no `aria-current` or accessible
  name — three unlabelled dots
- **disabled-button dead end**: "Pokračovať" is disabled until valid with no field-level message
  saying which input is missing

### 10. `Field` folds hint and error into the accessible name

`Field` wraps everything in one `<label>`
([Field/index.tsx](frontend/src/components/Field/index.tsx#L11)), so the hint and error text
become part of the input's accessible name: *"Preferovaný dátum Vyberte dátum, ukážeme vám voľné
časy."* Hint and error belong on `aria-describedby`, and the error needs `aria-invalid`.

### 11. No skip link

`<main>` has no `id` and there is no skip-to-content link, so keyboard users tab through the full
header and dropdown on every page.

---

## P2 — polish

- **8 px type.** `.header__brandNote` is `@font-size-micro - 2px` = 8 px, uppercase, 0.3em tracked.
  The `.story__statLabel` is 10.5 px. Both are below any legible floor on a phone.
- **`.story__stats` stays 3-up at 320 px.** Every label wraps to two lines in a ~88 px column.
  Go 1-up under 480 px.
- **Orphan card.** Five bookable collections in a 2-column mobile grid leaves "Obuv a kabelky"
  alone in row 3. Either span it full-width or make the last row a 1-up feature.
- **Content mismatch.** The "Prijímacie šaty" card renders `/assets/prijimacie-1.webp`, which is a
  bridal gown, not a communion dress. Same asset is reused in the About tiles.
- **`PhotoMosaic` small tiles have no aspect ratio on mobile.** Below 900 px `.group__small`
  becomes `grid-template-rows: auto auto` while `Tile` is rendered with `withRatio={false}`, so
  `.tile__image { height: 100% }` resolves against an indefinite height and the 2×2 block goes
  ragged. Apply `--ratio` at the tablet breakpoint too.
- **`.prices__table` stays 2-column at 320 px.** A 27 px serif name in a ~200 px column wraps to
  three lines against a right-aligned price. Stack under 480 px.
- **No adjacent-image preload in the lightbox.** Each swipe on a phone waits on a cold fetch.
- **Vertical swipes trigger lightbox navigation.** `onTouchEnd` only checks `deltaX`; add a
  `deltaY` guard so scroll gestures do not page the gallery.
- **`useMediaQuery` calls `window.matchMedia` in the initialiser** — fine for this SPA, will throw
  the moment anything renders server-side.
- **Hover-only dropdown.** `.header__dropdown` opens on `mouseenter`. It is hidden below 900 px so
  no touch device reaches it today, but the pattern breaks on any touch laptop between 900 and
  1200 px.
- **`prefers-reduced-motion` is handled globally** (`0.01ms` override) — good. The hero
  `jZoom` and the 12 s `jGradient` loop are both correctly covered by it.

---

## What already holds up

- No horizontal overflow anywhere at 375 px and above; 768 px is clean on all six routes.
- `100svh` on the hero, so no iOS URL-bar jump.
- `loading="lazy"` on every non-hero image, WebP throughout, hero preloaded via CSS.
- `prefers-reduced-motion` respected globally.
- Real SVG icon set, no emoji.
- Focus ring defined once via `:focus-visible` with an offset.
- Design tokens are genuinely centralised — the fixes above are mostly token edits, not sweeps.
- Slot availability is server-derived, never computed client-side.
- Slovak diacritics and date formatting are correct throughout.
