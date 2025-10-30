# Multilingual Blog Design Doc

> Owner: Codex  
> Status: Draft  
> Last updated: 2025-05-09

## 1. Background

The current site renders a single-language blog sourced from `src/content/blog`. Frontmatter exposes optional `lang` and `alternateSlug`, and routing lives under `src/pages/blog`. The project roadmap now includes first-class multilingual support so that each article can ship localized bodies, metadata, and URLs while keeping Astro's static generation fast and type-safe.

Recent research (Astro i18n docs, BitDoze localization guide, Noah Falk’s Strapi × Astro tutorial) highlights three consistent themes:

1. Model each language as a distinct content entry tied to a shared key.
2. Let Astro’s native i18n router own locale-prefixed URLs.
3. Keep UI chrome translations separate from Markdown content.

This doc translates those practices into a concrete plan for our codebase.

## 2. Goals

- Serve every published post in multiple languages with localized slugs, metadata, and body content.
- Ensure each language variant is linked so users—and search engines—can hop between them.
- Maintain strict typing for frontmatter and translations; no `any` leakage.
- Preserve SSG performance: every locale should be generated at build time without runtime fetches.
- Provide a repeatable authoring workflow (What fields do writers fill? How do we review translations?).

## 3. Non-goals

- Automated machine translation of content.
- Runtime language negotiation beyond Astro’s built-in detection (manual override comes first).
- Per-locale themes/layout variations; all locales share layouts unless noted by future work.
- Migrating historical content—covered by a follow-up migration script.

## 4. Current State & Pain Points

| Area | Today | Pain |
| --- | --- | --- |
| Content schema | `lang` (optional string) and `alternateSlug` (optional) | No guarantee every post declares a locale; no grouping mechanism to bind related translations; slugs are manually paired per post. |
| Routing | Only `/blog` + `/blog/[slug]`. Links assume English. | We cannot statically generate `/zh/blog/...` etc., nor surface alternate URLs in templates. |
| UI copy | Strings are hard-coded in components/pages. | Duplicating `index.astro` per locale is brittle; we lack a translation layer. |
| SEO | Single canonical URL, no `hreflang`, single-language sitemap. | Search engines treat translations as duplicates; localized discovery suffers. |
| Tooling | No validation that translations exist or stay in sync. | Easy to publish posts missing translations or mismatched metadata. |

## 5. Proposed Solution

### 5.1 Content Modeling

- Introduce a **required** `locale` field typed as a discriminated union (e.g. `z.enum(['en', 'zh'])`).
- Add a **required** `translationKey` (string UUID/slug) shared across localized variants.
- Optional flags: `translationStatus` (`'draft' | 'review' | 'ready'`) and `translator`. These help editorial workflow without affecting rendering.
- Keep `alternateSlug` but mark it required when `locale !== defaultLocale`. Slug uniqueness stays per locale.
- Derived types:
  ```ts
  type Locale = 'en' | 'zh';
  interface BlogFrontmatter {
    locale: Locale;
    translationKey: string;
    alternateSlug?: string;
    // existing fields...
  }
  ```
- Directory layout remains `src/content/blog/<locale>/<slug>.md[x]` to make language explicit and future locale expansion predictable.

### 5.2 Routing Strategy

- Enable Astro’s i18n router in `astro.config.mjs`:
  ```ts
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    routing: { prefixDefaultLocale: false, fallbackType: 'rewrite' },
  }
  ```
- Restructure `src/pages` to match locale-aware URL patterns:
  - `src/pages/[...locale]/blog/[...slug].astro` (or nested folders) that read `Astro.currentLocale`.
  - Use `getCollection` filtered by `locale` to generate `getStaticPaths`.
  - Keep default (English) routes at root; localized routes under `/[locale]/`.
- Helper utilities in `src/utils/i18n.ts` to compute localized URLs: `getPostByTranslationKey(locale, key)`, `buildAlternateLinks(post)`, `getRelativeLocaleUrl(locale, path)`.

### 5.3 UI Translation Layer

- Create `src/i18n/en.ts`, `src/i18n/zh.ts`, etc., exporting typed dictionaries. Example:
  ```ts
  const navigation = {
    blog: 'Blog',
    categories: 'Categories',
  } satisfies NavigationDictionary;
  ```
