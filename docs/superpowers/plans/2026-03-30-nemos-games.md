# Nemo's Games Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-file static website `index.html` that shows 10 game cards in a Neon Nocturne dark UI; clicking a card opens a modal with the game embedded as an iframe.

**Architecture:** One `index.html` file with inlined Tailwind config, CSS, and JS. Game data lives in a `const GAMES` array at the top of the script block — adding a new game means adding one object to that array. No build step, no framework.

**Tech Stack:** HTML5, Tailwind CSS (CDN), Google Fonts (Space Grotesk + Manrope), vanilla JS

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `index.html` | Create | Entire site: nav, grid, modal, styles, scripts |
| `images/` | Create dir | Placeholder directory for game thumbnails |

---

### Task 1: Project scaffold + design tokens

**Files:**
- Create: `index.html`
- Create: `images/.gitkeep`

- [ ] **Step 1: Create the images directory placeholder**

```bash
mkdir -p "/Users/shuweiyin/Documents/work/nemo game/images"
touch "/Users/shuweiyin/Documents/work/nemo game/images/.gitkeep"
```

- [ ] **Step 2: Create `index.html` with full Tailwind config and CSS**

Create `/Users/shuweiyin/Documents/work/nemo game/index.html` with this content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Nemo's Games</title>
  <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;900&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet"/>
  <script id="tailwind-config">
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            'primary':                  '#d095ff',
            'primary-container':        '#c782ff',
            'on-primary-container':     '#38005e',
            'secondary':                '#00e3fd',
            'surface':                  '#0e0e11',
            'surface-container-low':    '#131316',
            'surface-container':        '#19191d',
            'surface-container-high':   '#1f1f23',
            'surface-container-highest':'#25252a',
            'surface-container-lowest': '#000000',
            'on-surface':               '#f0edf1',
            'on-surface-variant':       '#acaaae',
            'outline-variant':          '#48474b',
          },
          fontFamily: {
            headline: ['Space Grotesk', 'sans-serif'],
            body:     ['Manrope', 'sans-serif'],
            label:    ['Manrope', 'sans-serif'],
          },
          borderRadius: {
            DEFAULT: '0.25rem',
            lg:   '0.5rem',
            xl:   '0.75rem',
            '2xl':'1rem',
            '3xl':'1.25rem',
            full: '9999px',
          },
        },
      },
    }
  </script>
  <style>
    /* Primary gradient button */
    .primary-gradient {
      background: linear-gradient(135deg, #d095ff 0%, #c782ff 100%);
    }
    /* Ambient glow on card hover */
    .ambient-glow:hover {
      box-shadow: 0 0 40px rgba(208, 149, 255, 0.15);
    }
    /* Custom scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #0e0e11; }
    ::-webkit-scrollbar-thumb { background: #25252a; border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: #48474b; }
    /* Modal */
    #modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex; align-items: center; justify-content: center;
      z-index: 50;
      opacity: 0; pointer-events: none;
      transition: opacity 0.25s ease;
    }
    #modal-overlay.open {
      opacity: 1; pointer-events: all;
    }
    #modal-box {
      background: #19191d;
      border-radius: 1.25rem;
      width: 90vw; max-width: 1100px;
      overflow: hidden;
      box-shadow: 0 0 80px rgba(208, 149, 255, 0.12);
      transform: scale(0.95);
      transition: transform 0.25s ease;
    }
    #modal-overlay.open #modal-box {
      transform: scale(1);
    }
    #modal-iframe {
      width: 100%; height: 600px;
      border: none; display: block;
      background: #0e0e11;
    }
  </style>
</head>
<body class="bg-surface text-on-surface font-body min-h-screen">

  <!-- NAV -->
  <!-- GRID -->
  <!-- MODAL -->
  <!-- SCRIPT -->

</body>
</html>
```

- [ ] **Step 3: Verify the file opens in a browser without console errors**

Open `index.html` in a browser (or use Live Server). Expected: black page, no JS errors in console.

- [ ] **Step 4: Commit**

```bash
cd "/Users/shuweiyin/Documents/work/nemo game"
git init
git add index.html images/.gitkeep
git commit -m "feat: scaffold index.html with Neon Nocturne design tokens"
```

---

### Task 2: Navigation bar

**Files:**
- Modify: `index.html` — replace `<!-- NAV -->` comment

- [ ] **Step 1: Replace the `<!-- NAV -->` comment with**

```html
  <!-- NAV -->
  <nav class="bg-surface-container-low px-10 py-5 flex items-center justify-between">
    <span class="font-headline font-black text-2xl tracking-tight text-primary">
      NEMO'S GAMES
    </span>
    <span id="nav-count"
          class="font-label uppercase tracking-widest text-xs text-on-surface-variant">
      10 GAMES
    </span>
  </nav>
