# Repository Guidelines

## Project Structure & Module Organization
The Astro site keeps runtime code in `src/`. Layout wrappers live in `src/layouts`, reusable UI pieces in `src/components`, and page entry points in `src/pages`. Shared logic sits in `src/utils`, while `src/content` stores blog entries as Markdown or MDX collections resolved through `astro:content`. Static assets (favicons, fonts, images) belong in `public/`. Automation scripts such as `scripts/migrate-posts.ts` run with `tsx`, and cross-route checks live alongside other integration tests under `tests/`.

## Build, Test, and Development Commands
Use `pnpm dev` for a hot-reload server at `http://localhost:4321`. `pnpm build` produces the static bundle in `dist/`, and `pnpm preview` serves that output for smoke testing. Run `pnpm check` before committing to execute `astro check` and TypeScript diagnostics. Content migrations or frontmatter fixes can leverage `pnpm run migrate`, while `pnpm test` executes the Vitest suite in CI-friendly mode.

## Coding Style & Naming Conventions
Follow the existing 2-space indentation and prefer single quotes in TypeScript. Components and layouts are PascalCase (for example `PostList.astro`), hooks and utilities use camelCase, and file names within `src/pages` should mirror their routes. Treat TypeScript as strict: avoid `any`, annotate data-derived objects, and reuse shared types from `env.d.ts` or collection schemas. Run `pnpm check` after edits; it will fail on type drift or schema mismatches.

## Testing Guidelines
Vitest powers the test harness; store new cases beside related features in `tests/` using the `*.test.ts` suffix. Mirror the `redirects.test.ts` pattern: group assertions with `describe`, prefer precise expectations, and mock network boundaries where needed. Run `pnpm test` locally before pushing. While no hard coverage gate exists, extend existing suites whenever routes, collections, or script outputs change.

### Verifying Changes

After making changes, it's CRITICAL to verify that the changes are working as expected. Reading code alone is usually not enough.
Whenever possible, you should prefer real verification first, and code analysis second.

So you can start the app locally with `pnpm dev`, and either use `curl`,
chrome devtools MCP, or other kind of scripts to test the changes.

IMPORTANT guidelines:

- you should start the app in the background, and check its logs: `pnpm dev > /tmp/astro-dev.log 2>&1 & echo $!`
