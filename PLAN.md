# Blog Migration Plan

## Context
- Target host: GitHub Pages.
- Initial scope: migrate existing Jekyll content to Astro static site similar to skyzh-site.
- Interactivity: omit Neon/Vercel reactions for now; leave as TODO for future iteration.

## Phase Overview
1. **Scaffold Astro Project**
   - Initialize Astro in repository, configure project metadata for GitHub Pages.
   - Install integrations needed for Markdown/MDX, RSS, sitemap, math support.
2. **Content Migration** *(current focus)*
   - Define `astro:content` collection schema mirroring Jekyll front matter.
   - Convert `_posts` Markdown into Astro content structure.
   - Preserve tags/categories/TOC flags; note bilingual cross-links.
   - Validate migrated posts with `astro check`.
3. **Layouts & Pages**
   - Port global styles and create base layouts (home, blog listing, post layout, about, categories/tags).
   - Integrate analytics from legacy site.
4. **Feeds & Extras**
   - Implement RSS/Atom feed and sitemap.
   - Stub TODO for reactions/Neon integration.
5. **Verification & Deployment**
   - Run dev server for manual QA.
   - Prepare GitHub Pages deploy workflow.

## Immediate Tasks
- [x] Initialize Astro project scaffold (created in ./astro).
- [x] Configure TypeScript and integrations (astro.config, tsconfig, markdown plugins, content schema).
- [x] Set up content collection schema (`src/content/config.ts`).
- [x] Implement migration script for posts (`scripts/migrate-posts.ts`).
- [x] Run initial validation (`astro check`) – Shiki warned about `Go` language casing; follow up later.
- [x] Create shared layouts/components and global styles.
- [x] Port top-level pages and blog routes.
- [x] Wire up feeds/JSON endpoints and copy static assets.
- [x] Note TODO for reactions and finish GitHub Pages build setup.
- [x] Verify astro build (`npm run build`).
- [x] Add external link reachability check script and run it in the deploy workflow.

## Future TODOs
- [ ] Reactions system (Neon + Vercel) once interactive features are desired.
- [ ] Additional polish (themes, pagination, search).
- [x] Address feedback: move TOC to sidebar for sticky mode and add redirects for legacy blog URLs.
- [x] Merge Categories page into Tags overview (single taxonomy landing page).
