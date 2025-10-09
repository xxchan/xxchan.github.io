# Astro Site Test Plan

## Scope & Principles
- Treat the legacy production site (`https://xxchan.me/`) as the ground truth for content coverage, routes, metadata, and features that must exist in the Astro rewrite.
- Exercise the Astro dev server (`pnpm dev -- --host 0.0.0.0 --port 4321 > /tmp/astro-dev.log 2>&1 & echo $!`) via Chrome MCP/curl to confirm parity. Testing is read-only for both environments; never edit content/config while verifying.
- When differences appear, classify them: log only items where the Astro implementation is missing functionality, content, or polish that the baseline provides (or where the new site introduces a regression). Document intentional improvements separately if needed.
- Capture affirmative results too: whenever a parity check passes, jot down the URL/feature and note that behaviour matches the legacy site so future reviewers know it was validated.
- Capture each migration gap in the *Findings Log* with URL, observed vs. expected behaviour, reproduction steps, status, and proposed fix.
- Keep the Production Baseline inventory in sync with the Findings Log: mark verified items with `✅ Parity confirmed <date>` and tag any open gaps with `🔴 Pending (see Findings)` so the table and the actionable list mirror one another.

## Preparation Checklist
- Confirm you can reach `https://xxchan.me/` and `https://xxchan.github.io/` over HTTPS.
- Ensure local repo is clean; run `pnpm install` once to have scripts available for reference (`pnpm dev`, `pnpm test`).

## Test Execution Steps
1. **Start Local Server (read-only)**  
   - Run `pnpm dev -- --host 0.0.0.0 --port 4321 > /tmp/astro-dev.log 2>&1 & echo $!` and wait for the “Astro ready” message.  
   - If port 4321 is occupied, Astro will auto-select another port—read the log (`tail -n5 /tmp/astro-dev.log`) and note the reported `http://localhost:####` for subsequent curls.

2. **Baseline Capture (legacy site)**  
   - Load `https://xxchan.me/` and inventory global elements (navigation links, skip links, footer analytics, hero content, taxonomy listings).  
   - Sample representative posts (`/ai/...`, `/cs/...`, bilingual entries) to document TOC behaviour, KaTeX, code fences, pagination, related posts, and giscus placement.

3. **Shell & Navigation Parity (local Astro)**  
   - Visit the local port recorded in step 1; confirm navigation links, hero copy (“Hi, I’m xxchan 👋”), author sidebar, and footer.  
   - Explicitly check the known gaps: skip-link anchors, analytics scripts in the footer, and RSS link visibility. Log any differences against the Findings section.

4. **Post Template & Footer Checks**  
   - Compare `/blog/2022-02-07-paxos-hard/`, `/blog/2025-09-28-tool-eval/`, `/blog/2022-02-09-paxos-hard-zh/` between legacy and local.  
   - Validate TOC labels, KaTeX, code highlighting, bilingual cross-links, giscus embed, related posts grid, and previous/next pagination; update Findings for any departures.

5. **Feeds & Metadata**  
   - Legacy reference: `curl -I https://xxchan.me/rss.xml`, `https://xxchan.me/index.xml`, `https://xxchan.me/posts.json` (expect 404).  
   - Local verification: replace the port in `curl -I http://localhost:PORT/rss.xml`, `http://localhost:PORT/index.xml`, `http://localhost:PORT/posts.json`; scrape the HTML head for canonical + OG/Twitter tags.

6. **Redirects & Legacy URLs**  
   - Run `pnpm test` to execute the Vitest redirect suite.  
   - Manually sample `curl -I http://localhost:PORT/categories/` and dated `/cs/...html` routes to ensure 308 redirects point to `/tags/` and `/blog/.../`.

7. **Build Artifacts & Robots**  
   - Stop the dev server when verification is done; run `pnpm build`.  
   - Inspect `dist/sitemap-index.xml`, `dist/sitemap-0.xml`, and `dist/robots.txt` (once added) to confirm domains and policy text match production.

8. **Responsive & Accessibility**  
   - Use Chrome MCP responsive viewports to confirm layout integrity from mobile to desktop.  
   - Audit focus order and skip-link behaviour with keyboard-only navigation.

9. **Performance & Caching**  
   - Capture a DevTools performance trace locally; compare asset waterfall/TTFB with legacy benchmarks.  
   - Inspect cache headers via `curl -I` to understand differences between Astro dev, build output, and production (Cloudflare).

10. **Regression Safety Net**  
    - After fixes, rerun `pnpm test` and any focused `curl` checks from the Findings list.  
    - Document results, then stop background processes (`kill <PID>` from step 1).

