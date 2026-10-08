import { test, expect } from '@playwright/test';

interface PageErrorRecord {
  url: string;
  type: 'console-error' | 'page-error' | 'failed-request' | 'http-error';
  message: string;
}

const routesToTest = [
  { path: '/', name: 'Home' },
  { path: '/films', name: 'Movies' },
  { path: '/series', name: 'TV Shows' },
  { path: '/discovery', name: 'Discover' },
  { path: '/person', name: 'People' },
  { path: '/movies/550', name: 'Movie Detail (Fight Club)' },
  { path: '/series/1399', name: 'Series Detail (Game of Thrones)' },
  { path: '/signin', name: 'Sign In' },
  { path: '/signup', name: 'Sign Up' },
  { path: '/profile/cinephile', name: 'Profile' },
  { path: '/watchlist', name: 'Watchlist' },
  { path: '/lists', name: 'Lists / Collections' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/recommendations', name: 'AI Recommendations' },
  { path: '/search?q=Inception', name: 'Search Results' },
];

test.describe('CineVault End-to-End Smoke & Regression Suite', () => {
  for (const route of routesToTest) {
    test(`Route ${route.name} (${route.path}) loads without critical runtime errors`, async ({ page }) => {
      const errors: PageErrorRecord[] = [];

      // Monitor browser console errors
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // Filter expected non-fatal network/mock warnings if any
          if (!text.includes('Failed to load resource') && !text.includes('favicon')) {
            errors.push({ url: route.path, type: 'console-error', message: text });
          }
        }
      });

      // Monitor uncaught page errors / React hydration errors
      page.on('pageerror', (err) => {
        errors.push({ url: route.path, type: 'page-error', message: err.message });
      });

      // Monitor failed critical network requests
      page.on('response', (response) => {
        if (response.status() >= 500) {
          errors.push({
            url: route.path,
            type: 'http-error',
            message: `HTTP ${response.status()} on ${response.url()}`
          });
        }
      });

      const response = await page.goto(route.path, { waitUntil: 'domcontentloaded', timeout: 30000 });
      expect(response?.status()).toBeLessThan(400);

      // Verify page element exists and not a complete blank crash
      await expect(page.locator('body')).toBeVisible();

      // Ensure no fatal React hydration errors occurred
      const hydrationErrors = errors.filter(e => 
        e.message.toLowerCase().includes('hydration') ||
        e.message.toLowerCase().includes('minified react error')
      );
      expect(hydrationErrors, `Hydration errors detected on ${route.path}: ${JSON.stringify(hydrationErrors)}`).toHaveLength(0);

      // Check header presence on main pages
      if (!route.path.startsWith('/sign')) {
        const header = page.locator('header');
        await expect(header).toBeVisible();
      }
    });
  }
});
