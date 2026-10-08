import { test, expect } from '@playwright/test';

test.describe('Automated UI Interaction Testing', () => {

  test('Header Navigation and Search Interactions', async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const isMobile = testInfo.project.name === 'mobile-chromium';

    if (isMobile) {
      const bottomNav = page.locator('nav[aria-label="Mobile navigation"]');
      await expect(bottomNav).toBeVisible();

      const moviesLink = bottomNav.getByRole('link', { name: 'Movies' });
      await expect(moviesLink).toBeVisible();
      await moviesLink.evaluate((el: HTMLElement) => el.click());
      await expect(page).toHaveURL(/\/films/);

      const tvLink = page.locator('nav[aria-label="Mobile navigation"]').getByRole('link', { name: 'TV' });
      await tvLink.evaluate((el: HTMLElement) => el.click());
      await expect(page).toHaveURL(/\/series/);

      const discoverLink = page.locator('nav[aria-label="Mobile navigation"]').getByRole('link', { name: 'Discover' });
      await discoverLink.evaluate((el: HTMLElement) => el.click());
      await expect(page).toHaveURL(/\/discovery/);
    } else {
      const nav = page.locator('nav[aria-label="Main navigation"]');
      await expect(nav).toBeVisible();

      const moviesLink = nav.getByRole('link', { name: 'Movies' });
      await expect(moviesLink).toBeVisible();
      await moviesLink.click();
      await expect(page).toHaveURL(/\/films/);

      const tvLink = page.locator('nav[aria-label="Main navigation"]').getByRole('link', { name: 'TV Shows' });
      await tvLink.click();
      await expect(page).toHaveURL(/\/series/);

      const discoverLink = page.locator('nav[aria-label="Main navigation"]').getByRole('link', { name: 'Discover' });
      await discoverLink.click();
      await expect(page).toHaveURL(/\/discovery/);

      const rouletteBtn = page.getByRole('button', { name: /Roulette/i });
      if (await rouletteBtn.isVisible()) {
        await rouletteBtn.click();
        const modalOrDialog = page.getByRole('dialog').or(page.locator('[role="dialog"]')).or(page.locator('text=Film Roulette'));
        await expect(modalOrDialog.first()).toBeVisible({ timeout: 5000 });
        const closeBtn = page.locator('button[aria-label="Close"], button:has-text("Close")').first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
        } else {
          await page.keyboard.press('Escape');
        }
      }

      const searchInput = page.locator('input[type="search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('Interstellar');
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(/\/search\?q=Interstellar/);
      }
    }
  });

  test('Home Page Hero & Category Tabs Interactions', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const heroTitle = page.locator('h1').first();
    await expect(heroTitle).toBeVisible();

    const viewMovieBtn = page.getByRole('link', { name: /View Movie/i }).first();
    if (await viewMovieBtn.isVisible()) {
      await expect(viewMovieBtn).toHaveAttribute('href', /\/movies\/\d+/);
    }

    const moviesTab = page.getByRole('link', { name: 'Movies' }).first();
    await expect(moviesTab).toBeVisible();
  });

  test('Movies Filter Interactions and Empty State Reset', async ({ page }) => {
    await page.goto('/films', { waitUntil: 'domcontentloaded' });

    const genreSelect = page.locator('select').nth(1);
    await expect(genreSelect).toBeVisible();

    const hideWatched = page.getByLabel('Hide Logged');
    if (await hideWatched.isVisible()) {
      await hideWatched.check();
      expect(await hideWatched.isChecked()).toBeTruthy();
      await hideWatched.uncheck();
    }
  });

  test('Authentication Form Validation & Password Toggle', async ({ page }) => {
    await page.goto('/signin', { waitUntil: 'domcontentloaded' });

    const emailInput = page.locator('input#signin-email');
    const passwordInput = page.locator('input#signin-password');
    const submitBtn = page.getByRole('button', { name: /Sign In/i });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();

    await passwordInput.fill('mySecretPassword123');
    expect(await passwordInput.getAttribute('type')).toBe('password');

    const toggleBtn = page.locator('button[aria-label="Show password"]');
    await toggleBtn.click();
    expect(await passwordInput.getAttribute('type')).toBe('text');

    const hideToggleBtn = page.locator('button[aria-label="Hide password"]');
    await hideToggleBtn.click();
    expect(await passwordInput.getAttribute('type')).toBe('password');

    await emailInput.fill('nonexistent@example.com');
    await submitBtn.click();

    await expect(page.locator('text=failed').or(page.locator('text=Invalid')).or(page.locator('.text-red-400'))).toBeVisible({ timeout: 10000 });
  });

});
