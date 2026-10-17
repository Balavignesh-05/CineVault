import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Automated Visual Testing & Screenshots', () => {
  const screenshotsDir = path.join(process.cwd(), 'screenshots');

  test.beforeAll(async () => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  test('Capture Desktop Visual Screenshots', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'desktop-chromium') return;

    // 1. Home desktop
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, 'desktop-home.png'), fullPage: false });

    // 2. Movies desktop
    await page.goto('/films', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, 'desktop-movies.png'), fullPage: false });

    // 3. TV Shows desktop
    await page.goto('/series', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, 'desktop-series.png'), fullPage: false });

    // 4. Discover desktop
    await page.goto('/discovery', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, 'desktop-discover.png'), fullPage: false });

    // 5. Lists desktop
    await page.goto('/lists', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, 'desktop-lists.png'), fullPage: false });

    // 6. Movie Detail desktop
    await page.goto('/movies/550', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, 'desktop-movie-detail.png'), fullPage: false });

    // 7. Login desktop 1440x900
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/signin', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, 'desktop-1440-signin.png'), fullPage: false });
    await page.screenshot({ path: path.join(screenshotsDir, 'desktop-login.png'), fullPage: false });

    // 8. Signup desktop 1440x900
    await page.goto('/signup', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, 'desktop-1440-signup.png'), fullPage: false });

    // 9. Short desktop viewport 1280x720
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/signin', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, 'desktop-1280x720-signin.png'), fullPage: false });
  });

  test('Capture Mobile Visual Screenshots', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'mobile-chromium') return;

    // 1. Home mobile
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile-home.png'), fullPage: false });

    // 2. Movies mobile
    await page.goto('/films', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile-movies.png'), fullPage: false });

    // 3. Discover mobile
    await page.goto('/discovery', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile-discover.png'), fullPage: false });

    // 4. Login mobile 390x844
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/signin', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile-390-signin.png'), fullPage: false });
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile-login.png'), fullPage: false });

    // 5. Signup mobile 390x844
    await page.goto('/signup', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, 'mobile-390-signup.png'), fullPage: false });
  });
});
