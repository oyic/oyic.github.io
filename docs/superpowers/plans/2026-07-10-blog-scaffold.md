# Blog Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the static blog scaffold in `oyic.github.io` (this repo) described in §4 and §8 of `docs/superpowers/specs/2026-07-10-linkedin-blog-integration-design.md` — the one-time, human-built structure that `auto-linkedin` will later splice published articles into via marker-based commits. This plan does **not** touch the `auto-linkedin` repo (§3 of the spec) — that's separate, future work in a different codebase.

**Architecture:** Zero-build static HTML, reusing the homepage's existing warm-dark design system (`assets/css/style.css`, self-hosted fonts, existing `.card`/`.tag`/`.sec-head`/`.nav`/`.footer` classes) rather than inventing new components. Three marker-delimited files (`blog/index.html`, `sitemap.xml`, `feed.xml`) act as splice points for future automated commits; a template file (`blog/_template.html`) defines the single-post page shape with `{{placeholder}}` tokens matching spec §3.1/§4.

**Tech Stack:** Plain HTML/CSS/vanilla JS (no build step, no GSAP/Lenis on blog pages — those are homepage-only per the site's existing perf-focused commit history).

## Global Constraints

- Scope is limited to this repo (`oyic.github.io`). Do not create or edit anything in `/Users/calberto/code/auto-linkedin`.
- Marker comment strings must match the spec **verbatim** (auto-linkedin will search for these exact strings): `<!-- BLOG_LIST_START -->` / `<!-- BLOG_LIST_END -->`, `<!-- SITEMAP_URLS_START -->` / `<!-- SITEMAP_URLS_END -->`, `<!-- FEED_ITEMS_START -->` / `<!-- FEED_ITEMS_END -->`.
- Template placeholders must match spec §3.1 verbatim: `{{title}}`, `{{description}}`, `{{body}}`, `{{image}}`, `{{imageAlt}}`, `{{date}}`, `{{isoDate}}`, `{{slug}}`, `{{canonicalUrl}}`.
- All files under `blog/` use **root-relative** asset paths (`/assets/css/style.css`, not `assets/css/style.css`) because `blog/<slug>/index.html` sits two directories deep — relative paths would break. The homepage (`index.html`, at repo root) keeps its existing relative paths; leave those alone.
- Reuse existing CSS classes wherever the visual need already exists: `.wrap`, `.section`, `.sec-head`/`.sec-title`/`.sec-line`, `.card`/`.card__media`/`.card__body`/`.card__tags`, `.tag`, `.nav`/`.nav__links`/`.nav__logo`/`.nav__cta`/`.nav__burger`, `.footer`, `.btn`. Only add new CSS for things that don't already exist (empty-state message, post header, long-form article prose).
- Blog pages load **no** GSAP/Lenis/ScrollTrigger — only a small inline vanilla-JS snippet for nav scroll-shadow + mobile burger toggle (same behavior as `assets/js/main.js` sections 2–3, without the animation dependency), to keep these SEO/content pages fast.
- Design tokens (colors, fonts, spacing) come from the existing `:root` variables in `assets/css/style.css` — never hardcode a color/font that has a token.

---

## File Structure

- Create `blog/index.html` — blog listing page (page chrome + empty `#blog-list` grid with markers)
- Create `blog/_template.html` — single-post template with `{{placeholder}}` tokens
- Create `feed.xml` — RSS 2.0 feed, empty `<channel>` with marker block
- Modify `sitemap.xml` — add a static `/blog/` entry + marker block for future post URLs
- Modify `index.html` (homepage) — add "Blog" nav link + RSS autodiscovery `<link>`
- Modify `assets/css/style.css` — append a new `BLOG` section with the CSS listed below

## Task 1: Blog listing page (`blog/index.html`)

**Files:**
- Create: `blog/index.html`
- Modify: `assets/css/style.css` (append empty-state rule)

**Interfaces:**
- Produces: the `<!-- BLOG_LIST_START -->` / `<!-- BLOG_LIST_END -->` marker pair inside `<div class="proj__grid blog-list" id="blog-list">`, which Task 6's integration check and (later, out of scope) auto-linkedin will splice `<article>` teasers into.
- Consumes: existing classes `.proj__grid`, `.card`, `.card__media`, `.card__body`, `.card__tags`, `.tag`, `.sec-head`, `.sec-title`, `.sec-line`, `.wrap`, `.section`, `.nav*`, `.footer` (all already defined in `assets/css/style.css`).

- [ ] **Step 1: Write the failing structural check**

Run:
```bash
test -f /Users/calberto/code/portfolio/blog/index.html && echo EXISTS || echo MISSING
```
Expected: `MISSING`

- [ ] **Step 2: Create `blog/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Blog — Christopher Alberto</title>
<meta name="description" content="Notes on WordPress engineering, WooCommerce builds, and shipping for the modern web — written by Christopher Alberto." />
<meta name="author" content="Christopher Alberto" />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
<meta name="theme-color" content="#15110C" />
<link rel="canonical" href="https://chrisalberto.site/blog/" />
<link rel="alternate" type="application/rss+xml" title="Christopher Alberto — Blog" href="/feed.xml" />
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23FF7A3D'/%3E%3Ctext x='50' y='65' font-family='monospace' font-size='50' font-weight='bold' fill='%2315110C' text-anchor='middle'%3EWP%3C/text%3E%3C/svg%3E" />

<meta property="og:type" content="website" />
<meta property="og:url" content="https://chrisalberto.site/blog/" />
<meta property="og:site_name" content="Christopher Alberto" />
<meta property="og:title" content="Blog — Christopher Alberto" />
<meta property="og:description" content="Notes on WordPress engineering, WooCommerce builds, and shipping for the modern web." />
<meta property="og:image" content="https://chrisalberto.site/assets/images/og-image.jpg" />

<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:title" content="Blog — Christopher Alberto" />
<meta property="twitter:description" content="Notes on WordPress engineering, WooCommerce builds, and shipping for the modern web." />
<meta property="twitter:image" content="https://chrisalberto.site/assets/images/og-image.jpg" />

<link rel="stylesheet" href="/assets/css/fonts.css" />
<link rel="stylesheet" href="/assets/css/style.css" />
</head>
<body>
<a href="#main-content" class="skip-link">Skip to Content</a>
<div class="progress" id="progress"></div>

<nav class="nav" id="nav" aria-label="Primary">
  <a href="/" class="nav__logo">chrisalberto<span class="accent">.site</span></a>
  <div class="nav__links" id="nav-links">
    <a href="/#about">About</a>
    <a href="/#work">Work</a>
    <a href="/blog/" class="is-active">Blog</a>
    <a href="/#contact">Contact</a>
  </div>
  <div class="nav__actions">
    <a href="/Christopher-Alberto-Resume.pdf" download class="nav__cta nav__cta--resume">↓ Resume</a>
  </div>
  <button class="nav__burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="nav-links"><span></span><span></span><span></span></button>
</nav>

<main id="main-content">
<section class="section" id="blog-top">
  <div class="wrap">
    <div class="sec-head">
      <h1 class="sec-title">Blog</h1>
      <span class="sec-line"></span>
    </div>
    <p class="about__body">Notes on WordPress engineering, WooCommerce builds, and shipping for the modern web.</p>
    <div class="proj__grid blog-list" id="blog-list" style="margin-top:clamp(40px,6vh,76px);"><!-- BLOG_LIST_START --><!-- BLOG_LIST_END --></div>
  </div>
</section>

<footer class="footer">
  <span class="mono">© 2026 Christopher Alberto — Senior Full-Stack WordPress Engineer</span>
  <a href="/#top" class="footer__top">Back to top <span class="accent">↑</span></a>
</footer>
</main>

<script>
(function () {
  'use strict';
  var nav = document.getElementById('nav');
  function onScroll() { if (nav) nav.classList.toggle('scrolled', (window.scrollY || 0) > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  var burger = document.getElementById('burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
})();
</script>

<!--
  TEASER CONTRACT for automated publishing (auto-linkedin reads this file via
  the GitHub Contents API and prepends one block like this right after
  BLOG_LIST_START for every published post):

  <article class="card blog-card">
    <a href="{{canonicalUrl}}" class="card__media" data-ph="ARTICLE">
      <img src="{{image}}" alt="{{imageAlt}}" loading="lazy" />
    </a>
    <div class="card__body">
      <h3><a href="{{canonicalUrl}}">{{title}}</a></h3>
      <p>{{description}}</p>
      <div class="card__tags"><span class="tag mono">{{date}}</span></div>
    </div>
  </article>
-->
</body>
</html>
```

Note the `<div ... id="blog-list">...<!-- BLOG_LIST_START --><!-- BLOG_LIST_END --></div>` has **no whitespace** between the tags/comments — this is required for the `:empty` CSS selector in Step 3 to match (whitespace text nodes count against `:empty`; comments don't).

- [ ] **Step 3: Append the empty-state CSS rule to `assets/css/style.css`**

Add after the existing `.footer__top:hover{...}` rule (around line 434), before the `RESPONSIVE` section:

```css
/* ====================== BLOG ====================== */
.blog-list:empty::after{content:"No posts yet — new articles are on the way.";font-family:var(--mono);font-size:14px;color:var(--faint);grid-column:1/-1;padding:40px 0;}
```

- [ ] **Step 4: Run the structural check again**

```bash
test -f /Users/calberto/code/portfolio/blog/index.html && echo EXISTS || echo MISSING
grep -c "BLOG_LIST_START" /Users/calberto/code/portfolio/blog/index.html
grep -c "blog-list:empty" /Users/calberto/code/portfolio/assets/css/style.css
```
Expected: `EXISTS`, `1`, `1`

- [ ] **Step 5: Visual check**

```bash
cd /Users/calberto/code/portfolio && python3 -m http.server 8123 &
```
Open `http://localhost:8123/blog/` in a browser (or via `claude-in-chrome`/Playwright tools). Confirm: nav renders with "Blog" not yet linked from homepage (that's Task 5), page shows "Blog" heading and the "No posts yet — new articles are on the way." empty-state message centered in the grid area, styled in dim mono text, footer renders correctly. Kill the server after (`kill %1`).

- [ ] **Step 6: Commit**

```bash
git add blog/index.html assets/css/style.css
git commit -m "Add blog listing page scaffold"
```

## Task 2: Single-post template (`blog/_template.html`)

**Files:**
- Create: `blog/_template.html`
- Modify: `assets/css/style.css` (append post-header + article prose CSS)

**Interfaces:**
- Produces: the `{{title}}`, `{{description}}`, `{{body}}`, `{{image}}`, `{{imageAlt}}`, `{{date}}`, `{{isoDate}}`, `{{canonicalUrl}}` placeholder tokens (per spec §3.1/§4) that the future auto-linkedin renderer fills in and writes to `blog/<slug>/index.html`.
- Consumes: `.article`, `.post-hero*`, `.post-cover*` CSS classes defined in this task; `.wrap`, `.footer`, `.nav*` from the existing stylesheet.

- [ ] **Step 1: Write the failing structural check**

```bash
test -f /Users/calberto/code/portfolio/blog/_template.html && echo EXISTS || echo MISSING
```
Expected: `MISSING`

- [ ] **Step 2: Create `blog/_template.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{{title}} — Christopher Alberto</title>
<meta name="description" content="{{description}}" />
<meta name="author" content="Christopher Alberto" />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
<meta name="theme-color" content="#15110C" />
<link rel="canonical" href="{{canonicalUrl}}" />
<link rel="alternate" type="application/rss+xml" title="Christopher Alberto — Blog" href="/feed.xml" />
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23FF7A3D'/%3E%3Ctext x='50' y='65' font-family='monospace' font-size='50' font-weight='bold' fill='%2315110C' text-anchor='middle'%3EWP%3C/text%3E%3C/svg%3E" />

<meta property="og:type" content="article" />
<meta property="og:url" content="{{canonicalUrl}}" />
<meta property="og:site_name" content="Christopher Alberto" />
<meta property="og:title" content="{{title}}" />
<meta property="og:description" content="{{description}}" />
<meta property="og:image" content="{{image}}" />
<meta property="og:image:alt" content="{{imageAlt}}" />
<meta property="article:published_time" content="{{isoDate}}" />

<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="{{canonicalUrl}}" />
<meta property="twitter:title" content="{{title}}" />
<meta property="twitter:description" content="{{description}}" />
<meta property="twitter:image" content="{{image}}" />
<meta property="twitter:image:alt" content="{{imageAlt}}" />

<link rel="stylesheet" href="/assets/css/fonts.css" />
<link rel="stylesheet" href="/assets/css/style.css" />

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "{{title}}",
  "description": "{{description}}",
  "image": "{{image}}",
  "datePublished": "{{isoDate}}",
  "dateModified": "{{isoDate}}",
  "author": { "@type": "Person", "name": "Christopher Alberto", "url": "https://chrisalberto.site" },
  "publisher": { "@type": "Person", "name": "Christopher Alberto" },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "{{canonicalUrl}}" }
}
</script>
</head>
<body>
<a href="#main-content" class="skip-link">Skip to Content</a>
<div class="progress" id="progress"></div>

<nav class="nav" id="nav" aria-label="Primary">
  <a href="/" class="nav__logo">chrisalberto<span class="accent">.site</span></a>
  <div class="nav__links" id="nav-links">
    <a href="/#about">About</a>
    <a href="/#work">Work</a>
    <a href="/blog/" class="is-active">Blog</a>
    <a href="/#contact">Contact</a>
  </div>
  <div class="nav__actions">
    <a href="/Christopher-Alberto-Resume.pdf" download class="nav__cta nav__cta--resume">↓ Resume</a>
  </div>
  <button class="nav__burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="nav-links"><span></span><span></span><span></span></button>
</nav>

<main id="main-content">
<article>
  <header class="post-hero wrap">
    <a href="/blog/" class="post-hero__back">← All posts</a>
    <div class="post-hero__meta"><time datetime="{{isoDate}}">{{date}}</time></div>
    <h1 class="post-hero__title">{{title}}</h1>
  </header>
  <figure class="post-cover wrap">
    <img src="{{image}}" alt="{{imageAlt}}" width="1200" height="630" loading="eager" fetchpriority="high" />
  </figure>
  <div class="article wrap">
{{body}}
  </div>
</article>

<footer class="footer">
  <span class="mono">© 2026 Christopher Alberto — Senior Full-Stack WordPress Engineer</span>
  <a href="/#top" class="footer__top">Back to top <span class="accent">↑</span></a>
</footer>
</main>

<script>
(function () {
  'use strict';
  var nav = document.getElementById('nav');
  function onScroll() { if (nav) nav.classList.toggle('scrolled', (window.scrollY || 0) > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  var burger = document.getElementById('burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
})();
</script>
</body>
</html>
```

- [ ] **Step 3: Append post-header + article prose CSS to `assets/css/style.css`**

Add directly below the `.blog-list:empty::after{...}` rule from Task 1:

```css
.post-hero{padding-top:150px;padding-bottom:40px;}
.post-hero__back{font-family:var(--mono);font-size:13px;color:var(--dim);letter-spacing:.04em;transition:color .2s;}
.post-hero__back:hover{color:var(--accent);}
.post-hero__meta{margin-top:22px;font-family:var(--mono);font-size:13px;color:var(--faint);letter-spacing:.06em;text-transform:uppercase;}
.post-hero__title{font-family:var(--display);font-weight:800;font-size:clamp(32px,5vw,56px);line-height:1.08;letter-spacing:-.02em;margin-top:14px;max-width:820px;}
.post-cover{margin-top:36px;}
.post-cover img{width:100%;border-radius:var(--r);border:1px solid var(--line);aspect-ratio:1200/630;object-fit:cover;}
.article{max-width:720px;margin:48px auto 0;padding-bottom:clamp(90px,12vh,160px);color:var(--dim);font-size:17px;line-height:1.75;}
.article h2{font-family:var(--display);font-weight:700;font-size:clamp(24px,3vw,32px);color:var(--text);letter-spacing:-.01em;margin:44px 0 16px;}
.article h3{font-family:var(--display);font-weight:700;font-size:clamp(20px,2.4vw,24px);color:var(--text);margin:34px 0 12px;}
.article p{margin:0 0 20px;}
.article a{color:var(--accent);text-decoration:underline;text-underline-offset:3px;}
.article a:hover{color:var(--accent-2);}
.article ul,.article ol{margin:0 0 20px;padding-left:22px;}
.article li{margin-bottom:8px;}
.article blockquote{border-left:2px solid var(--accent);margin:28px 0;padding:4px 0 4px 20px;color:var(--text);font-style:italic;}
.article code{font-family:var(--mono);font-size:15px;background:var(--bg-3);border:1px solid var(--line);border-radius:4px;padding:2px 6px;}
.article pre{background:var(--bg-3);border:1px solid var(--line);border-radius:var(--r);padding:18px 20px;overflow-x:auto;margin:0 0 20px;}
.article pre code{border:none;background:none;padding:0;}
.article img{border-radius:var(--r);margin:28px 0;}
```

Do **not** use the `padding` shorthand on `.post-hero` — it would zero out `padding-inline` inherited from the `.wrap` class also applied to that element. Use `padding-top`/`padding-bottom` only, as written above.

- [ ] **Step 4: Run the structural check again**

```bash
test -f /Users/calberto/code/portfolio/blog/_template.html && echo EXISTS || echo MISSING
grep -o "{{[a-zA-Z]*}}" /Users/calberto/code/portfolio/blog/_template.html | sort -u
grep -c "post-hero__title" /Users/calberto/code/portfolio/assets/css/style.css
```
Expected: `EXISTS`, then the sorted list `{{canonicalUrl}} {{date}} {{description}} {{image}} {{imageAlt}} {{isoDate}} {{title}}` (note: `{{body}}` and `{{slug}}` are intentionally not present as literal head/meta placeholders — `{{body}}` appears once as raw HTML content, `{{slug}}` is consumed by the renderer to compute the file path, not embedded in the page itself; verify `{{body}}` separately below), and `1` for the CSS check.

```bash
grep -c "{{body}}" /Users/calberto/code/portfolio/blog/_template.html
```
Expected: `1`

- [ ] **Step 5: Fixture render + visual check**

```bash
cd /Users/calberto/code/portfolio
python3 - <<'EOF'
import re, pathlib
tpl = pathlib.Path("blog/_template.html").read_text()
values = {
    "title": "Why We Moved Our WooCommerce Store to FlyntWP",
    "description": "A field report on migrating a mid-size WooCommerce store to a FlyntWP-based theme without downtime.",
    "body": "<p>This is a fixture paragraph to sanity-check article typography.</p><h2>A heading</h2><p>Another paragraph with <a href=\"#\">a link</a>.</p>",
    "image": "/assets/images/og-image.jpg",
    "imageAlt": "Fixture cover image",
    "date": "July 10, 2026",
    "isoDate": "2026-07-10T00:00:00Z",
    "canonicalUrl": "https://chrisalberto.site/blog/fixture-post/",
}
out = tpl
for k, v in values.items():
    out = out.replace("{{%s}}" % k, v)
assert "{{" not in out, "unresolved placeholder left in output"
pathlib.Path("blog/__fixture-preview").mkdir(exist_ok=True)
pathlib.Path("blog/__fixture-preview/index.html").write_text(out)
print("OK: fixture written, no unresolved placeholders")
EOF
python3 -m http.server 8123 &
```
Open `http://localhost:8123/blog/__fixture-preview/` in a browser (or via `claude-in-chrome`/Playwright). Confirm: nav renders correctly, post title/date/back-link render, cover image (falls back to the site OG image) renders with rounded corners, article body paragraph/heading/link render with correct typography and accent-colored underlined link. Kill the server (`kill %1`) and delete the fixture:

```bash
rm -rf /Users/calberto/code/portfolio/blog/__fixture-preview
```

- [ ] **Step 6: Commit**

```bash
git add blog/_template.html assets/css/style.css
git commit -m "Add single-post blog template"
```

## Task 3: RSS feed (`feed.xml`)

**Files:**
- Create: `feed.xml`

**Interfaces:**
- Produces: `<!-- FEED_ITEMS_START -->` / `<!-- FEED_ITEMS_END -->` marker pair inside `<channel>`.

- [ ] **Step 1: Write the failing check**

```bash
test -f /Users/calberto/code/portfolio/feed.xml && echo EXISTS || echo MISSING
```
Expected: `MISSING`

- [ ] **Step 2: Create `feed.xml`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Christopher Alberto — Blog</title>
    <link>https://chrisalberto.site/blog/</link>
    <description>Notes on WordPress engineering, WooCommerce builds, and shipping for the modern web.</description>
    <language>en-us</language>
    <atom:link href="https://chrisalberto.site/feed.xml" rel="self" type="application/rss+xml" />
    <!-- FEED_ITEMS_START --><!--
      Each publish prepends one item here (list capped to the 20 most recent),
      format (note: pubDate is RFC-822, NOT the {{isoDate}} used in the template):
      <item>
        <title>{{title}}</title>
        <link>{{canonicalUrl}}</link>
        <guid isPermaLink="true">{{canonicalUrl}}</guid>
        <pubDate>{{rfc822Date}}</pubDate>
        <description>{{description}}</description>
      </item>
    --><!-- FEED_ITEMS_END -->
  </channel>
</rss>
```

- [ ] **Step 3: Validate well-formedness and markers**

```bash
python3 -c "import xml.dom.minidom as m; m.parse('/Users/calberto/code/portfolio/feed.xml'); print('WELL-FORMED')"
grep -c "FEED_ITEMS_START" /Users/calberto/code/portfolio/feed.xml
```
Expected: `WELL-FORMED`, `1`

- [ ] **Step 4: Commit**

```bash
git add feed.xml
git commit -m "Add empty RSS feed scaffold for blog"
```

## Task 4: Sitemap marker block (`sitemap.xml`)

**Files:**
- Modify: `sitemap.xml`

**Interfaces:**
- Produces: `<!-- SITEMAP_URLS_START -->` / `<!-- SITEMAP_URLS_END -->` marker pair, plus a new static `<url>` entry for `/blog/`.

- [ ] **Step 1: Write the failing check**

```bash
grep -c "SITEMAP_URLS_START" /Users/calberto/code/portfolio/sitemap.xml
```
Expected: `0`

- [ ] **Step 2: Read current file, then modify**

Current `sitemap.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://chrisalberto.site/</loc>
    <lastmod>2026-06-14</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

Replace with:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://chrisalberto.site/</loc>
    <lastmod>2026-06-14</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://chrisalberto.site/blog/</loc>
    <lastmod>2026-07-10</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- SITEMAP_URLS_START --><!--
    Each publish prepends one url here, format:
    <url>
      <loc>{{canonicalUrl}}</loc>
      <lastmod>{{isoDate}}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.6</priority>
    </url>
  --><!-- SITEMAP_URLS_END -->
</urlset>
```

- [ ] **Step 3: Validate**

```bash
python3 -c "import xml.dom.minidom as m; m.parse('/Users/calberto/code/portfolio/sitemap.xml'); print('WELL-FORMED')"
grep -c "SITEMAP_URLS_START" /Users/calberto/code/portfolio/sitemap.xml
grep -c "chrisalberto.site/blog/" /Users/calberto/code/portfolio/sitemap.xml
```
Expected: `WELL-FORMED`, `1`, `1`

- [ ] **Step 4: Commit**

```bash
git add sitemap.xml
git commit -m "Add blog URL and marker block to sitemap"
```

## Task 5: Homepage nav link + feed autodiscovery

**Files:**
- Modify: `index.html:12` (head, add feed `<link>` after the canonical link)
- Modify: `index.html:648-657` (nav, add "Blog" link)

**Interfaces:**
- Consumes: `/blog/` (Task 1), `/feed.xml` (Task 3).

- [ ] **Step 1: Write the failing check**

```bash
grep -c 'href="/blog/"' /Users/calberto/code/portfolio/index.html
grep -c 'type="application/rss+xml"' /Users/calberto/code/portfolio/index.html
```
Expected: `0`, `0`

- [ ] **Step 2: Add feed autodiscovery link**

In `index.html`, after the line `<link rel="canonical" href="https://chrisalberto.site" />` (line 12), add:

```html
<link rel="alternate" type="application/rss+xml" title="Christopher Alberto — Blog" href="/feed.xml" />
```

- [ ] **Step 3: Add the "Blog" nav link**

Find (around line 650-657):
```html
  <div class="nav__links" id="nav-links">
    <a href="#about">About</a>
    <a href="#stack">Stack</a>
    <a href="#work">Work</a>
    <a href="#experience">Experience</a>
    <a href="#certs">Certs</a>
    <a href="#contact">Contact</a>
  </div>
```

Replace with:
```html
  <div class="nav__links" id="nav-links">
    <a href="#about">About</a>
    <a href="#stack">Stack</a>
    <a href="#work">Work</a>
    <a href="#experience">Experience</a>
    <a href="#certs">Certs</a>
    <a href="/blog/">Blog</a>
    <a href="#contact">Contact</a>
  </div>
```

- [ ] **Step 4: Run the check again**

```bash
grep -c 'href="/blog/"' /Users/calberto/code/portfolio/index.html
grep -c 'type="application/rss+xml"' /Users/calberto/code/portfolio/index.html
```
Expected: `1`, `1`

- [ ] **Step 5: Visual check**

```bash
cd /Users/calberto/code/portfolio && python3 -m http.server 8123 &
```
Open `http://localhost:8123/` in a browser. Confirm the nav now shows a "Blog" link between "Certs" and "Contact" (desktop) and in the mobile menu (resize to <880px), and that clicking it navigates to `/blog/`. Kill the server (`kill %1`).

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "Link blog from homepage nav and add RSS autodiscovery"
```

## Task 6: End-to-end splice simulation (verification only, no repo changes)

**Files:** none committed — this task proves the marker-splice contract works before calling the scaffold done. Everything happens in a scratch copy.

**Interfaces:**
- Consumes: `blog/index.html`, `blog/_template.html`, `feed.xml`, `sitemap.xml` (all prior tasks).

- [ ] **Step 1: Copy scaffold files to scratch and simulate one publish**

```bash
mkdir -p /private/tmp/claude-502/-Users-calberto-code-portfolio/ba34ba01-3380-41da-957a-7eee8e66ff58/scratchpad/blog-splice-test
cd /Users/calberto/code/portfolio
cp blog/index.html feed.xml sitemap.xml /private/tmp/claude-502/-Users-calberto-code-portfolio/ba34ba01-3380-41da-957a-7eee8e66ff58/scratchpad/blog-splice-test/
python3 - <<'EOF'
import pathlib
d = pathlib.Path("/private/tmp/claude-502/-Users-calberto-code-portfolio/ba34ba01-3380-41da-957a-7eee8e66ff58/scratchpad/blog-splice-test")

values = {
    "title": "Migrating a WooCommerce Store to FlyntWP",
    "description": "A field report on a zero-downtime FlyntWP migration.",
    "image": "/assets/blog/migrating-woocommerce-flyntwp-a1b2c3/cover.jpg",
    "imageAlt": "FlyntWP migration cover image",
    "date": "July 10, 2026",
    "isoDate": "2026-07-10T00:00:00Z",
    "rfc822Date": "Fri, 10 Jul 2026 00:00:00 GMT",
    "canonicalUrl": "https://chrisalberto.site/blog/migrating-woocommerce-flyntwp-a1b2c3/",
}

# 1. blog/index.html: splice a teaser after BLOG_LIST_START
listing = (d / "index.html").read_text()
teaser = (
    '<article class="card blog-card">'
    '<a href="{canonicalUrl}" class="card__media" data-ph="ARTICLE"><img src="{image}" alt="{imageAlt}" loading="lazy" /></a>'
    '<div class="card__body"><h3><a href="{canonicalUrl}">{title}</a></h3><p>{description}</p>'
    '<div class="card__tags"><span class="tag mono">{date}</span></div></div></article>'
).format(**values)
marker = "<!-- BLOG_LIST_START -->"
assert marker in listing, "BLOG_LIST_START marker missing"
listing = listing.replace(marker, marker + teaser, 1)
(d / "index.html").write_text(listing)
assert 'href="https://chrisalberto.site/blog/migrating-woocommerce-flyntwp-a1b2c3/"' in listing

# 2. feed.xml: splice an item after FEED_ITEMS_START
feed = (d / "feed.xml").read_text()
item = (
    "<item><title>{title}</title><link>{canonicalUrl}</link>"
    '<guid isPermaLink="true">{canonicalUrl}</guid><pubDate>{rfc822Date}</pubDate>'
    "<description>{description}</description></item>"
).format(**values)
marker = "<!-- FEED_ITEMS_START -->"
assert marker in feed, "FEED_ITEMS_START marker missing"
feed = feed.replace(marker, marker + item, 1)
(d / "feed.xml").write_text(feed)

# 3. sitemap.xml: splice a url after SITEMAP_URLS_START
sm = (d / "sitemap.xml").read_text()
url = (
    "<url><loc>{canonicalUrl}</loc><lastmod>{isoDate}</lastmod>"
    "<changefreq>monthly</changefreq><priority>0.6</priority></url>"
).format(**values)
marker = "<!-- SITEMAP_URLS_START -->"
assert marker in sm, "SITEMAP_URLS_START marker missing"
sm = sm.replace(marker, marker + url, 1)
(d / "sitemap.xml").write_text(sm)

# 4. blog/_template.html: render the single-post page
tpl = pathlib.Path("/Users/calberto/code/portfolio/blog/_template.html").read_text()
for k, v in values.items():
    if "{{%s}}" % k in tpl:
        tpl = tpl.replace("{{%s}}" % k, v)
tpl = tpl.replace("{{body}}", "<p>Fixture body content for splice test.</p>")
assert "{{" not in tpl, "unresolved placeholder in rendered post"
post_dir = d / "migrating-woocommerce-flyntwp-a1b2c3"
post_dir.mkdir(exist_ok=True)
(post_dir / "index.html").write_text(tpl)

print("OK: all four splices succeeded")
EOF
```
Expected: `OK: all four splices succeeded` with no assertion errors.

- [ ] **Step 2: Validate the spliced XML files are still well-formed**

```bash
python3 -c "import xml.dom.minidom as m; m.parse('/private/tmp/claude-502/-Users-calberto-code-portfolio/ba34ba01-3380-41da-957a-7eee8e66ff58/scratchpad/blog-splice-test/feed.xml'); print('FEED WELL-FORMED')"
python3 -c "import xml.dom.minidom as m; m.parse('/private/tmp/claude-502/-Users-calberto-code-portfolio/ba34ba01-3380-41da-957a-7eee8e66ff58/scratchpad/blog-splice-test/sitemap.xml'); print('SITEMAP WELL-FORMED')"
```
Expected: `FEED WELL-FORMED`, `SITEMAP WELL-FORMED`

- [ ] **Step 3: Visual check of the fully spliced listing + post**

```bash
cd /private/tmp/claude-502/-Users-calberto-code-portfolio/ba34ba01-3380-41da-957a-7eee8e66ff58/scratchpad/blog-splice-test
python3 -m http.server 8124 &
```
Open `http://localhost:8124/index.html` — confirm the teaser card now renders (image, title, description, date tag) and the "No posts yet" message is gone (grid is no longer `:empty`). Open `http://localhost:8124/migrating-woocommerce-flyntwp-a1b2c3/` — confirm the rendered post page looks correct. Kill the server (`kill %1`).

- [ ] **Step 4: Clean up scratch (no repo files were touched, nothing to commit)**

```bash
rm -rf /private/tmp/claude-502/-Users-calberto-code-portfolio/ba34ba01-3380-41da-957a-7eee8e66ff58/scratchpad/blog-splice-test
```
