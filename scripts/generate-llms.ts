import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '../src/consts';

type PostFrontmatter = {
  title?: string;
  description?: string;
  excerpt?: string;
  pubDate?: string | Date;
  updatedDate?: string | Date;
  categories?: unknown;
  tags?: unknown;
  lang?: unknown;
  locale?: unknown;
};

type PostRecord = {
  slug: string;
  title: string;
  summary?: string;
  categories: string[];
  tags: string[];
  published?: Date;
  updated?: Date;
  language?: string;
  rawSource: string;
};

type CliOptions = {
  blogOutputRoot: string;
  llmsOutputPath: string;
};

const DEFAULT_BLOG_OUTPUT = 'public/blog';
const DEFAULT_LLMS_OUTPUT = 'public/llms.txt';

function parseCliOptions(projectRoot: string): CliOptions {
  const args = process.argv.slice(2);
  let blogOutputArg: string | undefined;
  let llmsOutputArg: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (token === '--out') {
      blogOutputArg = args[index + 1];
      index += 1;
      continue;
    }
    if (token === '--llms-out') {
      llmsOutputArg = args[index + 1];
      index += 1;
    }
  }

  const blogOutputRoot = path.isAbsolute(blogOutputArg ?? DEFAULT_BLOG_OUTPUT)
    ? (blogOutputArg ?? DEFAULT_BLOG_OUTPUT)
    : path.join(projectRoot, blogOutputArg ?? DEFAULT_BLOG_OUTPUT);

  const llmsOutputPath = path.isAbsolute(llmsOutputArg ?? DEFAULT_LLMS_OUTPUT)
    ? (llmsOutputArg ?? DEFAULT_LLMS_OUTPUT)
    : path.join(projectRoot, llmsOutputArg ?? DEFAULT_LLMS_OUTPUT);

  return { blogOutputRoot, llmsOutputPath };
}

function coerceStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter((entry) => entry.length > 0);
}

function coerceDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value as string | number);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function stripMarkdown(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[*_~]/g, '')
    .replace(/^>\s?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractParagraphs(body: string): string[] {
  return body
    .split(/\r?\n{2,}/)
    .map((paragraph) => paragraph.replace(/\r?\n/g, ' ').trim())
    .filter((paragraph) => paragraph.length > 0);
}

function extractFirstParagraph(body: string): string | undefined {
  const paragraphs = extractParagraphs(body);
  if (paragraphs.length === 0) return undefined;
  const normalized = stripMarkdown(paragraphs[0]);
  return normalized.length > 0 ? normalized : undefined;
}

function inferSummary(frontmatter: PostFrontmatter, body: string): string | undefined {
  const summaryCandidate = [frontmatter.description, frontmatter.excerpt].find(
    (entry): entry is string => typeof entry === 'string' && entry.trim().length > 0,
  );
  if (summaryCandidate) return stripMarkdown(summaryCandidate);

  const firstParagraph = extractFirstParagraph(body);
  if (!firstParagraph) return undefined;

  if (firstParagraph.length <= 200) return firstParagraph;
  return `${firstParagraph.slice(0, 197)}...`;
}

function formatMarkdown(frontmatter: PostFrontmatter, body: string, slug: string): string {
  return body; // placeholder; function no longer used
}

function resolveLanguage(frontmatter: PostFrontmatter): string | undefined {
  const lang = typeof frontmatter.lang === 'string' ? frontmatter.lang.trim() : undefined;
  if (lang && lang.length > 0) {
    return lang.toLowerCase();
  }

  const locale = typeof frontmatter.locale === 'string' ? frontmatter.locale.trim() : undefined;
  if (locale && locale.length > 0) {
    return locale.toLowerCase();
  }

  return undefined;
}

function buildPostRecords(sourceDir: string, entries: fs.Dirent[]): Promise<PostRecord>[] {
  return entries
    .filter((entry) => entry.isDirectory())
    .map(async (entry) => {
      const inputPath = path.join(sourceDir, entry.name, 'index.md');
      try {
        const source = await fs.readFile(inputPath, 'utf-8');
        const { data, content } = matter(source);
        const frontmatter = data as PostFrontmatter;
        return {
          slug: entry.name,
          title: typeof frontmatter.title === 'string' ? frontmatter.title : entry.name,
          summary: inferSummary(frontmatter, content),
          categories: coerceStringArray(frontmatter.categories),
          tags: coerceStringArray(frontmatter.tags),
          published: coerceDate(frontmatter.pubDate),
          updated: coerceDate(frontmatter.updatedDate),
          language: resolveLanguage(frontmatter),
          rawSource: source,
        };
      } catch (error) {
        console.warn(`Failed to process ${entry.name}:`, error);
        return undefined;
      }
    });
}

function resolvePostPath(post: PostRecord): string {
  if (post.language && post.language !== 'en') {
    return `/${post.language}/blog/${post.slug}.md`;
  }
  return `/blog/${post.slug}.md`;
}

async function writeBlogMarkdown(posts: PostRecord[], outputRoot: string) {
  const resolvedOutputRoot = path.resolve(outputRoot);
  const publicRoot = path.dirname(resolvedOutputRoot);

  const localizedRoots = new Set(
    posts
      .map((post) => post.language)
      .filter((lang): lang is string => Boolean(lang) && lang !== 'en')
      .map((lang) => path.join(publicRoot, lang, 'blog')),
  );

  await fs.rm(resolvedOutputRoot, { recursive: true, force: true });
  await Promise.all(Array.from(localizedRoots).map((dir) => fs.rm(dir, { recursive: true, force: true })));

  await fs.mkdir(resolvedOutputRoot, { recursive: true });
  await Promise.all(
    posts.map(async (post) => {
      const content = `\uFEFF${post.rawSource}`;
      await fs.writeFile(path.join(resolvedOutputRoot, `${post.slug}.md`), content, 'utf-8');

      if (post.language && post.language !== 'en') {
        const localizedDir = path.join(publicRoot, post.language, 'blog');
        await fs.mkdir(localizedDir, { recursive: true });
        await fs.writeFile(path.join(localizedDir, `${post.slug}.md`), content, 'utf-8');
      }
    }),
  );
}

function formatPostLink(post: PostRecord): string {
  const url = new URL(resolvePostPath(post), SITE_URL).toString();
  const details: string[] = [];
  if (post.published) {
    details.push(post.published.toISOString().slice(0, 10));
  }
  if (post.language) {
    details.push(post.language);
  }
  const suffixParts: string[] = [];
  if (details.length > 0) {
    suffixParts.push(details.join(' · '));
  }
  if (post.summary) {
    suffixParts.push(post.summary);
  }
  return suffixParts.length > 0 ? `- [${post.title}](${url}) — ${suffixParts.join(' — ')}` : `- [${post.title}](${url})`;
}

function formatCategoriesSection(posts: PostRecord[]): string[] {
  const categories = new Map<string, PostRecord[]>();
  posts.forEach((post) => {
    if (post.categories.length === 0) {
      categories.set('Uncategorized', [...(categories.get('Uncategorized') ?? []), post]);
    } else {
      post.categories.forEach((category) => {
        categories.set(category, [...(categories.get(category) ?? []), post]);
      });
    }
  });

  if (categories.size === 0) {
    return [];
  }

  const lines: string[] = ['## Categories'];

  Array.from(categories.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([category, categoryPosts]) => {
      const linkList = categoryPosts
        .sort((a, b) => {
          const timeA = a.published?.getTime() ?? 0;
          const timeB = b.published?.getTime() ?? 0;
          return timeB - timeA;
        })
        .slice(0, 6)
        .map((entry) => `[${entry.title}](${new URL(resolvePostPath(entry), SITE_URL).toString()})`)
        .join(', ');
      lines.push(`- **${category}**: ${linkList}`);
    });

  lines.push('');
  return lines;
}

function formatLlmsTxt(posts: PostRecord[]): string {
  const sortedByDate = [...posts].sort((a, b) => {
    const timeA = a.published?.getTime() ?? 0;
    const timeB = b.published?.getTime() ?? 0;
    return timeB - timeA;
  });

  const lines: string[] = [];
  lines.push(`# ${SITE_TITLE}`);
  lines.push(`> ${SITE_DESCRIPTION}`);
  lines.push('');
  lines.push(`Sitemap: ${new URL('/sitemap-index.xml', SITE_URL).toString()}`);
  lines.push(`Contact: ${new URL('/about/', SITE_URL).toString()}`);
  lines.push('');
  lines.push('## Navigation');
  lines.push(`- [Home](${SITE_URL}/)`);
  lines.push(`- [Blog archive](${SITE_URL}/blog/)`);
  lines.push(`- [Topics directory](${SITE_URL}/tags/)`);
  lines.push(`- [About](${SITE_URL}/about/)`);
  lines.push('');

  lines.push('## Latest Posts');
  sortedByDate.slice(0, Math.min(sortedByDate.length, 10)).forEach((post) => {
    lines.push(formatPostLink(post));
  });
  lines.push('');

  lines.push(...formatCategoriesSection(posts));

  lines.push('## Feeds');
  lines.push(`- [Atom feed](${new URL('/feed.xml', SITE_URL).toString()})`);
  lines.push(`- [RSS feed](${new URL('/rss.xml', SITE_URL).toString()})`);
  lines.push('');

  lines.push('## Usage Guidelines');
  lines.push('- Attribute quotes or summaries to “xxchan” and link back to the source URL.');
  lines.push('- Prefer citing the canonical Chinese or English version that matches your output language.');
  lines.push('- For high-volume training or commercial reuse, reach out through the contact page first.');
  lines.push('');

  return lines.join('\n');
}

async function writeLlmsTxt(posts: PostRecord[], llmsOutputPath: string) {
  const content = `\uFEFF${formatLlmsTxt(posts)}`;
  await fs.mkdir(path.dirname(llmsOutputPath), { recursive: true });
  await fs.writeFile(llmsOutputPath, content, 'utf-8');
}

async function main() {
  const projectRoot = fileURLToPath(new URL('..', import.meta.url));
  const blogDir = path.join(projectRoot, 'src', 'content', 'blog');
  const { blogOutputRoot, llmsOutputPath } = parseCliOptions(projectRoot);

  const entries = await fs.readdir(blogDir, { withFileTypes: true });
  const posts = (await Promise.all(buildPostRecords(blogDir, entries))).filter(
    (record): record is PostRecord => record !== undefined,
  );

  if (posts.length === 0) {
    console.warn('No blog posts found; skipping llms asset generation.');
    return;
  }

  await writeBlogMarkdown(posts, blogOutputRoot);
  await writeLlmsTxt(posts, llmsOutputPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