```

- [ ] **Step 2: Verify in browser**

Expected: dark nav bar, "NEMO'S GAMES" in purple on the left, "10 GAMES" in muted text on the right.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add navigation bar"
```

---

### Task 3: Game data array

**Files:**
- Modify: `index.html` — replace `<!-- SCRIPT -->` comment with the script block (game data only for now)

- [ ] **Step 1: Replace `<!-- SCRIPT -->` with**

```html
  <!-- SCRIPT -->
  <script>
    const GAMES = [
      {
        id: 1,
        title: 'Game 1',
        thumbnail: '',
        iframeSrc: 'https://claude.site/public/artifacts/80f69371-7e8b-4992-beed-46fcbcb8c76e/embed',
      },
      { id: 2,  title: 'Game 2',  thumbnail: '', iframeSrc: '' },
      { id: 3,  title: 'Game 3',  thumbnail: '', iframeSrc: '' },
      { id: 4,  title: 'Game 4',  thumbnail: '', iframeSrc: '' },
      { id: 5,  title: 'Game 5',  thumbnail: '', iframeSrc: '' },
      { id: 6,  title: 'Game 6',  thumbnail: '', iframeSrc: '' },
      { id: 7,  title: 'Game 7',  thumbnail: '', iframeSrc: '' },
      { id: 8,  title: 'Game 8',  thumbnail: '', iframeSrc: '' },
      { id: 9,  title: 'Game 9',  thumbnail: '', iframeSrc: '' },
      { id: 10, title: 'Game 10', thumbnail: '', iframeSrc: '' },
    ];
  </script>
```

- [ ] **Step 2: Verify in browser console**

Open browser console and type `GAMES`. Expected: array of 10 objects.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add GAMES data array with placeholder entries"
```

---

### Task 4: Game grid (cards rendered from data)

**Files:**
- Modify: `index.html` — replace `<!-- GRID -->` comment; extend `<script>` to render cards

- [ ] **Step 1: Replace `<!-- GRID -->` with**

```html
  <!-- GRID -->
  <main class="max-w-[1400px] mx-auto px-10 pt-14 pb-16">
    <div class="mb-12">
      <h1 class="font-headline text-5xl font-black tracking-tighter mb-2 text-on-surface">
        ALL GAMES
      </h1>
      <p class="text-sm text-on-surface-variant">Click any game to start playing</p>
    </div>
    <div id="game-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      <!-- Cards injected by JS -->
    </div>
  </main>
```

- [ ] **Step 2: Add card rendering inside the `<script>` block, after the GAMES array**

Append the following inside the existing `<script>` tag, after the `GAMES` array definition:

```js
    function buildCard(game) {
      const thumbnailHtml = game.thumbnail
        ? `<img src="${game.thumbnail}" alt="${game.title}"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>`
        : `<div class="w-full h-full flex items-center justify-center"
                style="background:linear-gradient(135deg,#1a0a2e,#0d1b2a);">
             <span class="text-4xl">🎮</span>
           </div>`;

      const card = document.createElement('div');
      card.className = 'group flex flex-col cursor-pointer';
      card.innerHTML = `
        <div class="aspect-video rounded-xl overflow-hidden relative mb-4
                    transition-all duration-300 ambient-glow group-hover:scale-[1.02]
                    bg-surface-container-high">
          ${thumbnailHtml}
          <div class="absolute inset-0 flex items-end p-4 opacity-0
                      group-hover:opacity-100 transition-opacity duration-300"
               style="background:linear-gradient(to top,rgba(0,0,0,0.85) 0%,transparent 60%);">
            <button class="primary-gradient w-full py-2.5 rounded-lg font-bold text-sm
                           flex items-center justify-center gap-2
                           transition-transform active:scale-95"
                    style="color:#38005e;">
              ▶ PLAY
            </button>
          </div>
        </div>
        <h3 class="font-headline font-bold text-base
                   group-hover:text-primary transition-colors mb-1">
          ${game.title}
        </h3>
        <span class="font-label uppercase tracking-widest text-xs text-on-surface-variant">
          By Nemo
        </span>
      `;
      card.addEventListener('click', () => openModal(game));
      return card;
    }

    function renderGrid() {
      const grid = document.getElementById('game-grid');
      GAMES.forEach(game => grid.appendChild(buildCard(game)));
    }

    renderGrid();
