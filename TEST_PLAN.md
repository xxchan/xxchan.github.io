# Astro Site Test Plan

## Scope & Principles
- Treat the legacy production site (`https://xxchan.me/`) as the ground truth for content coverage, routes, metadata, and features that must exist in the Astro rewrite.
- Exercise the Astro dev server (`pnpm dev -- --host 0.0.0.0 --port 4321 > /tmp/astro-dev.log 2>&1 & echo $!`) via Chrome MCP/curl to confirm parity. Testing is read-only for both environments; never edit content/config while verifying.
- When differences appear, classify them: log only items where the Astro implementation is missing functionality, content, or polish that the baseline provides (or where the new site introduces a regression). Document intentional improvements separately if needed.
- Capture affirmative results too: whenever a parity check passes, jot down the URL/feature and note that behaviour matches the legacy site so future reviewers know it was validated.
- Capture each migration gap in the *Findings Log* with URL, observed vs. expected behaviour, reproduction steps, status, and proposed fix.

## Preparation Checklist
- Confirm you can reach `https://xxchan.me/` and `https://xxchan.github.io/` over HTTPS.
- Ensure local repo is clean; run `pnpm install` once to have scripts available for reference (`pnpm dev`, `pnpm test`).

## Test Execution Steps
1. **Start Local Server (read-only)**  
   - Run `pnpm dev -- --host 0.0.0.0 --port 4321` in the background (already configured) and confirm logs show Astro ready.  
   - Open `http://localhost:4321/` in Chrome MCP to ensure the Astro UI is reachable.
2. **Baseline Capture (legacy site)**  
   - Load `https://xxchan.me/` and inventory global elements (navigation links, search box, footer links), home hero content, featured articles, and taxonomy listings (`/categories/`, tag listings).  
   - Sample legacy post types (`/ai/...`, `/cs/...`, bilingual entries) to note embedded media, KaTeX, code fences, footnotes, pagination, and related-post widgets. Collect evidence (screenshots/notes) for parity checks.
3. **Comparative Smoke Test (Astro)**  
   - On `http://localhost:4321/`, verify matching navigation, hero copy “Hi, I’m xxchan 👋”, post listings, footer, and any global utilities (search, language toggles, feed links).  
   - Compare behaviour against baseline notes. Only log discrepancies where Astro is missing baseline coverage or introduces regressions; acknowledge intentional improvements inline for context.
4. **Content Parity & Rendering**  
   - For posts (`/blog/2022-02-07-paxos-hard/`, `/blog/2025-09-28-tool-eval/`, `/blog/2022-02-09-paxos-hard-zh/`), confirm TOC, KaTeX, code highlighting, alternate language links locally.  
   - Cross-check categories/tags counts between baseline (legacy categories pages) and local Astro `/tags/` and `/tags/<slug>/`.
5. **Feeds & Metadata**  
   - Legacy baseline: `curl -I https://xxchan.me/rss.xml`, `index.xml`, `posts.json` (expected 404 currently).  
   - Local: `curl -I http://localhost:4321/rss.xml`, `http://localhost:4321/index.xml`, `http://localhost:4321/posts.json`; inspect HTML head for canonical & OG meta.
6. **Redirects & Legacy URLs**  
   - From baseline, note existing behaviour (mostly 200s).  
   - Using local `pnpm test` and manual `curl -I http://localhost:4321/...`, verify redirect targets (`/ai/...` → `/blog/...`, `/categories/` → `/tags/`, etc.).
7. **Responsive & Accessibility**  
   - Employ Chrome MCP responsive modes to check mobile/desktop layouts on localhost.  
   - Run Lighthouse (local) and note scores; compare to baseline when possible.
8. **Performance & Caching**  
   - Capture DevTools Performance trace locally; compare TTFB/assets between baseline (via WebPageTest or DevTools) and Astro build.  
   - Inspect cache headers (`curl -I`) for localhost (Astro dev uses no-cache) vs. baseline (Cloudflare) to plan production expectations.
9. **Regression Safety Net**  
   - Run `pnpm test` locally (ensures redirect suite passes).  
   - Leave environments untouched after tests; stop dev server when finished.

## Production Baseline Feature Inventory
### Global Shell
- **Priority: High** Navigation bar (`https://xxchan.me/`) with greedy-nav collapse, site title link, and `Archive`/`About` items must function and retain skip-link accessibility.
- **Priority: Medium** Ensure global skip links and keyboard focus states mirror the legacy behaviour for accessibility parity.
- **Priority: High** Footer needs feed link, copyright text, and analytics scripts (Google Analytics `G-2MN995FKFK`, Tinybird flock) to load on every page.

