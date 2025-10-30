import type { CollectionEntry } from 'astro:content';
import type { SupportedLocale } from '../content/config';

export const SUPPORTED_LOCALES = ['en', 'zh'] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_LABEL: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
};

export function assertLocale(input: SupportedLocale | string): Locale {
  if (SUPPORTED_LOCALES.includes(input as Locale)) {
    return input as Locale;
  }
  throw new Error(`Unsupported locale '${input}'`);
}

export function buildLocalizedPath(pathname: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) {
    return pathname;
  }
  if (!pathname.startsWith('/')) {
    throw new Error(`Expected absolute pathname, received '${pathname}'`);
  }
  return `/${locale}${pathname}`;
}

export function buildPostUrlFromSlug(slug: string, locale: Locale): string {
  const normalizedSlug = slug.endsWith('/') ? slug : `${slug}/`;
  if (locale === DEFAULT_LOCALE) {
    return `/blog/${normalizedSlug}`;
  }
  return `/${locale}/blog/${normalizedSlug}`;
}

export function buildPostUrl(post: CollectionEntry<'blog'>): string {
  return buildPostUrlFromSlug(post.slug, assertLocale(post.data.locale));
}

export type TranslationLink = {
  readonly locale: Locale;
  readonly label: string;
  readonly url: string;
};

function uniqueLinksByLocale(
  posts: readonly CollectionEntry<'blog'>[],
  currentPost: CollectionEntry<'blog'>,
) {
  const links: TranslationLink[] = [];
  for (const entry of posts) {
    const locale = assertLocale(entry.data.locale);
    links.push({
      locale,
      label: LOCALE_LABEL[locale],
      url: buildPostUrl(entry),
    });
  }

  const uniqueByLocale = new Map<Locale, TranslationLink>();
  for (const link of links) {
    // Prefer the entry coming from the current post to ensure canonical ordering
    if (!uniqueByLocale.has(link.locale) || link.locale === currentPost.data.locale) {
      uniqueByLocale.set(link.locale, link);
    }
  }

  return uniqueByLocale;
}

export function buildTranslationLinks(
  posts: readonly CollectionEntry<'blog'>[],
  currentPost: CollectionEntry<'blog'>,
): TranslationLink[] {
  const uniqueByLocale = uniqueLinksByLocale(posts, currentPost);
  const currentLocale = assertLocale(currentPost.data.locale);

  return SUPPORTED_LOCALES.map((locale) => uniqueByLocale.get(locale))
    .filter((link): link is TranslationLink => Boolean(link))
    .filter((link) => link.locale !== currentLocale);
}

export type AlternateLink = {
  readonly locale: Locale;
  readonly url: string;
};

export function buildAlternateLinks(
  posts: readonly CollectionEntry<'blog'>[],
  currentPost: CollectionEntry<'blog'>,
): AlternateLink[] {
  const uniqueByLocale = uniqueLinksByLocale(posts, currentPost);
  return SUPPORTED_LOCALES.map((locale) => uniqueByLocale.get(locale))
    .filter((link): link is TranslationLink => Boolean(link))
    .map(({ locale, url }) => ({ locale, url }));
}