- Provide a `useTranslations(locale)` helper returning a proxy with compile-time key completion (`as const` objects + `TranslationKey` union).
- Layouts/pages consume translations instead of hard-coded strings. Component boundaries remain minimal: we only hydrate interactive pieces, passing locale through props/context.

### 5.4 Language Switcher & Content Linking

- For each rendered post, query all entries sharing `translationKey` and derive a map `{ locale: slug }`.
- Render a language switcher in `src/components/LanguageSwitcher.astro` that links to available locales. Hide unavailable locales (no defensive placeholders).
- Persist the locale in URL (primary) and optionally in cookie/localStorage for future enhancements.

### 5.5 SEO & Metadata

- In layouts, emit `<link rel="alternate" hreflang="...">` for every language variant using the translation map.
- Update `rss.xml.ts`, `feed.xml.ts`, `posts.json.ts`, and sitemap generation to include localized URLs.
- Extend Open Graph/Twitter metadata with locale-aware values (title/description from frontmatter).
- Ensure canonical URLs point to the locale-specific page.

### 5.6 Editorial Workflow & Tooling

- Document author steps in `docs/content-workflow.md` (follow-up):
  1. Create base article (`locale: 'en'`, `translationKey: 'post-id'`).
  2. Translator copies frontmatter, switches `locale`, updates slug & content.
  3. Use `pnpm run lint:i18n` to confirm coverage.
- Build a `scripts/check-translations.ts` to assert:
  - Every `translationKey` has entries for required locales.
  - `pubDate` and `updatedDate` stay synchronized across locales (warn if drift).
  - Slugs are unique per locale.

## 6. Implementation Plan

1. **Schema groundwork**
   - Update `src/content/config.ts`.
   - Create migration script to add `translationKey`/`locale` to existing content.
   - Update type exports consumed across pages.
2. **Routing refactor**
   - Toggle Astro i18n config.
   - Refactor blog index/detail pages into locale-aware routes.
   - Adjust category/tag pages to filter by `locale`.
3. **UI translation layer**
   - Introduce `src/i18n/` dictionaries + helpers.
   - Refactor layout/header/footer to use translations.
   - Implement language switcher component.
4. **SEO + feeds**
   - Update layout metadata, sitemap, RSS/JSON feeds.
   - Add Alternate/Hreflang tests.
5. **Tooling & docs**
   - Add `scripts/check-translations.ts`.
   - Write contributor instructions.
   - Land Vitest coverage for helpers (e.g. translation map, slug resolution).

Each step ships behind feature branches; we can launch locales incrementally (start with `'zh'` alongside `'en'`).

## 7. Open Questions

- **Locale list**: Do we scope v1 to `'en'` + `'zh'`, or include others (e.g. `'ja'`, `'es'`)? Affect schema enums and QA breadth.
- **Draft handling**: Should untranslated locales block publishing, or can we publish partial sets with fallback to default locale?
- **Authoring tooling**: Are translators comfortable editing MDX in Git, or do we need integration with a CMS / translation platform?
- **URL permanence**: If localized slugs change, do we add redirect management per locale?
- **Analytics**: Do we require per-locale GA properties or a combined view with locale dimension?

## 8. Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| Missing translations break navigation | Validator script in CI + manual language switcher hiding unavailable locales |
| Schema migration fatigue | Provide codemod script + PR template reminder |
| Astro i18n config regressions | Keep routing refactor gated, add integration tests in `tests/redirects.test.ts` for each locale |
| SEO misconfiguration | Use Lighthouse + `pnpm test` snapshot to verify `hreflang`/`canonical` tags |

## 9. Verification Strategy

- `pnpm check` and `pnpm test` with new locale fixtures.
- Integration tests hitting `/blog` and `/zh/blog` ensure the correct language payloads, alternate links, and navigation entries.
- Manual QA checklist:
  - Switch languages on blog index & detail pages.
  - Inspect head tags for `hreflang`, locale-specific titles/descriptions.
  - Confirm sitemap lists localized URLs.
- Lighthouse run per locale to confirm SEO/accessibility metrics.

Once these steps pass and open questions resolve, we can proceed to implementation PRs.

