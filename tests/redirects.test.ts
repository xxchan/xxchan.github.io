import { describe, expect, it } from 'vitest';
import { buildLegacyRedirects } from '../astro.config.mjs';

describe('legacy redirects', () => {
  const redirects = buildLegacyRedirects() as unknown as Record<string, { destination: string; status: number } | string>;

  it('maps legacy AI article to new blog route', () => {
    expect(redirects['/ai/2025/09/28/tool-eval.html']).toEqual({
      destination: '/blog/2025-09-28-tool-eval/',
      status: 308,
    });
  });

  it('keeps categories landing redirect intact', () => {
    expect(redirects['/categories/']).toBe('/tags/');
  });

  it('derives category slug from front matter', () => {
    expect(redirects['/cs/2020/09/02/intern-at-meituan.html']).toEqual({
      destination: '/blog/2020-09-02-intern-at-meituan/',
      status: 308,
    });
  });

  it('redirects legacy Chinese slug to localized route', () => {
    expect(redirects['/cs/2022/02/09/paxos-hard-zh.html']).toEqual({
      destination: '/zh/blog/2022-02-09-paxos-hard-zh/',
      status: 308,
    });
  });
});
