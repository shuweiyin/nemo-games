# Nemo's Games — Design Spec

**Date:** 2026-03-30

---

## Overview

A single-page static website titled "Nemo's Games" that presents a curated library of 10 games. The visual design follows the "Neon Nocturne" design system — deep void backgrounds, purple/cyan accents, Space Grotesk headlines, no borders (tonal separation only). Clicking a game card opens a fullscreen modal with the game embedded as an iframe.

---

## Pages & Structure

### `index.html` — Single file, no build toolchain

The entire site is one HTML file. No framework, no bundler. Dependencies loaded from CDN:
- Tailwind CSS (CDN, with inline config)
- Google Fonts: Space Grotesk + Manrope

### Layout

```
<nav>          — "NEMO'S GAMES" logo left, game count right
<main>         — page header + 4-column game grid (10 cards)
<modal-overlay> — fixed overlay, hidden by default
```

---

## Game Data

Games are defined as a JavaScript array at the top of the `<script>` block:

```js
const GAMES = [
  {
    id: 1,
    title: "Game Title",
    thumbnail: "images/game1.png",   // or a URL
    iframe: "https://..."
  },
  // ... 9 more
]
```

This makes it trivial to add/edit games without touching layout code. The first game's iframe is:
`https://claude.site/public/artifacts/80f69371-7e8b-4992-beed-46fcbcb8c76e/embed`

The other 9 games are placeholders to be filled in by the user.

---

## Components

### Game Card
- 16/9 aspect ratio thumbnail image (covers the card)
- On hover: card scales 1.02x + ambient purple glow + "▶ PLAY" gradient button overlay fades in
- Below image: game title (Space Grotesk bold) + "BY NEMO" label
- Clicking anywhere on the card (or the PLAY button) opens the modal

### Game Modal
- Triggered by card click
- Backdrop: `rgba(0,0,0,0.85)` + `backdrop-filter: blur(12px)`
- Modal box: `#19191d` background, `border-radius: 1.25rem`, max-width 1100px, purple ambient box-shadow
- Header bar (`#131316`): game title on left, "✕ CLOSE" button on right
- Body: `<iframe>` filling the full width at 600px height, `frameborder="0"`, `allowfullscreen`, `allow="clipboard-write"`
- Close triggers: ✕ button, click outside modal box, Escape key
- On close: iframe `src` is cleared (prevents audio/game continuing in background)

---

## Design Tokens (from Neon Nocturne)

| Token | Value |
|---|---|
| surface | #0e0e11 |
| surface-container-low | #131316 |
| surface-container | #19191d |
| surface-container-high | #1f1f23 |
| surface-container-highest | #25252a |
| on-surface | #f0edf1 |
| on-surface-variant | #acaaae |
| primary | #d095ff |
| primary-container | #c782ff |
| on-primary-container | #38005e |
| secondary | #00e3fd |
| outline-variant | #48474b |

### Rules
- No 1px borders — use tonal background shifts to separate sections
- No pure white text — use `on-surface` (#f0edf1)
- Rounded corners everywhere (min `0.5rem`)
- Buttons use `primary → primary-container` gradient at 135°
- Hover glow: `box-shadow: 0 0 40px rgba(208,149,255,0.15)`

---

## Interactions

| Trigger | Behavior |
|---|---|
| Hover card | Scale 1.02x, show PLAY overlay, ambient glow |
| Click card / PLAY | Open modal with that game's iframe |
| Click backdrop | Close modal, clear iframe src |
| Click ✕ | Close modal, clear iframe src |
| Press Escape | Close modal, clear iframe src |

---

## File Structure

```
/
├── index.html        — entire site (single file)
└── images/           — game thumbnails (user-provided)
    ├── game1.png
    ├── game2.png
    └── ...
```

---

## Out of Scope

- Backend, database, user accounts
- Search or filtering
- Mobile-specific layout (desktop-first, readable on tablet)
- Analytics or tracking
