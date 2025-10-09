import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import remarkToc from 'remark-toc';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';

export default defineConfig({
  site: 'https://xxchan.me',
  base: '/',
  trailingSlash: 'ignore',
  output: 'static',
  redirects: buildLegacyRedirects(),
  integrations: [mdx(), react(), sitemap()],
  markdown: {
    remarkPlugins: [remarkMath, [remarkToc, { tight: true }]],
    rehypePlugins: [rehypeSlug, rehypeKatex],
    shikiConfig: {
      theme: 'github-light',
    },
  },
});

function buildLegacyRedirects() {
  const blogDir = fileURLToPath(new URL('./src/content/blog', import.meta.url));
  const redirects = {};

  for (const entry of fs.readdirSync(blogDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const match = entry.name.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/);
    if (!match) continue;

    const [, year, month, day, legacySlug] = match;
    const indexPath = path.join(blogDir, entry.name, 'index.md');

    if (!fs.existsSync(indexPath)) continue;

    const source = fs.readFileSync(indexPath, 'utf-8');
    const { data } = matter(source);
    const categories = Array.isArray(data?.categories) ? data.categories : [];
    const primaryCategory = categories.find((value) => typeof value === 'string' && value.trim().length > 0);
    const categorySegment = slugifyCategory(primaryCategory);
    const legacyPath = `/${categorySegment}/${year}/${month}/${day}/${legacySlug}.html`;
    const destination = `/blog/${sanitizeEntrySlug(entry.name)}/`;
    redirects[legacyPath] = { destination, status: 308 };
  }

  redirects['/categories/'] = '/tags/';

  return redirects;
}

function slugifyCategory(input) {
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

function sanitizeEntrySlug(slug) {
  return slug.replace(/\./g, '');
}

export { buildLegacyRedirects };
