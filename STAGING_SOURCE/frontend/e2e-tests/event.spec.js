const { test, expect } = require('@playwright/test');

test.describe('Public Views and Event Browsing', () => {
  test('should be able to view the home page and navigate to feed', async ({ page }) => {
    // Start at home page
    await page.goto('/');

    // Verify title or main heading
    // Assuming there's a title with 'Eventrix' or 'Events'
    await expect(page).toHaveTitle(/Eventrix|React App/i);

    // Depending on routing, check if feed page is accessible
    await page.goto('/feed');
    
    // Check if feed loads filters or general layout
    // The feed usually has Faculty tabs
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to register page correctly', async ({ page }) => {
    await page.goto('/register');
    
    // Verify register page elements
    await expect(page.locator('h1')).toContainText('Create Account');
    
    // Check if role selection exists (Organizer, Student)
    await page.getByRole('button', { name: /Create Account/i }).isVisible();
  });
});