## Production Baseline Feature Inventory
### Global Shell
- ✅ **Priority: High** Navigation bar keeps the site title link and menu items (`Home`, `Blog`, `Topics`, `About`) working across breakpoints. Parity confirmed 2025-10-09.
- 🔴 **Priority: Medium** Ensure global skip links and keyboard focus states mirror the legacy behaviour for accessibility parity. (Pending; see Findings).
- 🔴 **Priority: High** Footer needs feed link, copyright text, and analytics scripts (Google Analytics `G-2MN995FKFK`, Tinybird flock) to load on every page. (Pending; see Findings).

### Sidebar & Profile
- ✅ **Priority: High** Author card (avatar, “Build something fun and useful” bio) appears on home/posts with correct social icons (Twitter, GitHub, LinkedIn) and external `rel` attributes. Parity confirmed 2025-10-09.
- ✅ **Priority: Medium** `Follow` button toggles the social icon list without layout regressions on mobile breakpoints, and remains operable via keyboard (`Enter`/`Space`) with icons focusable after expansion. Parity confirmed 2025-10-09.
- ✅ **Priority: Medium** Avatar hot-links to GitHub’s image CDN (`https://avatars.githubusercontent.com/...`); confirm the Astro build preserves a working headshot (or ships a local fallback) so CSP/cache tweaks do not break the portrait. Parity confirmed 2025-10-09.
- 🔴 **Priority: Medium** Preserve the legacy microformats/IndieWeb affordances (`h-card`, `u-photo`, `p-name`, `rel="me"`) alongside Schema.org metadata so identity parsers and social verification keep functioning. (Pending; see Findings).

### Homepage & Listing Views
- ✅ **Priority: High** `Recent Posts` list keeps ordering, bilingual titles, and excerpts exactly as the Jekyll baseline (mix of `/ai/`, `/cs/`, `/misc/`, `/this-week-in-risingwave/`). Parity confirmed 2025-10-09.
- 🔴 **Priority: Medium** Verify legacy categories index (`/categories/`) still renders taxonomy counts, the `taxonomy__index` quick-jump list (anchors like `#this-week-in-risingwave`), and per-category groupings (e.g., CS=12, AI=5, Life=2, This-Week-in-RisingWave=1, Misc=1) including the “Back to Top ↑” shortcuts. (Pending; see Findings).

### Post Template Essentials
- ✅ **Priority: High** Sticky “On this page” table of contents renders for long-form posts (e.g., `/cs/2023/02/17/optimize-rust-comptime-en.html`) with deep-link anchors intact. Parity confirmed 2025-10-09.
- ✅ **Priority: Medium** TOC heading labels honor front-matter overrides/localization (`Contents` on `/cs/2022/02/07/paxos-hard.html`, `目录` on `/cs/2022/02/09/paxos-hard-zh.html`, `On this page` on `/ai/2025/06/10/ai-coding-en.html`) so the Astro rewrite mirrors each label verbatim. Parity confirmed 2025-10-09.
- ✅ **Priority: High** Bilingual cross-links (e.g., `English version of this post`) remain functional between paired slugs. Parity confirmed 2025-10-09.
- 🔴 **Priority: Medium** Tag chips targeting `/tags/#<slug>` keep working; ensure the Astro `/tags` page exposes matching fragment IDs (`consensus`, `system`, etc.) so historical permalinks stay valid. (Pending; see Findings).
- 🔴 **Priority: Medium** HTML `lang` attributes and Open Graph `og:locale` values on bilingual posts mirror the production choices (Chinese articles currently render `lang="en"` unless we intentionally change that) to avoid regressions in screen readers and social previews. (Pending; see Findings).
- ✅ **Priority: High** Code fences, syntax highlighting, blockquotes, and inline images served from `/assets/img/...` display with expected styling. Parity confirmed 2025-10-09.
- 🔴 **Priority: Medium** `You May Also Enjoy` related posts grid and previous/next pagination preserve relationships and copy. (Pending; see Findings).
- 🔴 **Priority: Medium** Giscus comment widget (`data-repo="xxchan/xxchan.github.io"`) mounts with light theme, reaction toggles, respects per-post titles, and retains the production config (`data-category="Announcements"`, `data-mapping="title"`, `data-lang="en"`). (Pending; see Findings).
- 🔴 **Priority: Medium** MathJax configuration (footer script enabling `$...$`/`\(...\)` rendering) remains available for math-heavy articles such as the Paxos series. (Pending; see Findings).
- 🔴 **Priority: Medium** Post footer metadata matches legacy output: category chips linking to `/categories/#<slug>`, “Updated” timestamps (`February 17, 2023` format), share buttons opening popup windows, plus the Previous/Next pager chaining bilingual posts (see `/cs/2023/02/17/optimize-rust-comptime-en.html`). (Pending; see Findings).

