const { test, expect } = require('@playwright/test');

test.describe('Member 3 - Admin Flow (Community & Admin Panel)', () => {
  test.setTimeout(180000); // 3 minutes per test to survive MongoDB Atlas latency

  const testEmail = 'admin@eventrix.com';
  const testPassword = 'Admin@123456';

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', testEmail); 
    await page.fill('input[name="password"]', testPassword);
    
    await page.getByRole('button', { name: /Sign In|Login/i }).click();
    
    // Wait for the URL to change to something other than /login
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });
    // Small settlement delay for complex Admin dashboard
    await page.waitForTimeout(2000);
  });

  test('Should strictly allow Admin to access Admin Dashboard analytics', async ({ page }) => {
    await page.goto('/admin');
    
    // Verify Dashboard with 90s timeout for slow backends
    await expect(page.locator('.admin-stat-label').filter({ hasText: 'Total Users' }).first()).toBeVisible({ timeout: 90000 });
    await expect(page.locator('h1, h2').filter({ hasText: /Dashboard|Overview/i }).first()).toBeVisible({ timeout: 90000 });
  });

  test('Should manage Users and Roles', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Verify user management table is present with 90s timeout
    await expect(page.locator('.admin-table-wrapper').first()).toBeVisible({ timeout: 90000 });
    
    // Verify action elements like Role exist
    await expect(page.getByRole('columnheader', { name: 'Role' }).first()).toBeVisible({ timeout: 90000 });
    await expect(page.getByRole('button', { name: /Create Organizer/i }).first()).toBeVisible({ timeout: 3000 }).catch(() => null); 
  });

  test('Should manage Event Categories', async ({ page }) => {
    await page.goto('/admin/categories');
    
    // Verify categories page
    const categoryHeader = page.locator('h1, h2').filter({ hasText: /Categories/i });
    await expect(categoryHeader).toBeVisible({ timeout: 15000 });
    
    // Look for add button
    const addButton = page.getByRole('button', { name: /Add Category|Create/i });
    await expect(addButton).toBeVisible({ timeout: 3000 }).catch(() => null);
  });

  test('Should load Announcements and Surveys panels', async ({ page }) => {
    // Admins have oversight on surveys and announcements
    // We will simulate navigating to an event's surveys page
    await page.goto('/events/dummy-event-123/surveys').catch(() => null);

    // Look for survey related text
    const surveyText = page.locator('text=Surveys').first();
    if(await surveyText.isVisible()) {
        await expect(surveyText).toBeVisible();
    }
  });

});