### Sidebar & Profile
- **Priority: High** Author card (avatar, “Build something fun and useful” bio) appears on home/posts with correct social icons (Twitter, GitHub, LinkedIn) and external `rel` attributes.
- **Priority: Medium** `Follow` button toggles the social icon list without layout regressions on mobile breakpoints, and remains operable via keyboard (`Enter`/`Space`) with icons focusable after expansion.
- **Priority: Medium** Avatar hot-links to GitHub’s image CDN (`https://avatars.githubusercontent.com/...`); confirm the Astro build preserves a working headshot (or ships a local fallback) so CSP/cache tweaks do not break the portrait.

### Homepage & Listing Views
- **Priority: High** `Recent Posts` list keeps ordering, bilingual titles, and excerpts exactly as the Jekyll baseline (mix of `/ai/`, `/cs/`, `/misc/`, `/this-week-in-risingwave/`).
- **Priority: Medium** Verify legacy categories index (`/categories/`) still renders taxonomy counts, anchor links, and per-category groupings (e.g., CS=12, AI=5, Life=2, This-Week-in-RisingWave=1, Misc=1) with anchors like `/categories/#cs`.

### Post Template Essentials
- **Priority: High** Sticky “On this page” table of contents renders for long-form posts (e.g., `/cs/2023/02/17/optimize-rust-comptime-en.html`) with deep-link anchors intact.
- **Priority: Medium** TOC heading labels honor front-matter overrides/localization (`Contents` on `/cs/2022/02/07/paxos-hard.html`, `目录` on `/cs/2022/02/09/paxos-hard-zh.html`, `On this page` on `/ai/2025/06/10/ai-coding-en.html`) so the Astro rewrite mirrors each label verbatim.
- **Priority: High** Bilingual cross-links (e.g., `English version of this post`) remain functional between paired slugs.
- **Priority: High** Code fences, syntax highlighting, blockquotes, and inline images served from `/assets/img/...` display with expected styling.
- **Priority: Medium** `You May Also Enjoy` related posts grid and previous/next pagination preserve relationships and copy.
- **Priority: Medium** Giscus comment widget (`data-repo="xxchan/xxchan.github.io"`) mounts with light theme, reaction toggles, respects per-post titles, and retains the production config (`data-category="Announcements"`, `data-mapping="title"`, `data-lang="en"`).
- **Priority: Medium** MathJax configuration (footer script enabling `$...$`/`\(...\)` rendering) remains available for math-heavy articles such as the Paxos series.
- **Priority: Medium** Post footer metadata matches legacy output: category chips linking to `/categories/#<slug>`, “Updated” timestamps (`February 17, 2023` format), share buttons opening popup windows, plus the Previous/Next pager chaining bilingual posts (see `/cs/2023/02/17/optimize-rust-comptime-en.html`).

### Syndication & Integrations
- **Priority: High** Atom feed at `/feed.xml` continues to build and expose recent posts metadata.
- **Priority: Medium** Social share buttons (Twitter, Facebook, LinkedIn) on posts open share dialogs with accurate permalinks and titles.
- **Priority: Low** Feed endpoint preserves HTTP headers observed today (`Content-Type: application/xml`, `Access-Control-Allow-Origin: *`, `Cache-Control: max-age=600`) so downstream consumers keep working once migrated.
- **Priority: Low** Google Fonts (`Noto Serif SC`) and Font Awesome assets load without blocking layout; confirm Astro build maintains preload/async hints.