### Syndication & Integrations
- ✅ **Priority: High** Atom feed at `/feed.xml` continues to build and expose recent posts metadata. Parity confirmed 2025-10-09.
- ✅ **Priority: Medium** Feed entries retain embedded HTML (images, lists, code blocks) inside CDATA so downstream readers render the same rich content as production. Parity confirmed 2025-10-09.
- 🔴 **Priority: Medium** Social share buttons (Twitter, Facebook, LinkedIn) on posts open share dialogs with accurate permalinks and titles. (Pending; see Findings).
- ✅ **Priority: High** Canonical, OG, and Twitter metadata reference `https://xxchan.me` across pages. Parity confirmed 2025-10-09.
- ✅ **Priority: Medium** Article pages emit `og:type=article`, publish timestamps, and tag metadata matching the legacy site. Parity confirmed 2025-10-09.
- ✅ **Priority: Medium** Sitemap build outputs `sitemap-index.xml`/`sitemap-0.xml` with `https://xxchan.me` URLs (`pnpm build`, then inspect `dist/sitemap-index.xml` and `dist/sitemap-0.xml`). Parity confirmed 2025-10-09.
- 🔴 **Priority: Low** Feed endpoint preserves HTTP headers observed today (`Content-Type: application/xml`, `Access-Control-Allow-Origin: *`, `Cache-Control: max-age=600`) so downstream consumers keep working once migrated. (Pending; see Findings).
- 🔴 **Priority: Low** Google Fonts (`Noto Serif SC`) and Font Awesome assets load without blocking layout; confirm Astro build maintains preload/async hints. (Pending; see Findings).
- 🔴 **Priority: Medium** `/robots.txt` serves the same allow/block policy text as production (`https://xxchan.me/robots.txt`) instead of the Astro 404 page. (Pending; see Findings).
- ✅ **Priority: Medium** Legacy routes (`/categories/`, dated `/cs/...` paths) 308 redirect to new slugs. Parity confirmed 2025-10-09.

