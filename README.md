# Christopher Alberto — Portfolio

A fast, animated single-page portfolio. Warm-dark "developer terminal" aesthetic, built with
**vanilla HTML / CSS / JS** + **GSAP** (ScrollTrigger) + **Lenis** smooth scroll. No build step.

```
portfolio/
├── index.html              ← the whole page
└── assets/
    ├── css/style.css       ← design system + all section styles
    └── js/main.js          ← GSAP scenes, counters, project filter, smooth scroll
```

## Deploy to Cloudflare Pages (free)
1. Push this `portfolio/` folder to a Git repo **or** use the Cloudflare dashboard → *Pages* → *Upload assets*.
2. Framework preset: **None**. Build command: *(empty)*. Output directory: **/** (this folder is the site root).
3. Deploy. `index.html` is served at the root — GSAP/Lenis load from CDN, so nothing else is needed.

> Prefer a single file? Everything is already relative; you can also inline `style.css`/`main.js`
> into `index.html` if your host wants one file.

## Swapping in real project screenshots
Each project card has an empty `.card__media` placeholder. Drop an image in and it covers the slot:
```html
<div class="card__media" data-ph="…"><span class="card__badge">FlyntWP</span>
  <img src="assets/img/tac-insights.jpg" alt="TAC Insights">
</div>
```
Recommended ratio **16:10**. Put files in `assets/img/`.

## Editing content
- **Hero terminal / stats** — top of `index.html` (`.hero`).
- **Projects** — `#work` section. Filtering keys off `data-stack` (`flynt` / `roots` / `woo` / `legal`).
- **Experience** — edit cards in **both** the desktop `.exp__track` and the mobile `.exp__vert` block.
- **Colors / fonts** — CSS custom properties at the top of `style.css` (`:root`).

## Converting to a WordPress Full-Site-Editing (block) theme
The markup is structured to map cleanly onto FSE templates / blocks:

| Section | Suggested FSE mapping |
|---|---|
| Nav | `parts/header.html` (Navigation block) |
| Hero | a Group block pattern, or an ACF block for the terminal |
| Stack / Certs | Query/loop or repeater (ACF) |
| Projects | **Custom Post Type** `project` + taxonomy `stack` → Query Loop block (the filter chips become a faceted query) |
| Experience | repeater/CPT `role` |
| Contact / Footer | `parts/footer.html` |

`theme.json` should carry the palette + the three font families (Space Grotesk, JetBrains Mono,
Archivo). Enqueue GSAP, ScrollTrigger and Lenis, then `main.js`, in `functions.php`.

Hand this folder to Claude Code and ask it to "scaffold a WordPress FSE block theme from this static
site, with a `project` CPT + `stack` taxonomy for the work grid."
