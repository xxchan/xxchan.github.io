# Repository Guidelines

## Project Structure & Module Organization
The Astro site keeps runtime code in `src/`. Layout wrappers live in `src/layouts`, reusable UI pieces in `src/components`, and page entry points in `src/pages`. Shared logic sits in `src/utils`, while `src/content` stores blog entries as Markdown or MDX collections resolved through `astro:content`. Static assets (favicons, fonts, images) belong in `public/`. Automation scripts such as `scripts/migrate-posts.ts` run with `tsx`, and cross-route checks live alongside other integration tests under `tests/`.

## Build, Test, and Development Commands
Use `npm run dev` for a hot-reload server at `http://localhost:4321`. `npm run build` produces the static bundle in `dist/`, and `npm run preview` serves that output for smoke testing. Run `npm run check` before committing to execute `astro check` and TypeScript diagnostics. Content migrations or frontmatter fixes can leverage `npm run migrate`, while `npm run test` executes the Vitest suite in CI-friendly mode.

## Coding Style & Naming Conventions
Follow the existing 2-space indentation and prefer single quotes in TypeScript. Components and layouts are PascalCase (for example `PostList.astro`), hooks and utilities use camelCase, and file names within `src/pages` should mirror their routes. Treat TypeScript as strict: avoid `any`, annotate data-derived objects, and reuse shared types from `env.d.ts` or collection schemas. Run `npm run check` after edits; it will fail on type drift or schema mismatches.

## Testing Guidelines
Vitest powers the test harness; store new cases beside related features in `tests/` using the `*.test.ts` suffix. Mirror the `redirects.test.ts` pattern: group assertions with `describe`, prefer precise expectations, and mock network boundaries where needed. Run `npm run test` locally before pushing. While no hard coverage gate exists, extend existing suites whenever routes, collections, or script outputs change.

## Commit & Pull Request Guidelines
History favors concise imperative commits such as `add tool-cmp` or `improve format`; keep messages under 60 characters and focus on the observable change. For pull requests, include a short summary, testing notes (`npm run check`, `npm run test`), and links to related issues. Screenshots or before/after snippets are expected when you touch layout, styling, or generated content. Request review once CI passes and migrations (if any) have been documented.