### Legacy Edge Cases Observed (2025-10-09)
- **Priority: Low** Short-form articles (e.g., `/this-week-in-risingwave/2023/04/02/twirw-migration.html`) render an empty “On this page” shell; decide whether to mirror this empty aside or hide it to avoid blank chrome while preserving sticky layout spacing.
- **Priority: Low** Category archive sections expose inline “Back to Top ↑” anchors after each group on `/categories/`; ensure the rewrite retains comparable quick navigation or replaces it with an accessible alternative.
- **Priority: Low** Theme 404 screen (`/search/` → HTTP 404) shows centered “Page not found :(” messaging; verify Astro returns the same status code and supplies a friendly fallback.

## Findings Log
- Record only actionable items below; move validated checks into the Production Baseline section above.

### Open Findings (🔴)
- **Priority: High** Footer analytics scripts absent (GA `G-2MN995FKFK`, Tinybird).  
  Observed: Footer renders only copyright text + RSS link; analytics beacons are missing even though `/feed.xml` now returns 200.  
  Expected: Mirror legacy footer scripts while keeping the RSS link working.  
  Steps: `curl -s http://localhost:4323/ | rg "Tinybird"` (replace port as needed), `curl -I http://localhost:4323/feed.xml`.  
  Next: Embed analytics scripts in `src/components/Footer.astro`.

- **Priority: Medium** Post footer lacks giscus, related posts, and prev/next pagination.  
  Observed: Astro posts stop after the tag list.  
  Expected: Match legacy `/cs/2022/02/07/paxos-hard.html` footer features.  
  Steps: `curl -s http://localhost:4323/blog/2022-02-07-paxos-hard/ | rg "giscus"` (replace port as needed), compare against the legacy HTML.  
  Next: Restore giscus + related grid + pager in `src/layouts/BlogPost.astro`.

- **Priority: Medium** Skip links missing from the global shell.  
  Observed: Local home page lacks “Skip to …” anchors, while the legacy site renders dedicated skip links for nav, content, and footer.  
  Expected: Provide equivalent skip-link affordances for keyboard users.  
  Steps: Inspect `http://localhost:4323/` (replace port as needed) and `https://xxchan.me/` with Chrome MCP; search for `a[href="#site-nav"]`.  
  Next: Reintroduce skip-link markup + focus styles in `src/layouts/BaseLayout.astro` / `src/components/Header.astro`.

- **Priority: Medium** Microformats/IndieWeb hooks missing from author card.  
  Observed: Local markup lacks `class="h-card"`/`u-photo`/`rel="me"` attributes (`rg "h-card" /tmp/local_home.html`).  
  Expected: Mirror production microformats for identity parsers (`rg "h-card" /tmp/prod_home.html`).  
  Steps: Audit `src/components/AuthorCard.astro` and Schema.org metadata to combine both sets of attributes.  
  Next: Restore IndieWeb classes and rel attributes around the author card.

- **Priority: Medium** Category index omits post counts.  
  Observed: `/tags` shows a plain list without article counts.  
  Expected: Show counts similar to `https://xxchan.me/categories/` (“CS 12”, “AI 5”, etc.).  
  Steps: Compare `http://localhost:4323/tags` (replace port as needed) to `https://xxchan.me/categories/`.  
  Next: Extend the Topics data to compute and render counts.

- **Priority: Medium** Tag chips break legacy fragment URLs.  
  Observed: Post tags link to `/tags/consensus/` while the legacy site serves `/tags/#consensus`; `/tags` lacks fragment IDs for old permalinks.  
  Expected: Preserve historical `#slug` fragments so existing links remain valid.  
  Steps: Inspect `http://localhost:4323/blog/2022-02-07-paxos-hard/` for tag URLs and `http://localhost:4323/tags/` for fragment anchors; compare with production.  
  Next: Restore `#slug` anchors (or provide redirects) and align tag chip hrefs accordingly.

- **Priority: Medium** `og:locale` meta missing on bilingual posts.  
  Observed: Local pages omit `meta property="og:locale"` (`rg "og:locale" /tmp/local_paxos_zh.html`) while production supplies it.  
  Expected: Emit the same locale meta values to avoid social preview regressions.  
  Steps: Update the blog layout head to include `og:locale` derived from frontmatter language.  
  Next: Add locale meta tags for both English and Chinese posts.

- **Priority: Medium** MathJax script absent from post template.  
  Observed: No MathJax configuration or script tag on Paxos posts (`rg -i "mathjax" /tmp/local_paxos_en.html`).  
  Expected: Load the legacy MathJax config to render inline/Block math.  
  Steps: Port the MathJax `<script>` and config from production into `src/layouts/BlogPost.astro`.  
  Next: Restore MathJax so `$...$` markup renders locally.

- **Priority: Medium** Social share buttons missing from post footer.  
  Observed: Local posts lack Twitter/Facebook/LinkedIn share links (`rg "intent/tweet" /tmp/local_paxos_en.html`).  
  Expected: Provide the same share buttons as production for parity.  
  Steps: Copy share button markup into the Astro footer component and wire up popup handlers.  
  Next: Reintroduce share buttons after the post metadata block.

- **Priority: Medium** `robots.txt` missing locally.  
  Observed: `http://localhost:4323/robots.txt` returns the Astro 404 page, while production serves a policy document.  
  Expected: Serve the same policy text in the rewrite.  
  Steps: `curl -s http://localhost:4323/robots.txt` (replace port as needed), `curl -s https://xxchan.me/robots.txt`.  
  Next: Add `robots.txt` under `public/` or configure an Astro route.

- **Priority: Low** Feed headers diverge from production.  
  Observed: Local `/feed.xml` omits `Access-Control-Allow-Origin` and uses `Cache-Control: public, max-age=0` (`curl -I http://localhost:4323/feed.xml`).  
  Expected: Match production’s CORS and 10-minute cache policy (`curl -I https://xxchan.me/feed.xml`).  
  Steps: Update the feed endpoint to set response headers explicitly.  
  Next: Align feed headers for downstream consumers.

- **Priority: Low** Google Fonts + Font Awesome assets not enqueued.  
  Observed: Local pages lack `fonts.googleapis.com`/Font Awesome links (`rg "fonts.googleapis.com" /tmp/local_home.html`) while production preloads them.  
  Expected: Include the same font assets or documented replacements.  
  Steps: Reintroduce the font link/preload tags in the base layout head.  
  Next: Restore Google Fonts & Font Awesome references for typography parity.

### Decisions (🚫)
- **Priority: High** Keep absolute cross-domain links (`https://xxchan.github.io/...`) in migrated content.  
  Rationale: Project owner prefers absolute URLs; no change required.  
  Steps considered: `rg "https://xxchan.github.io" src/content`.
