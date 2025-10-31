import { test, expect } from '@playwright/test';

// Crawl internal links up to a limited depth and check navigation works
test.describe('Internal Links Crawl', () => {
  test('crawl depth 2 without 404s', async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('baseURL is not configured');

    const seen = new Set<string>();
    const queue: Array<{ url: string; depth: number }> = [{ url: '/', depth: 0 }];
    const maxDepth = 2;

    while (queue.length) {
      const { url, depth } = queue.shift()!;
      if (seen.has(url) || depth > maxDepth) continue;
      seen.add(url);

      const resp = await page.goto(url);
      expect(resp, `No response for ${url}`).toBeTruthy();
      const status = resp!.status();
      expect(status, `Bad status for ${url}`).toBeLessThan(400);

      // Collect internal links
      const hrefs = await page.$$eval('a[href]', (as) =>
        Array.from(new Set(
          as
            .map((a) => (a as HTMLAnchorElement).getAttribute('href') || '')
            .filter((h) => !!h)
        ))
      );

      for (const href of hrefs) {
        // Normalize to path
        if (href.startsWith('http')) continue; // external
        if (!href.startsWith('/')) continue;   // anchors or mailto

        const next = new URL(href, baseURL).toString();
        if (!seen.has(next)) queue.push({ url: next, depth: depth + 1 });
      }
    }

    // Also open all crawled pages in isolated pages to catch console errors
    for (const url of seen) {
      const p = await context.newPage();
      const errors: string[] = [];
      p.on('pageerror', (err) => errors.push(String(err)));
      await p.goto(url);
      expect(errors, `Console errors on ${url}`).toHaveLength(0);
      await p.close();
    }
  });
});

