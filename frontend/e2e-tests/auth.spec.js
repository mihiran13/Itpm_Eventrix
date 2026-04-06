const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow', () => {
  test('should display login page and perform validation', async ({ page }) => {
    // Navigate to local React app
    await page.goto('/login');

    // Check header
    await expect(page.locator('h1')).toContainText('Welcome Back');

    // Attempt to submit empty form
    await page.getByRole('button', { name: /Sign In/i }).click();

    // Verify validation errors
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should allow entering credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill the inputs
    await page.locator('input[name="email"]').fill('test@example.com');
    await page.locator('input[name="password"]').fill('password123');

    // Ensure state updated
    await expect(page.locator('input[name="email"]')).toHaveValue('test@example.com');
    await expect(page.locator('input[name="password"]')).toHaveValue('password123');
  });
});
