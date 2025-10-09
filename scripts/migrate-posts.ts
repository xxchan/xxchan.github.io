import { promises as fs } from 'node:fs';
import { dirname, join, parse, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import YAML from 'yaml';

interface JekyllFrontmatter {
  readonly title?: string;
  readonly excerpt?: string;
  readonly description?: string;
  readonly date?: string | Date;
  readonly categories?: string | string[];
  readonly tags?: string | string[];
  readonly toc?: boolean | string;
  readonly toc_sticky?: boolean | string;
  readonly toc_label?: string;
  readonly lang?: string;
  readonly last_modified_at?: string | Date;
  readonly updated?: string | Date;
}

interface BlogFrontmatter {
  readonly title: string;
  readonly description?: string;
  readonly excerpt?: string;
  readonly pubDate: string;
  readonly updatedDate?: string;
  readonly categories: readonly string[];
  readonly tags: readonly string[];
  readonly toc?: boolean;
  readonly tocLabel?: string;
  readonly tocSticky?: boolean;
  readonly lang?: string;
  readonly alternateSlug?: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);
const legacyPostsDir = join(projectRoot, '_posts');
const contentBlogDir = join(projectRoot, 'src', 'content', 'blog');

function asArray(value: string | string[] | undefined): string[] {
  if (!value) {
    return [];
  }
  return Array.isArray(value)
    ? value.map((item) => `${item}`.trim()).filter(Boolean)
    : [`${value}`.trim()].filter(Boolean);
}

function coerceBoolean(value: boolean | string | undefined): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }
    if (normalized === 'false') {
      return false;
    }
  }
  return undefined;
}

function parseDate(value: string | Date | undefined, fallback: Date, fileName: string): Date {
  if (!value) {
    return fallback;
  }
  if (value instanceof Date) {
    return value;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Unable to parse date '${value}' in ${fileName}`);
  }
  return parsed;
}

function deriveDateFromSlug(slug: string, fileName: string): Date {
  const segments = slug.split('-');
  if (segments.length < 4) {
    throw new Error(`Unexpected slug format '${slug}' in ${fileName}`);
  }
  const [year, month, day] = segments;
  const candidate = new Date(`${year}-${month}-${day}T00:00:00Z`);
  if (Number.isNaN(candidate.getTime())) {
    throw new Error(`Unable to derive date from slug '${slug}' for ${fileName}`);
  }
  return candidate;
}

function transformContent(content: string, slug: string): { body: string; possibleAlternateSlug?: string } {
  let candidateAlternate: string | undefined;
  const body = content.replace(/\{\%\s*post_url\s+([\w\-]+)\s*\%\}/g, (_, targetSlug: string) => {
    const normalizedTarget = targetSlug.trim();
    if (!candidateAlternate && isLikelyAlternate(slug, normalizedTarget)) {
      candidateAlternate = normalizedTarget;
    }
    return `/blog/${normalizedTarget}/`;
  });
  return { body: body.trim(), possibleAlternateSlug: candidateAlternate };
}

function isLikelyAlternate(sourceSlug: string, targetSlug: string): boolean {
  const localeSuffix = /\-(?<locale>en|zh)$/;
  const sourceMatch = localeSuffix.exec(sourceSlug);
  const targetMatch = localeSuffix.exec(targetSlug);
  if (!sourceMatch?.groups || !targetMatch?.groups) {
    return false;
  }
  const sourceStem = sourceSlug.replace(localeSuffix, '');
  const targetStem = targetSlug.replace(localeSuffix, '');
  return sourceStem === targetStem && sourceMatch.groups.locale !== targetMatch.groups.locale;
}

function detectLang(slug: string, fm: JekyllFrontmatter): string | undefined {
  if (fm.lang) {
    return fm.lang;
  }
  if (slug.endsWith('-en')) {
    return 'en';
  }
  if (slug.endsWith('-zh')) {
    return 'zh';
  }
  return undefined;
}

function toFrontmatter(slug: string, rawFrontmatter: JekyllFrontmatter, alternateSlug?: string): BlogFrontmatter {
  if (!rawFrontmatter.title) {
    throw new Error(`Missing title in ${slug}`);
  }

  const fallbackDate = deriveDateFromSlug(slug, slug);
  const pubDate = parseDate(rawFrontmatter.date, fallbackDate, slug);
  const updatedSource = rawFrontmatter.updated ?? rawFrontmatter.last_modified_at;
  const updatedDate = updatedSource ? parseDate(updatedSource, fallbackDate, slug) : undefined;

  const description = rawFrontmatter.excerpt ?? rawFrontmatter.description;

  const baseFrontmatter: BlogFrontmatter = {
    title: rawFrontmatter.title,
    description: description?.trim() || undefined,
    excerpt: rawFrontmatter.excerpt?.trim() || undefined,
    pubDate: pubDate.toISOString(),
    updatedDate: updatedDate?.toISOString(),
    categories: asArray(rawFrontmatter.categories),
    tags: asArray(rawFrontmatter.tags),
    toc: coerceBoolean(rawFrontmatter.toc),
    tocLabel: rawFrontmatter.toc_label,
    tocSticky: coerceBoolean(rawFrontmatter.toc_sticky),
    lang: detectLang(slug, rawFrontmatter),
    alternateSlug,
  };

  const cleanedFrontmatter = Object.fromEntries(
    Object.entries(baseFrontmatter).filter(([, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== undefined && value !== '';
    }),
  ) as BlogFrontmatter;

  return cleanedFrontmatter;
}

async function writePost(slug: string, frontmatter: BlogFrontmatter, body: string): Promise<void> {
  const targetDir = join(contentBlogDir, slug);
  await fs.mkdir(targetDir, { recursive: true });
  const yamlFrontmatter = YAML.stringify(frontmatter, { indent: 2 });
  const document = `---\n${yamlFrontmatter}---\n\n${body}\n`;
  await fs.writeFile(join(targetDir, 'index.md'), document, 'utf8');
}

async function pathExists(pathname: string): Promise<boolean> {
  try {
    await fs.access(pathname);
    return true;
  } catch {
    return false;
  }
}

async function migrate(): Promise<void> {
  if (!(await pathExists(legacyPostsDir))) {
    console.warn(`Legacy posts directory not found at ${legacyPostsDir}. Nothing to migrate.`);
    return;
  }

  await fs.rm(contentBlogDir, { recursive: true, force: true });
  await fs.mkdir(contentBlogDir, { recursive: true });

  const entries = await fs.readdir(legacyPostsDir, { withFileTypes: true });
  const markdownFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.md')).sort((a, b) => a.name.localeCompare(b.name));

  let migratedCount = 0;
  for (const file of markdownFiles) {
    const sourcePath = join(legacyPostsDir, file.name);
    const raw = await fs.readFile(sourcePath, 'utf8');
    const parsed = matter(raw);
    const slug = parse(file.name).name;
    const { body, possibleAlternateSlug } = transformContent(parsed.content, slug);
    const frontmatter = toFrontmatter(slug, parsed.data as JekyllFrontmatter, possibleAlternateSlug);
    await writePost(slug, frontmatter, body);
    migratedCount += 1;
  }

  console.log(`Migrated ${migratedCount} posts into ${relative(projectRoot, contentBlogDir)}.`);
}

migrate().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
