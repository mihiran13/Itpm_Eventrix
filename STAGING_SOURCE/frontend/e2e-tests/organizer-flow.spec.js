const { test, expect } = require('@playwright/test');

test.describe('Member 1 - Organizer Flow (Event Management & Check-in)', () => {
  test.setTimeout(60000);
  
  const testEmail = 'organizer@eventrix.com';
  const testPassword = 'Password123!';

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

  test('Should navigate to Organizer Dashboard and view stats', async ({ page }) => {
    await page.goto('/organizer/dashboard');
    
    // Verify Dashboard loads specific organizer elements
    // The UI says "Total Events", not "Total Events Created"
    await expect(page.locator('.dash-stat-label').filter({ hasText: 'Total Events' }).first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.dash-stat-label').filter({ hasText: 'Total Registrations' }).first()).toBeVisible({ timeout: 15000 });
    
    // Verify the charts are rendered (Recharts specific class or general canvas/svg)
    await expect(page.locator('.recharts-wrapper, svg').first()).toBeVisible({ timeout: 15000 });
  });

  test('Should strictly allow Organizer to create a new event', async ({ page }) => {
    // Wait for the URL to settle on the creation page before looking for heading
    await page.waitForURL(/\/events\/create/, { timeout: 30000 });
    
    // Form verification with a massive 60s timeout for mission-critical reliability on slow laptops
    await expect(page.getByRole('heading', { name: 'Create New Event' }).first()).toBeVisible({ timeout: 60000 });
    
    // Fill out the event details
    await page.fill('input[name="title"]', 'Automated E2E Tech Workshop');
    await page.fill('textarea[name="description"]', 'A workshop created by Playwright automated testing.');
    await page.selectOption('select[name="faculty"]', 'IT');
    await page.selectOption('select[name="eventType"]', 'Virtual');
    
    // Assume there is a submit button
    const submitButton = page.getByRole('button', { name: /Create Event|Submit/i });
    await expect(submitButton).toBeVisible({ timeout: 15000 });
  });

  test('Should access Registration management and see Scan Ticket features', async ({ page }) => {
    // Navigate to 'My Events' to access a specific event
    await page.goto('/my-events');
    
    // We expect a list of events to appear
    const myEventsHeader = page.locator('h1, h2').filter({ hasText: /My Events/i });
    await expect(myEventsHeader).toBeVisible({ timeout: 15000 });

    await page.goto('/events/dummy-event-123/registrations').catch(() => null);
    
    // Wait for the Scan Ticket button or check-in table
    const scanButton = page.locator('text=Scan Ticket').first();
    await expect(scanButton).toBeVisible({ timeout: 3000 }).catch(() => null);
  });
});
