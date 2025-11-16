# Repository Guidelines

## Project Structure & Module Organization
The Astro site keeps runtime code in `src/`. Layout wrappers live in `src/layouts`, reusable UI pieces in `src/components`, and page entry points in `src/pages`. Shared logic sits in `src/utils`, while `src/content` stores blog entries as Markdown or MDX collections resolved through `astro:content`. Static assets (favicons, fonts, images) belong in `public/`. Automation scripts such as `scripts/migrate-posts.ts` run with `tsx`, and cross-route checks live alongside other integration tests under `tests/`.

## Build, Test, and Development Commands
Run `pnpm check` after edits

Use `pnpm dev` for a hot-reload server at `http://localhost:4321`. `pnpm build` produces the static bundle in `dist/`, and `pnpm preview` serves that output for smoke testing. Run `pnpm check` before committing to execute `astro check` and TypeScript diagnostics. Content migrations or frontmatter fixes can leverage `pnpm run migrate`, while `pnpm test` executes the Vitest suite in CI-friendly mode.
IMPORTANT guidelines:

- you should start the app in the background, and check its logs: `pnpm dev > /tmp/astro-dev.log 2>&1 & echo $!`

### Verifying Changes

After making changes, it's CRITICAL to verify that the changes are working as expected. Reading code alone is usually not enough.
Whenever possible, you should prefer real verification first, and code analysis second.

So you can start the app locally with `pnpm dev`, and either use `curl`,
chrome devtools MCP, or other kind of scripts to test the changes.



## Testing Guidelines
Vitest powers the test harness; store new cases beside related features in `tests/` using the `*.test.ts` suffix. Mirror the `redirects.test.ts` pattern: group assertions with `describe`, prefer precise expectations, and mock network boundaries where needed. Run `pnpm test` locally before pushing. While no hard coverage gate exists, extend existing suites whenever routes, collections, or script outputs change.

## LLM Summary Workflow

- Convert the post to `.mdx` before inserting JSX components.
- After the frontmatter block, make sure there is `import LlmSummary from '@components/LlmSummary.astro';` (only once).
- Replace any existing `<LlmSummary>` block with a new one, or insert a fresh block right after the import section. Use:

```
<LlmSummary generatedAt="<ISO datetime>">

summary content

</LlmSummary>
```

Requirements for generating summary:
- 模仿原文作者的文风
- 术语使用遵循原文，不要随意修改
- 不需要覆盖全部内容，而是提炼出文章中最有意思、最有 insight 的点
