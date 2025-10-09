import { describe, expect, it } from 'vitest';
import { buildLegacyRedirects } from '../astro.config.mjs';

describe('legacy redirects', () => {
  const redirects = buildLegacyRedirects();

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
});
