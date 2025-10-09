import { execFile } from 'node:child_process';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

interface ParsedOptions {
  readonly root: string;
  readonly concurrency: number;
  readonly timeoutMs: number;
  readonly retries: number;
  readonly site?: string;
  readonly configPath?: string;
}

interface ResolvedOptions extends ParsedOptions {
  readonly internalHosts: ReadonlySet<string>;
  readonly ignoredPatterns: readonly RegExp[];
  readonly redirectPaths: ReadonlySet<string>;
  readonly statusAllowRules: readonly StatusAllowRule[];
}

interface LinkSuccess {
  readonly url: string;
  readonly ok: true;
  readonly status: number;
}

interface LinkFailure {
  readonly url: string;
  readonly ok: false;
  readonly status?: number;
  readonly reason: string;
  readonly retryable?: boolean;
}

type LinkResult = LinkSuccess | LinkFailure;

const DEFAULT_ROOT = 'dist';
const DEFAULT_CONCURRENCY = 8;
const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_RETRIES = 1;
const DEFAULT_CONFIG = 'link-check.config.json';

const FALLBACK_STATUSES = new Set([400, 405, 500, 501]);
const EXTENDED_OK_STATUSES = new Set([401, 403]);

const HEADERS: Record<string, string> = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9',
};

async function main(): Promise<void> {
  const parsedOptions = parseOptions(process.argv.slice(2));
  const options = await resolveOptions(parsedOptions);

  await ensureDirectory(options.root);

  const htmlFiles = await collectHtmlFiles(options.root);
  if (htmlFiles.length === 0) {
    console.log(`No HTML files found under ${relative(process.cwd(), options.root)}`);
    return;
  }

  const linkSources = await collectLinks(htmlFiles);
  const allUrls = [...linkSources.keys()].sort();
  const urls = allUrls.filter((url) => !shouldIgnore(url, options));
  const ignoredCount = allUrls.length - urls.length;

  if (allUrls.length === 0) {
    console.log(`No external links detected in ${htmlFiles.length} HTML files.`);
    return;
  }

  if (ignoredCount > 0) {
    console.log(`Skipping ${ignoredCount} link${ignoredCount === 1 ? '' : 's'} due to ignore rules.`);
  }

  if (urls.length === 0) {
    console.log(`All detected links were ignored by configuration.`);
    return;
  }

  console.log(
    `Checking ${urls.length} external link${urls.length === 1 ? '' : 's'} from ${htmlFiles.length} HTML file${htmlFiles.length === 1 ? '' : 's'}...`,
  );

  const results = await checkAll(urls, options);
  const failures = results.filter((result): result is LinkFailure => !result.ok);

  if (failures.length === 0) {
    console.log(`All links responded successfully.`);
    return;
  }

  console.error(`Detected ${failures.length} unreachable link${failures.length === 1 ? '' : 's'}:`);
  for (const failure of failures) {
    const sources = linkSources.get(failure.url);
    const formattedSources = sources ? [...sources].sort().join(', ') : 'unknown source';
    const statusInfo = typeof failure.status === 'number' ? ` (status ${failure.status})` : '';
    console.error(`- ${failure.url}${statusInfo}`);
    console.error(`  referenced from: ${formattedSources}`);
    console.error(`  reason: ${failure.reason}`);
  }

  process.exitCode = 1;
}

function parseOptions(args: readonly string[]): ParsedOptions {
  let root = DEFAULT_ROOT;
  let concurrency = DEFAULT_CONCURRENCY;
  let timeoutMs = DEFAULT_TIMEOUT_MS;
  let retries = DEFAULT_RETRIES;
  let site: string | undefined;
  let configPath: string | undefined;

  for (const arg of args) {
    if (arg.startsWith('--root=')) {
      root = arg.slice('--root='.length);
    } else if (arg.startsWith('--concurrency=')) {
      concurrency = parsePositiveInteger(arg.slice('--concurrency='.length), 'concurrency');
    } else if (arg.startsWith('--timeout=')) {
      timeoutMs = parsePositiveInteger(arg.slice('--timeout='.length), 'timeout');
    } else if (arg.startsWith('--retries=')) {
      retries = parseNonNegativeInteger(arg.slice('--retries='.length), 'retries');
    } else if (arg.startsWith('--site=')) {
      site = arg.slice('--site='.length);
    } else if (arg.startsWith('--config=')) {
      configPath = arg.slice('--config='.length);
    } else {
      throw new Error(
        `Unknown argument '${arg}'. Supported flags: --root, --concurrency, --timeout, --retries, --site, --config.`,
      );
    }
  }

  return {
    root: resolve(process.cwd(), root),
    concurrency,
    timeoutMs,
    retries,
    site,
    configPath: configPath ? resolve(process.cwd(), configPath) : undefined,
  };
}

