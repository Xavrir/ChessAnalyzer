import { test, expect } from '@playwright/test';

test.describe('Smoke', () => {
  test('homepage renders and CTA navigates', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('CHESS TACTICAL ANALYZER')).toBeVisible();
    await expect(page.getByRole('heading', { name: /TACTICAL ANALYSIS/i })).toBeVisible();

    const cta = page.getByRole('link', { name: /START ANALYSIS HERE/i });
    await expect(cta).toBeVisible();
    await cta.click();

    await expect(page).toHaveURL(/\/analyze$/);
    await expect(page.getByText('STOCKFISH ENGINE')).toBeVisible();
    await expect(page.getByText(/DEPTH:\s*\d+/i)).toBeVisible();
    await expect(page.getByText(/LINES:\s*\d+/i)).toBeVisible();
  });
});

