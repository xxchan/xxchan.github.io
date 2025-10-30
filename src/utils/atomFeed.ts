import type { APIContext } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { SITE_AUTHOR, SITE_DESCRIPTION, SITE_FEED_TITLE, SITE_SUBTITLE, SITE_TITLE, SITE_URL } from '../consts';

type BlogEntry = CollectionEntry<'blog'>;

const ATOM_NAMESPACE = 'http://www.w3.org/2005/Atom';
const GENERATOR_URI = 'https://astro.build/';
const GENERATOR_VERSION = '5.14.1';
const GENERATOR_NAME = 'Astro';
const MAX_FEED_ENTRIES = 10;

function sortPostsByDate(posts: BlogEntry[]): BlogEntry[] {
  return [...posts].sort((first, second) => second.data.pubDate.getTime() - first.data.pubDate.getTime());
}

function toAbsoluteUrl(path: string, site: URL): string {
  return new URL(path, site).toString();
}

function escapeXml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function wrapInCdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

function buildSummary(post: BlogEntry): string | null {
  const summarySource =
    post.data.description ??
    post.data.excerpt ??
    getFirstParagraphText(post.rendered?.html) ??
    post.data.title ??
    null;

  if (!summarySource) {
    return null;
  }

  return wrapInCdata(summarySource);
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

function getFirstParagraphText(html: string | undefined): string | null {
  if (!html) {
    return null;
  }

  const match = html.match(/<p>([\s\S]*?)<\/p>/i);
  if (!match) {
    return null;
  }

  const text = stripHtml(match[1]).trim();
  return text.length > 0 ? text : null;
}

function collectCategories(post: BlogEntry): string {
  const categoryValues = [...new Set([...post.data.categories, ...post.data.tags])];
  if (categoryValues.length === 0) {
    return '';
  }

  return categoryValues
    .map((category) => `<category term="${escapeXml(category)}" />`)
    .join('');
}

function formatRfc3339(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, '+00:00');
}

function getLatestUpdatedDate(posts: BlogEntry[]): Date | null {
  if (posts.length === 0) {
    return null;
  }

  const [latest] = posts;
  return latest.data.updatedDate ?? latest.data.pubDate;
}

function getPostUpdatedDate(post: BlogEntry): Date {
  return post.data.updatedDate ?? post.data.pubDate;
}

function getSiteUrl(context: APIContext): URL {
  if (context.site) {
    return context.site;
  }
  return new URL(SITE_URL);
}

function normalizeCategorySegment(input: string | undefined): string {
  if (!input) {
    return 'blog';
  }

  const slug = input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug.length > 0 ? slug : 'blog';
}

function getRawEntrySlug(post: BlogEntry): string | null {
  const entryId = 'id' in post ? String(post.id) : '';
  const normalizedId = entryId.replace(/\\/g, '/');
  const directoryMatch = normalizedId.match(/([^/]+)\/index\.(md|mdx)$/i);
  if (directoryMatch) {
    return directoryMatch[1];
  }

  const fileMatch = normalizedId.match(/([^/]+)\.(md|mdx)$/i);
  if (fileMatch) {
    return fileMatch[1];
  }

  return null;
}

export function getLegacyEntryPath(post: BlogEntry): string | null {
  const rawSlug = getRawEntrySlug(post);
  if (!rawSlug) {
    return null;
  }

  const match = rawSlug.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/);
  if (!match) {
    return null;
  }

  const [, year, month, day, legacySlug] = match;
  const primaryCategory = post.data.categories.find((category) => category.trim().length > 0);
  const categorySegment = normalizeCategorySegment(primaryCategory);
  return `/${categorySegment}/${year}/${month}/${day}/${legacySlug}.html`;
}

function buildLegacyEntryMetadata(post: BlogEntry, site: URL): { link: string; id: string } {
  const legacyPath = getLegacyEntryPath(post);
  if (!legacyPath) {
    const fallbackUrl = toAbsoluteUrl(`/blog/${post.slug}/`, site);
    return {
      link: fallbackUrl,
      id: fallbackUrl.replace(/\/$/, ''),
    };
  }

  const legacyLink = toAbsoluteUrl(legacyPath, site);
  return {
    link: legacyLink,
    id: legacyLink.replace(/\.html$/, ''),
  };
}

export async function generateBlogFeed(context: APIContext): Promise<Response> {
  const siteUrl = getSiteUrl(context);
  const selfHref = context.url ? new URL(context.url.pathname, siteUrl).toString() : toAbsoluteUrl('/feed.xml', siteUrl);

  const posts = await getCollection('blog');
  const sortedPosts = sortPostsByDate(posts);
  const limitedPosts = sortedPosts.slice(0, MAX_FEED_ENTRIES);

  const now = new Date();
  const latestUpdated = getLatestUpdatedDate(limitedPosts);
  const feedUpdatedDate = latestUpdated ?? now;
  const updatedTag = `<updated>${formatRfc3339(feedUpdatedDate)}</updated>`;

  const entries = limitedPosts
    .map((post) => {
      const entryUrl = toAbsoluteUrl(`/blog/${post.slug}/`, siteUrl);
      const { link: legacyLink, id: legacyId } = buildLegacyEntryMetadata(post, siteUrl);
      const published = formatRfc3339(post.data.pubDate);
      const updated = formatRfc3339(getPostUpdatedDate(post));
      const summary = buildSummary(post);
      const summaryTag = summary ? `<summary type="html">${summary}</summary>` : '';
      const contentHtml = post.rendered?.html ?? '';
      const contentTag = contentHtml
        ? `<content type="html" xml:base="${escapeXml(entryUrl)}">${wrapInCdata(contentHtml)}</content>`
        : '';
      const categories = collectCategories(post);

      return [
        '<entry>',
        `<title type="html">${escapeXml(post.data.title)}</title>`,
        `<link href="${escapeXml(legacyLink)}" rel="alternate" type="text/html" title="${escapeXml(post.data.title)}" />`,
        `<id>${escapeXml(legacyId)}</id>`,
        `<published>${published}</published>`,
        `<updated>${updated}</updated>`,
        `<author><name>${escapeXml(SITE_AUTHOR)}</name></author>`,
        summaryTag,
        contentTag,
        categories,
        '</entry>',
      ]
        .filter(Boolean)
        .join('');
    })
    .join('');

  const feedTitle = SITE_FEED_TITLE ?? SITE_TITLE;
  const subtitle = SITE_SUBTITLE ?? SITE_DESCRIPTION;
  const siteHref = siteUrl.toString();

  const feedXml = [
    '<?xml version="1.0" encoding="utf-8"?>',
    `<feed xmlns="${ATOM_NAMESPACE}">`,
    `<generator uri="${GENERATOR_URI}" version="${GENERATOR_VERSION}">${escapeXml(GENERATOR_NAME)}</generator>`,
    `<link href="${escapeXml(selfHref)}" rel="self" type="application/atom+xml" />`,
    `<link href="${escapeXml(siteHref)}" rel="alternate" type="text/html" />`,
    updatedTag,
    `<id>${escapeXml(selfHref)}</id>`,
    `<title type="html">${escapeXml(feedTitle)}</title>`,
    `<subtitle>${escapeXml(subtitle)}</subtitle>`,
    `<author><name>${escapeXml(SITE_AUTHOR)}</name></author>`,
    entries,
    '</feed>',
  ]
    .filter(Boolean)
    .join('');

  return new Response(feedXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