async function resolveOptions(parsed: ParsedOptions): Promise<ResolvedOptions> {
  const astroMetadata = await readAstroMetadata();
  const internalHosts = new Set<string>();
  const siteCandidate = parsed.site ?? astroMetadata.site;

  if (siteCandidate) {
    try {
      const hostname = new URL(siteCandidate).hostname;
      if (hostname) {
        internalHosts.add(hostname);
      }
    } catch {
      // ignore invalid site values
    }
  }

  const config = await loadConfig(parsed.configPath);
  const ignoredPatterns = compileIgnorePatterns(config.ignorePatterns);
  const configHosts = parseInternalHosts(config.internalHosts);
  const statusAllowRules = parseAllowedStatuses(config.allowedStatuses);
  for (const host of configHosts) {
    internalHosts.add(host);
  }

  return {
    ...parsed,
    internalHosts,
    ignoredPatterns,
    redirectPaths: astroMetadata.redirectPaths,
    statusAllowRules,
  };
}

interface AstroMetadata {
  readonly site?: string;
  readonly redirectPaths: ReadonlySet<string>;
}

async function readAstroMetadata(): Promise<AstroMetadata> {
  try {
    const module = await import('../astro.config.mjs');
    const config = (module?.default ?? module) as { site?: unknown; redirects?: unknown } | undefined;
    const site =
      config && typeof config.site === 'string' && config.site.trim().length > 0 ? config.site : undefined;
    const redirectPaths = new Set<string>();

    if (config && config.redirects && typeof config.redirects === 'object') {
      for (const key of Object.keys(config.redirects as Record<string, unknown>)) {
        const normalized = normalizePath(key);
        if (normalized.length === 0) {
          continue;
        }
        redirectPaths.add(normalized);
        if (normalized !== '/' && normalized.endsWith('/')) {
          redirectPaths.add(normalized.replace(/\/+$/, ''));
        } else if (!normalized.endsWith('/')) {
          redirectPaths.add(`${normalized}/`);
        }
      }
    }

    return { site, redirectPaths };
  } catch {
    // fall through when config cannot be loaded
  }
  return { site: undefined, redirectPaths: new Set<string>() };
}

interface LinkCheckConfigRaw {
  readonly ignorePatterns?: unknown;
  readonly internalHosts?: unknown;
  readonly allowedStatuses?: unknown;
}

async function loadConfig(explicitPath?: string): Promise<LinkCheckConfigRaw> {
  const targetPath = explicitPath ?? resolve(process.cwd(), DEFAULT_CONFIG);
  try {
    const content = await readFile(targetPath, 'utf8');
    return JSON.parse(content) as LinkCheckConfigRaw;
  } catch (error: unknown) {
    if (isFileNotFound(error)) {
      return {};
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to read config file '${targetPath}': ${message}`);
  }
}

function compileIgnorePatterns(raw: unknown): RegExp[] {
  if (!raw) {
    return [];
  }
  if (!Array.isArray(raw)) {
    throw new Error('Expected ignorePatterns to be an array of strings.');
  }
  return raw.map((pattern, index) => {
    if (typeof pattern !== 'string') {
      throw new Error(`Expected ignorePatterns[${index}] to be a string.`);
    }
    try {
      return new RegExp(pattern);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to compile ignorePatterns[${index}] ('${pattern}'): ${message}`);
    }
  });
}

function isFileNotFound(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'code' in error && (error as { code?: unknown }).code === 'ENOENT');
}

function parseInternalHosts(raw: unknown): string[] {
  if (!raw) {
    return [];
  }
  if (typeof raw === 'string') {
    const host = normalizeHost(raw);
    return host ? [host] : [];
  }
  if (!Array.isArray(raw)) {
    throw new Error('Expected internalHosts to be a string or array of strings.');
  }
  const hosts: string[] = [];
  for (let index = 0; index < raw.length; index += 1) {
    const value = raw[index];
    if (typeof value !== 'string') {
      throw new Error(`Expected internalHosts[${index}] to be a string.`);
    }
    const host = normalizeHost(value);
    if (host) {
      hosts.push(host);
    }
  }
  return hosts;
}

