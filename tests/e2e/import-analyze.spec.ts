import { test, expect } from '@playwright/test';

test.describe('Import + Batch Analysis', () => {
  test('imports PGN and shows accuracies after analysis', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/analyze');

    // Open Import dialog
    await page.getByRole('button', { name: /Import/i }).click();
    await expect(page.getByRole('heading', { name: /Import Game/i })).toBeVisible();

    // Paste a small PGN
    const pgn = `
[Event "Test"]
[Site "?"]
[Date "2025.01.01"]
[Round "-"]
[White "White"]
[Black "Black"]
[Result "*"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 *
`;
    await page.locator('textarea').fill(pgn.trim());
    await page.getByRole('button', { name: /^Import$/i }).click();

    // Start full game analysis
    const analyzeBtn = page.getByRole('button', { name: /ANALYZE GAME/i });
    await analyzeBtn.click();

    // Engine panel should go into batch mode
    await expect(page.getByText(/BATCH ANALYSIS/i)).toBeVisible({ timeout: 10_000 });

    // Wait for batch mode to end
    await expect(page.getByText(/BATCH ANALYSIS/i)).toBeHidden({ timeout: 60_000 });

    // Accuracies panel should be visible
    await expect(page.getByText('Accuracies')).toBeVisible();
    await expect(page.getByText('White')).toBeVisible();
    await expect(page.getByText('Black')).toBeVisible();
  });
});

