import { test, expect } from '@playwright/test';

test.describe('Controls Attributes', () => {
  test('depth and lines sliders have correct bounds', async ({ page }) => {
    await page.goto('/analyze');

    const sliders = page.locator('input[type="range"]');
    await expect(sliders).toHaveCount(2);

    // Depth slider
    await expect(sliders.nth(0)).toHaveAttribute('min', '1');
    await expect(sliders.nth(0)).toHaveAttribute('max', '30');

    // Lines slider
    await expect(sliders.nth(1)).toHaveAttribute('min', '1');
    await expect(sliders.nth(1)).toHaveAttribute('max', '3');
  });
});

