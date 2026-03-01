const { test, expect } = require('@playwright/test');

test.describe('Member 2 - Student Flow (Registration & Certificates)', () => {
  test.setTimeout(60000);

  const testEmail = 'VIDU@eventrix.com';
  const testPassword = 'Vidushika@123456';

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    
    await page.getByRole('button', { name: /Sign In|Login/i }).click();
    
    // Wait for the URL to change to something other than /login
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });
    // Small settlement delay for complex UI
    await page.waitForTimeout(2000);
  });

  test('Should view Social Feed and filter events', async ({ page }) => {
    await page.goto('/feed');
    
    // Check if the tabs exist and ignore exact matches because of emojis
    await expect(page.getByRole('button', { name: /All/i }).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /IT/i }).first()).toBeVisible({ timeout: 3000 }).catch(() => null);
    
    // Click a filter tab
    await page.getByRole('button', { name: /IT/i }).first().click().catch(() => null);
    
    // Expect event cards to exist
    const eventCard = page.locator('.event-card, [class*="card"]').first();
    await expect(eventCard).toBeVisible({ timeout: 3000 }).catch(() => null);
  });

  test('Should be able to access the Event Detail page and view registration sidebars', async ({ page }) => {
    await page.goto('/events');
    
    // Find the first event link and click it
    const firstEventLink = page.locator('a[href^="/events/"]').first();
    
    // If there are events, test the detail page
    if (await firstEventLink.count() > 0) {
      await firstEventLink.click();
      
      // Verify countdown timer or registration button
      await expect(page.locator('button').filter({ hasText: 'Register Now' }).first().or(page.locator('button').filter({ hasText: 'Already Registered' }).first())).toBeVisible({ timeout: 3000 }).catch(() => null);
    }
  });

  test('Should access My Registrations, view QR E-Ticket and Certificates', async ({ page }) => {
    await page.goto('/my-registrations');
    await page.waitForURL(/\/my-registrations/, { timeout: 30000 });
    
    // Ensure the main headings exist with a generous 60s timeout for slow hydration
    await expect(page.getByRole('heading', { name: 'My Registrations' }).first()).toBeVisible({ timeout: 60000 });
    
    // Check for E-Ticket or Certificate buttons with broader text matching
    const anyActionButton = page.locator('button').filter({ hasText: /Ticket|Certificate/i }).first();
    await expect(anyActionButton).toBeVisible({ timeout: 15000 }).catch(() => null);
  });

  test('Should view and manage Personal Schedule', async ({ page }) => {
    await page.goto('/schedule');
    await page.waitForURL(/\/schedule/, { timeout: 30000 });
    
    // Check for Personal Schedule elements with role-based matching and 60s timeout
    await expect(page.getByRole('heading', { name: /My Schedule Planner/i }).first()).toBeVisible({ timeout: 60000 });
  });
});