### Legacy Edge Cases Observed (2025-10-09)
- **Priority: Low** Short-form articles (e.g., `/this-week-in-risingwave/2023/04/02/twirw-migration.html`) render an empty “On this page” shell; decide whether to mirror this empty aside or hide it to avoid blank chrome while preserving sticky layout spacing.
- **Priority: Low** Category archive sections expose inline “Back to Top ↑” anchors after each group on `/categories/`; ensure the rewrite retains comparable quick navigation or replaces it with an accessible alternative.
- **Priority: Low** Theme 404 screen (`/search/` → HTTP 404) shows centered “Page not found :(” messaging; verify Astro returns the same status code and supplies a friendly fallback.

## Findings Log
- Use the template below for each issue and append entries in chronological order. Update status as items get triaged or resolved.
```
- [DATE] URL/Feature: Observed..., Expected..., Steps..., Status: Open | In Progress | Resolved.
```
- **Priority: High**  
  [2025-10-09] Canonical and social metadata point to old domain  
  Observed: Astro dev build outputs `<link rel="canonical" href="https://xxchan.github.io/...">` and matching OG/Twitter tags.  
  Expected: All canonical and social URLs should use the new production domain `https://xxchan.me`.  
  Steps: `curl -s http://localhost:4321/ | rg "canonical"`.  
  Status: Resolved.  
  Action: Update domain configuration in `astro.config.mjs`, `src/consts.ts`, and any other constants before rebuilding.

- **Priority: High**  
  [2025-10-09] Internal cross-links hard-coded to legacy domain  
  Observed: Markdown content still links to `https://xxchan.github.io/...` (e.g., bilingual post cross-links, historical references).  
  Expected: Internal links should target the new `https://xxchan.me` structure (prefer relative URLs to survive future domain changes).  
  Steps: `rg "https://xxchan.github.io" src/content`.  
  Status: Cancelled.  
  Action: Replace hard-coded legacy domain URLs with correct Astro routes or relative paths, adjusting slugs if necessary.
  comment: 我觉得用 absolute URL 挺好的，没必要切

- **Priority: High**  
  [2025-10-09] Footer analytics scripts and Atom feed absent  
  Observed: Astro footer renders only plain copyright text and omits GA `G-2MN995FKFK`, Tinybird flock, and the `/feed.xml` link; `/feed.xml` itself returns 404 on the dev server.  
  Expected: Footer should mirror production with analytics beacons and expose a working Atom feed endpoint.  
  Steps: `curl -s http://localhost:4321/ | rg "Tinybird"`, `curl -I http://localhost:4321/feed.xml`.  
  Status: Open.  
  Action: Restore footer scripts/link markup and ensure feed generation in the Astro build.

- **Priority: High**  
  [2025-10-09] Author card and follow interaction missing on homepage  
  Observed: Local home page shows only a short intro paragraph; the legacy author sidebar (avatar, bio, social icons with toggle) is absent.  
  Expected: Recreate the author profile component with Follow button behaviour for parity.  
  Steps: Compare `/tmp/astro-home.html` vs `/tmp/legacy-home.html`.  
  Status: Open.  
  Action: Implement an author sidebar component and integrate it into home/post layouts.

- **Priority: Medium**  
  [2025-10-09] Post footer enhancements and giscus widget not implemented  
  Observed: Astro posts stop after tag list; giscus comments, related-posts grid, and previous/next pagination are missing.  
  Expected: Match legacy `/cs/2022/02/07/paxos-hard.html` footer features to preserve engagement patterns.  
  Steps: `rg "giscus" /tmp/astro-paxos.html`, compare against legacy HTML.  
  Status: Open.  
  Action: Reintroduce giscus embed and related/pager sections in `BlogPost.astro`.

- **Priority: Medium**  
  [2025-10-09] Social metadata lacks article-specific context  
  Observed: `og:type` is always `website`, and pages without explicit descriptions fall back to the generic site tagline.  
  Expected: Article pages should emit `og:type=article` and reuse frontmatter excerpts/descriptions.  
  Steps: `curl -s http://localhost:4321/blog/2025-09-28-tool-eval/ | rg "og:type"`.  
  Status: Open.  
  Action: Enhance `BaseHead.astro` to detect post layouts and feed richer metadata.

- **Priority: High**  
  [2025-10-09] Latest posts ordering matches production  
  Observed: Home page lists the same six most recent entries as the legacy site with identical order and bilingual titles.  
  Expected: Maintain parity with production ordering.  
  Steps: `curl -s http://localhost:4321/`, `curl -s https://xxchan.me/`.  
  Status: Resolved.  
  Action: None; parity confirmed.

- **Priority: Medium**  
  [2025-10-09] Legacy redirects working  
  Observed: Requests to `/categories/` and dated `/cs/...` slugs return 308s to the new `/tags/` and `/blog/.../` routes; Vitest redirect suite passes.  
  Expected: Preserve legacy URL coverage.  
  Steps: `curl -I http://localhost:4321/categories/`, `curl -I http://localhost:4321/cs/2022/02/07/paxos-hard.html`, `pnpm test`.  
  Status: Resolved.  
  Action: None.

- **Priority: Medium**  
  [2025-10-09] TOC, KaTeX, and syntax highlighting render correctly  
  Observed: Paxos posts show sticky TOC, math, and Shiki-highlighted code blocks consistent with the baseline.  
  Expected: Maintain these rendering features across migrated posts.  
  Steps: `curl -s http://localhost:4321/blog/2022-02-07-paxos-hard/` manual inspection.  
  Status: Resolved.  
  Action: None.

- **Priority: Medium**  
  [2025-10-09] Skip links missing from global shell  
  Observed: Local home page lacks “Skip to …” anchors before the navigation bar, while the legacy site renders dedicated skip links for primary nav, content, and footer.  
  Expected: Provide the same skip-link affordances to preserve keyboard accessibility.  
  Steps: Inspect `http://localhost:4321/` and `https://xxchan.me/` with Chrome MCP; search for `a[href="#site-nav"]`.  
  Status: Open.  
  Action: Reintroduce skip-link markup in the layout header and ensure focus styles match production.

- **Priority: Medium**  
  [2025-10-09] Category index omits post counts  
  Observed: `/tags` shows a plain list of category names with no article counts, whereas `https://xxchan.me/categories/` displays “CS 12”, “AI 5”, etc. to communicate volume at a glance.  
  Expected: Surface per-category post counts (and equivalent tag statistics) on the Astro listing.  
  Steps: Compare `http://localhost:4321/tags` to `https://xxchan.me/categories/`.  
  Status: Open.  
  Action: Extend the Topics page data to compute counts and render them alongside each category/tag entry.
