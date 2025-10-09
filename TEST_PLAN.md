# Astro Site Test Plan

## Scope & Principles
- Validate the production deployment at `https://xxchan.me/` after the Jekyll → Astro migration. Use the live site unless a staging URL is provided.
- **Do not modify site content or configuration during testing.** All checks must be read-only (browser, curl, Lighthouse, etc.).
- Capture every deviation or regression in the *Findings Log* section below as you discover it. Include URL, observed behaviour, expected behaviour, and current status.

## Preparation Checklist
- Confirm you can reach `https://xxchan.me/` and `https://xxchan.github.io/` over HTTPS.
- Install/update tooling: Chrome (desktop + DevTools), Safari (mobile or device simulator), Firefox, `curl`, and Lighthouse CLI or the Chrome extension.
- Ensure local repo is clean; run `npm install` once to have scripts available for reference (`npm run dev`, `npm run test`), but do not start the dev server unless verifying a fix.

## Test Execution Steps
1. **Baseline Smoke (no edits)**  
   - Load `/` and verify header navigation, hero copy, latest posts list, footer year.  
   - Visit `/404` to confirm custom not-found experience.
2. **Content Parity & Rendering**  
   - Sample three posts (e.g. `2022-02-07-paxos-hard`, `2025-09-28-tool-eval`, a bilingual entry). Check title, dates, TOC presence, KaTeX rendering, code blocks, alternate-language link, tag list.  
   - Validate `/tags/` taxonomy counts and `/tags/<slug>/` listings match expectations from legacy site.
3. **Feeds & Metadata**  
   - `curl -I https://xxchan.me/rss.xml`, `index.xml`, `posts.json` to ensure 200 responses and correct `Content-Type`.  
   - Inspect page source for `<link rel="canonical">`, OG/Twitter tags, and favicon links.
4. **Redirects & Legacy URLs**  
   - Using `curl -I`, test examples from `tests/redirects.test.ts` (`/ai/2025/09/28/tool-eval.html`, `/categories/`, `/cs/2020/09/02/intern-at-meituan.html`) and confirm 3xx status with the desired destination.
5. **Responsive & Accessibility**  
   - In Chrome DevTools, emulate iPhone 14 Pro and a 4K desktop: check navigation wrap, typography, TOC stickiness, table overflow.  
   - Run Lighthouse (or axe) for Accessibility; note all scores < 90 or violations.
6. **Performance & Caching**  
   - Record Performance trace on first load and repeat load; capture TTFB, CLS, asset waterfall.  
   - Verify `Cache-Control` headers for HTML vs. static assets and presence of Brotli/Gzip.
7. **Regression Safety Net**  
   - Run `npm run test` locally (no code changes) to ensure Vitest redirects suite remains green.

## Findings Log
- Use the template below for each issue and append entries in chronological order. Update status as items get triaged or resolved.
```
- [DATE] URL/Feature: Observed..., Expected..., Steps..., Status: Open | In Progress | Resolved.
```
- [2025-10-09] https://xxchan.me/ (Home): Observed HTML still served by Jekyll Minimal Mistakes theme (see `<!-- Minimal Mistakes ... -->` in response) with legacy navigation; Expected Astro layout with `/` hero "Hi, I’m xxchan 👋", simplified header/footer from new repo; Steps: `curl -s https://xxchan.me/ | head`; Status: Open.
- [2025-10-09] https://xxchan.me/404: Observed status 200 with legacy Jekyll not-found page; Expected 404 status with Astro custom 404; Steps: `curl -I https://xxchan.me/404`; Status: Open.
- [2025-10-09] https://xxchan.me/blog/2022-02-07-paxos-hard/: Observed 404 with legacy site structure (new Astro slug not present); Expected migrated Astro blog route to render post with TOC and KaTeX; Steps: `curl -I https://xxchan.me/blog/2022-02-07-paxos-hard/`; Status: Open.
- [2025-10-09] https://xxchan.me/blog/2025-09-28-tool-eval/: Observed 404 instead of migrated Astro post; Expected new article route with evaluation content; Steps: `curl -I https://xxchan.me/blog/2025-09-28-tool-eval/`; Status: Open.
- [2025-10-09] https://xxchan.me/blog/2022-02-09-paxos-hard-zh/: Observed 404; Expected bilingual Astro post with alternateSlug link back to English article; Steps: `curl -I https://xxchan.me/blog/2022-02-09-paxos-hard-zh/`; Status: Open.
- [2025-10-09] https://xxchan.me/tags/: Observed 404 (legacy site lacks consolidated tags page); Expected Astro tags landing page listing taxonomy; Steps: `curl -I https://xxchan.me/tags/`; Status: Open.
- [2025-10-09] https://xxchan.me/rss.xml: Observed 404; Expected Astro-generated RSS feed with `Content-Type: application/rss+xml`; Steps: `curl -I https://xxchan.me/rss.xml`; Status: Open.
- [2025-10-09] https://xxchan.me/index.xml: Observed 404; Expected Atom feed; Steps: `curl -I https://xxchan.me/index.xml`; Status: Open.
- [2025-10-09] https://xxchan.me/posts.json: Observed 404; Expected JSON feed endpoint from Astro build; Steps: `curl -I https://xxchan.me/posts.json`; Status: Open.
- [2025-10-09] https://xxchan.me/ai/2025/09/28/tool-eval.html: Observed 200 legacy post; Expected 308 redirect to `/blog/2025-09-28-tool-eval/`; Steps: `curl -I https://xxchan.me/ai/2025/09/28/tool-eval.html`; Status: Open.
- [2025-10-09] https://xxchan.me/categories/: Observed 200 legacy categories landing; Expected redirect to `/tags/`; Steps: `curl -I https://xxchan.me/categories/`; Status: Open.
- [2025-10-09] https://xxchan.me/cs/2020/09/02/intern-at-meituan.html: Observed 200 legacy post; Expected 308 redirect to `/blog/2020-09-02-intern-at-meituan/`; Steps: `curl -I https://xxchan.me/cs/2020/09/02/intern-at-meituan.html`; Status: Open.