```

- [ ] **Step 3: Verify in browser**

Expected: 10 game cards in a responsive grid. Cards show emoji placeholder. Hovering shows the PLAY button overlay with purple gradient. No JS errors.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: render game cards dynamically from GAMES array"
```

---

### Task 5: Modal overlay

**Files:**
- Modify: `index.html` — replace `<!-- MODAL -->` comment; add modal functions to `<script>`

- [ ] **Step 1: Replace `<!-- MODAL -->` with**

```html
  <!-- MODAL -->
  <div id="modal-overlay">
    <div id="modal-box">
      <!-- Modal header -->
      <div class="flex items-center justify-between px-6 py-4"
           style="background:#131316;">
        <span id="modal-title"
              class="font-headline font-bold text-lg text-on-surface"></span>
        <button id="modal-close"
                class="font-label uppercase tracking-widest text-xs
                       text-on-surface-variant hover:text-on-surface
                       transition-colors px-4 py-2 rounded-lg hover:bg-white/5">
          ✕ &nbsp;CLOSE
        </button>
      </div>
      <!-- iframe -->
      <iframe id="modal-iframe"
              title="Game"
              frameborder="0"
              allow="clipboard-write"
              allowfullscreen>
      </iframe>
    </div>
  </div>
```

- [ ] **Step 2: Add modal open/close functions inside the existing `<script>` tag**

Append the following inside the `<script>` tag, after `renderGrid()`:

```js
    const overlay  = document.getElementById('modal-overlay');
    const modalIframe = document.getElementById('modal-iframe');
    const modalTitle  = document.getElementById('modal-title');

    function openModal(game) {
      modalTitle.textContent = game.title;
      if (game.iframeSrc) {
        modalIframe.src = game.iframeSrc;
      } else {
        modalIframe.src = 'about:blank';
      }
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      // Clear src after transition so game audio stops
      setTimeout(() => { modalIframe.src = 'about:blank'; }, 260);
    }

    document.getElementById('modal-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
```

- [ ] **Step 3: Verify in browser**

Click any game card. Expected:
- Backdrop fades in with blur
- Modal box scales up smoothly
- Game title shown in header
- iframe loads (Game 1 loads the Claude artifact; others show blank)
- Click ✕, click backdrop, or press Escape → modal closes and iframe src clears

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add game modal with iframe embed and close handlers"
```

---

### Task 6: Final polish & production-ready check

**Files:**
- Modify: `index.html` — meta tags, page title, minor refinements

- [ ] **Step 1: Verify the `<title>` and meta description are set**

Confirm the `<head>` contains exactly:

```html
  <title>Nemo's Games</title>
  <meta name="description" content="Nemo's curated game library — 10 games, play in your browser."/>
```

If the description meta tag is missing, add it after the `<title>` tag.

- [ ] **Step 2: Confirm nav game count matches GAMES array length**

The `<span id="nav-count">` currently hardcodes "10 GAMES". Update the script to set it dynamically. Inside the `<script>` tag, add this line right after `renderGrid()`:

```js
    document.getElementById('nav-count').textContent =
      GAMES.length + (GAMES.length === 1 ? ' GAME' : ' GAMES');
```

- [ ] **Step 3: Verify final state in browser**

Open `index.html`. Check:
- [ ] Nav shows "NEMO'S GAMES" in purple, "10 GAMES" on right
- [ ] 10 cards visible in grid
- [ ] Hover → card scales, PLAY overlay appears
- [ ] Click card → modal opens with correct title and iframe
- [ ] Game 1 iframe (`claude.site` artifact) actually loads inside the modal
- [ ] ✕ button closes modal
- [ ] Click backdrop closes modal
- [ ] Escape key closes modal
- [ ] No JS errors in console

- [ ] **Step 4: Final commit**

```bash
git add index.html
git commit -m "feat: complete Nemo's Games — game grid with modal iframe player"
```

---

## Adding a Real Game Later

To replace a placeholder entry, edit the `GAMES` array in `index.html`:

```js
{ id: 2, title: 'My New Game', thumbnail: 'images/game2.png', iframeSrc: 'https://...' },
```

Put the screenshot in `images/game2.png` and the iframe URL in `iframeSrc`. No other changes needed.