interface StatusAllowRule {
  readonly pattern: RegExp;
  readonly statuses: ReadonlySet<number>;
}

function parseAllowedStatuses(raw: unknown): StatusAllowRule[] {
  if (!raw) {
    return [];
  }
  if (!Array.isArray(raw)) {
    throw new Error('Expected allowedStatuses to be an array of objects.');
  }
  return raw.map((entry, index) => {
    if (!entry || typeof entry !== 'object') {
      throw new Error(`Expected allowedStatuses[${index}] to be an object.`);
    }

    const patternValue = (entry as { pattern?: unknown }).pattern;
    if (typeof patternValue !== 'string') {
      throw new Error(`Expected allowedStatuses[${index}].pattern to be a string.`);
    }

    let pattern: RegExp;
    try {
      pattern = new RegExp(patternValue);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to compile allowedStatuses[${index}].pattern ('${patternValue}'): ${message}`);
    }

    const statusesValue = (entry as { statuses?: unknown }).statuses;
    const statusList =
      typeof statusesValue === 'number'
        ? [statusesValue]
        : Array.isArray(statusesValue)
          ? statusesValue
          : undefined;
    if (!statusList || statusList.length === 0) {
      throw new Error(`Expected allowedStatuses[${index}].statuses to be a number or array of numbers.`);
    }

    const statuses = new Set<number>();
    for (let statusIndex = 0; statusIndex < statusList.length; statusIndex += 1) {
      const rawStatus = statusList[statusIndex];
      if (!Number.isInteger(rawStatus)) {
        throw new Error(
          `Expected allowedStatuses[${index}].statuses[${statusIndex}] to be an integer HTTP status code.`,
        );
      }
      statuses.add(rawStatus);
    }

    return { pattern, statuses };
  });
}

function parsePositiveInteger(raw: string, name: string): number {
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Expected ${name} to be a positive integer, received '${raw}'.`);
  }
  return value;
}

function parseNonNegativeInteger(raw: string, name: string): number {
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Expected ${name} to be a non-negative integer, received '${raw}'.`);
  }
  return value;
}

async function ensureDirectory(path: string): Promise<void> {
  const stats = await stat(path);
  if (!stats.isDirectory()) {
    throw new Error(`Expected '${path}' to be a directory.`);
  }
}

async function collectHtmlFiles(root: string): Promise<string[]> {
  const pending = [root];
  const files: string[] = [];

  while (pending.length > 0) {
    const current = pending.pop();
    if (!current) {
      continue;
    }

    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = join(current, entry.name);
      if (entry.isDirectory()) {
        pending.push(entryPath);
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        files.push(entryPath);
      }
    }
  }

  return files;
}

async function collectLinks(htmlFiles: readonly string[]): Promise<Map<string, Set<string>>> {
  const map = new Map<string, Set<string>>();

  for (const file of htmlFiles) {
    const content = await readFile(file, 'utf8');
    const links = extractLinks(content);
    if (links.length === 0) {
      continue;
    }

    const relativePath = relative(process.cwd(), file);
    for (const link of links) {
      const sources = map.get(link);
      if (sources) {
        sources.add(relativePath);
      } else {
        map.set(link, new Set([relativePath]));
      }
    }
  }

  return map;
}

function extractLinks(content: string): string[] {
  const matches = new Set<string>();
  const regex = /href\s*=\s*["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content))) {
    const raw = decodeHtmlEntities(match[1].trim());
    if (!raw.startsWith('http://') && !raw.startsWith('https://') && !raw.startsWith('//')) {
      continue;
    }
    const normalized = normalizeUrl(raw);
    if (normalized) {
      matches.add(normalized);
    }
  }

  return [...matches];
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function normalizeUrl(url: string): string {
  const withoutFragment = url.split('#')[0] ?? '';
  if (!withoutFragment) {
    return '';
  }
  if (withoutFragment.startsWith('//')) {
    return `https:${withoutFragment}`;
  }
  return withoutFragment;
}

function normalizeHost(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  try {
    return new URL(trimmed).hostname.toLowerCase();
  } catch {
    const withoutScheme = trimmed.replace(/^[a-z]+:\/\//i, '');
    const host = withoutScheme.split('/')[0]?.trim();
    return host ? host.toLowerCase() : undefined;
  }
}

function normalizePath(path: string): string {
  if (!path) {
    return '/';
  }
  const trimmed = path.trim();
  if (!trimmed) {
    return '/';
  }
  const stripped = trimmed.split('#')[0] ?? '';
  const withoutQuery = stripped.split('?')[0] ?? '';
  if (!withoutQuery) {
    return '/';
  }
  const withLeadingSlash = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
  const collapsed = withLeadingSlash.replace(/\/{2,}/g, '/');
  return collapsed.length > 0 ? collapsed : '/';
}

function isReachableStatus(status: number): boolean {
  return (status >= 200 && status < 400) || EXTENDED_OK_STATUSES.has(status);
}

function isStatusExplicitlyAllowed(url: string, status: number, rules: readonly StatusAllowRule[]): boolean {
  return rules.some((rule) => rule.pattern.test(url) && rule.statuses.has(status));
}

function isAcceptableStatus(url: string, status: number, options: ResolvedOptions): boolean {
  return isReachableStatus(status) || isStatusExplicitlyAllowed(url, status, options.statusAllowRules);
}

function shouldFallbackWithGet(status: number): boolean {
  return FALLBACK_STATUSES.has(status);
}

async function checkAll(urls: readonly string[], options: ResolvedOptions): Promise<LinkResult[]> {
  if (urls.length === 0) {
    return [];
  }

  const results: LinkResult[] = new Array(urls.length);
  let nextIndex = 0;
  const workerCount = Math.min(options.concurrency, urls.length);

  const workers = Array.from({ length: workerCount }, async () => {
    while (true) {
      const currentIndex = nextIndex;
      if (currentIndex >= urls.length) {
        break;
      }
      nextIndex += 1;
      const url = urls[currentIndex];
      results[currentIndex] = await checkLink(url, options);
    }
  });

  await Promise.all(workers);
  return results;
}

function shouldIgnore(url: string, options: ResolvedOptions): boolean {
  return options.ignoredPatterns.some((pattern) => pattern.test(url));
}

function isRedirectPath(pathname: string, redirects: ReadonlySet<string>): boolean {
  if (redirects.size === 0) {
    return false;
  }
  const normalized = normalizePath(pathname);
  if (redirects.has(normalized)) {
    return true;
  }
  if (normalized.endsWith('/')) {
    const withoutSlash = normalized.replace(/\/+$/, '');
    return withoutSlash.length > 0 && redirects.has(withoutSlash);
  }
  return redirects.has(`${normalized}/`);
}

async function checkLink(url: string, options: ResolvedOptions): Promise<LinkResult> {
  if (isInternalLink(url, options.internalHosts)) {
    return verifyInternalLink(url, options);
  }
  return checkExternalWithRetries(url, options);
}

function isInternalLink(url: string, hosts: ReadonlySet<string>): boolean {
  if (hosts.size === 0) {
    return false;
  }
  try {
    const hostname = new URL(url).hostname;
    return hosts.has(hostname);
  } catch {
    return false;
  }
}

async function verifyInternalLink(url: string, options: ResolvedOptions): Promise<LinkResult> {
  try {
    const pathname = new URL(url).pathname;
    const normalizedPath = normalizePath(pathname);
    const candidates = buildLocalCandidates(pathname, options.root);
    for (const candidate of candidates) {
      try {
        const stats = await stat(candidate);
        if (stats.isFile()) {
          return { url, ok: true, status: 200 };
        }
      } catch {
        // try next candidate
      }
    }
    const inspected = candidates.map((candidate) => relative(process.cwd(), candidate)).join(', ');
    if (isRedirectPath(normalizedPath, options.redirectPaths)) {
      return { url, ok: true, status: 308 };
    }
    return {
      url,
      ok: false,
      reason: inspected.length > 0 ? `Missing generated file (${inspected})` : 'Unable to map to local file',
    };
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : 'Failed to parse internal URL';
    return { url, ok: false, reason };
  }
}

function buildLocalCandidates(pathname: string, root: string): string[] {
  const candidates = new Set<string>();
  const decoded = decodeURI(pathname);
  const trimmed = decoded.replace(/^\/+/, '');

  if (trimmed.length === 0) {
    candidates.add(join(root, 'index.html'));
    return [...candidates];
  }

  if (decoded.endsWith('/')) {
    const withoutSlash = trimmed.slice(0, -1);
    if (withoutSlash.length > 0) {
      candidates.add(join(root, withoutSlash, 'index.html'));
      candidates.add(join(root, `${withoutSlash}.html`));
    } else {
      candidates.add(join(root, 'index.html'));
    }
  } else {
    candidates.add(join(root, trimmed));
    if (!trimmed.includes('.')) {
      candidates.add(join(root, trimmed, 'index.html'));
      candidates.add(join(root, `${trimmed}.html`));
    }
  }

  return [...candidates];
}

async function checkExternalWithRetries(url: string, options: ResolvedOptions): Promise<LinkResult> {
  let attempt = 0;
  let lastFailure: LinkFailure | undefined;

  while (attempt <= options.retries) {
    const result = await checkOnce(url, options);
    if (result.ok) {
      return result;
    }

    lastFailure = result;
    attempt += 1;

    if (!result.retryable) {
      break;
    }

    if (attempt > options.retries) {
      break;
    }

    const backoffMs = Math.min(5000, 500 * attempt);
    await delay(backoffMs);
  }

  if (lastFailure?.retryable) {
    const curlResult = await checkWithCurl(url, options);
    if (curlResult) {
      return curlResult;
    }
  }

  return lastFailure ?? { url, ok: false, reason: 'Unknown error after retries.' };
}

async function checkOnce(url: string, options: ResolvedOptions): Promise<LinkResult> {
  try {
    const headResponse = await fetchWithTimeout(url, 'HEAD', options.timeoutMs);
    if (isAcceptableStatus(url, headResponse.status, options)) {
      return { url, ok: true, status: headResponse.status };
    }

    if (shouldFallbackWithGet(headResponse.status)) {
      const getResponse = await fetchWithTimeout(url, 'GET', options.timeoutMs);
      if (isAcceptableStatus(url, getResponse.status, options)) {
        return { url, ok: true, status: getResponse.status };
      }
      return {
        url,
        ok: false,
        status: getResponse.status,
        reason: `GET request returned ${getResponse.status} ${getResponse.statusText}`,
      };
    }

    return {
      url,
      ok: false,
      status: headResponse.status,
      reason: `HEAD request returned ${headResponse.status} ${headResponse.statusText}`,
    };
  } catch (error: unknown) {
    const reason = formatError(error);
    return { url, ok: false, reason, retryable: true };
  }
}

async function fetchWithTimeout(
  url: string,
  method: 'HEAD' | 'GET',
  timeoutMs: number,
): Promise<Response> {
  return fetch(url, {
    method,
    headers: HEADERS,
    redirect: 'follow',
    signal: AbortSignal.timeout(timeoutMs),
  });
}

function delay(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    const details =
      error.cause instanceof Error ? `${error.message}: ${error.cause.message}` : error.message;
    if ('code' in error && typeof (error as { code?: unknown }).code === 'string') {
      return `${details} (${(error as { code: string }).code})`;
    }
    return details;
  }
  return typeof error === 'string' ? error : 'Unknown error';
}

async function checkWithCurl(url: string, options: ResolvedOptions): Promise<LinkResult | undefined> {
  const timeoutSeconds = Math.max(1, Math.ceil(options.timeoutMs / 1000));
  const args = [
    '--head',
    '--location',
    '--max-time',
    `${timeoutSeconds}`,
    '--silent',
    '--show-error',
    '--user-agent',
    HEADERS['user-agent'],
    '--header',
    `Accept: ${HEADERS.accept}`,
    '--header',
    `Accept-Language: ${HEADERS['accept-language']}`,
    url,
  ];

  try {
    const { stdout, stderr } = await execFileAsync('curl', args, {
      timeout: options.timeoutMs + 2000,
    });
    const output = `${stdout}\n${stderr}`;
    const status = extractCurlStatus(output);
    if (typeof status === 'number') {
      if (isAcceptableStatus(url, status, options)) {
        return { url, ok: true, status };
      }
      return { url, ok: false, status, reason: `curl reported status ${status}` };
    }
    return { url, ok: false, reason: 'curl completed without a status line.' };
  } catch (error: unknown) {
    const reason = formatError(error);
    return { url, ok: false, reason };
  }
}

function extractCurlStatus(output: string): number | undefined {
  const lines = output.split(/\r?\n/);
  let detected: number | undefined;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }
    const match = /^HTTP\/\S+\s+(\d{3})/.exec(line);
    if (match) {
      detected = Number.parseInt(match[1] ?? '', 10);
    }
  }
  return detected;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
