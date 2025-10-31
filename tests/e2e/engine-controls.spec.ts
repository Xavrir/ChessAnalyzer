import { test, expect } from '@playwright/test';

test.describe('Engine Controls', () => {
  test('depth and lines controls affect analysis', async ({ page }) => {
    await page.goto('/analyze');

    // Ensure engine panel is present
    await expect(page.getByText('STOCKFISH ENGINE')).toBeVisible();

    // Set depth to 3 (faster) and lines to 2
    const sliders = page.locator('input[type="range"]');
    await expect(sliders).toHaveCount(2);

    // Depth slider is first
    await sliders.nth(0).evaluate((el: HTMLInputElement) => {
      el.value = '3';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await expect(page.getByText(/DEPTH:\s*3/)).toBeVisible();

    // Lines slider is second
    await sliders.nth(1).evaluate((el: HTMLInputElement) => {
      el.value = '2';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await expect(page.getByText(/LINES:\s*2/)).toBeVisible();

    // Start analysis
    const startBtn = page.getByRole('button', { name: /START ANALYSIS/i });
    await startBtn.click();

    // Expect principal variation(s) or Best Move to show up quickly at low depth
    await expect(
      page.getByText(/PRINCIPAL VARIATION|Best Move Suggestion/i)
    ).toBeVisible({ timeout: 10_000 });

    // Stop analysis to clean up
    const stopBtn = page.getByRole('button', { name: /STOP ANALYSIS/i });
    await stopBtn.click();
  });
});

