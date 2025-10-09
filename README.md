# xxchan.dev (Astro)

Astro-powered rebuild of xxchan's blog, migrated from the previous Jekyll/minimal-mistakes setup. Posts now live in `src/content/blog` and render through Astro content collections with MDX support, table-of-contents generation, and KaTeX-ready markdown.

## Tech highlights
- **Astro 5** with static output for GitHub Pages, MDX/React integrations, and typed content collections.
- **Remark/Rehype pipeline** for math, automatic heading IDs, and inline table of contents when enabled via frontmatter.
- **Typed migration** script (`pnpm run migrate`) that rehydrates legacy Jekyll posts into Astro collection folders.
- **Feeds & endpoints**: `/rss.xml`, `/index.xml`, and `/posts.json` expose the content for automation or future integrations.
- **Global styling** inspired by the prior site but simplified to plain CSS.

## Commands

```bash
pnpm install      # install dependencies
pnpm dev          # start local dev server (http://localhost:4321)
pnpm build        # generate static site into dist/
pnpm preview      # preview the production build locally
pnpm check        # run astro check (type & content validation)
pnpm run migrate  # regen content collection from legacy _posts markdown
pnpm test         # execute the Vitest suite
```

## Content migration notes
- Legacy `_posts/*.md` files were migrated to `src/content/blog/<slug>/index.md` with zod-validated frontmatter.
- The original `_posts` directory has been removed from the repo; `pnpm run migrate` now no-ops unless you restore those legacy markdown files alongside the project root.
- Categories, tags, TOC flags, and bilingual cross-links survive via `alternateSlug`.
- Any `{% post_url %}` liquid links were converted to `/blog/<slug>/` paths.
- Code fences labelled `Go` should eventually be lowercased to satisfy Shiki (see `Plan.md`).

## Deployment
- GitHub Actions workflow (`.github/workflows/deploy.yml`) builds the site on pushes to `master` or `main` and publishes to GitHub Pages via `actions/deploy-pages`.
- `astro.config.mjs` sets `site` to `https://xxchan.github.io` and `trailingSlash: 'always'` for stable permalink structure.

## TODO
- Reactions/emoji counter is deliberately deferred; see the inline TODO in `src/layouts/BlogPost.astro` and `PLAN.md` for future Neon + Vercel integration.
- Consider addressing Shiki warnings for code fences labelled `Go`.
- Optional polish: analytics, pagination, or search once the core migration is validated.
