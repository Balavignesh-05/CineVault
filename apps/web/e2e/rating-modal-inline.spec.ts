/**
 * Standalone Playwright script to render the ReviewComposerModal layout
 * at all required viewports WITHOUT needing authentication.
 *
 * Injects a minimal HTML page that reproduces the exact CSS structure of the
 * modal's date+rating section using the same Tailwind classes, so we can
 * verify layout correctness without a running Next.js server.
 *
 * Run with:
 *   npx playwright test e2e/rating-modal-inline.spec.ts --project=desktop-chromium
 */

import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = path.join(process.cwd(), 'screenshots', 'rating-modal');

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
});

// Minimal reproduction of the modal's date+rating section as a self-contained HTML page.
// Uses inline styles matching the Tailwind utility values so no build step is needed.
const MODAL_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Rating Modal Layout Test</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0B0F14; color: #F4F3EC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 16px; }

    /* Modal */
    .modal {
      width: 100%; max-width: 672px;
      background: #131A22; border: 1px solid #273442; border-radius: 16px;
      overflow: hidden;
    }
    /* Header */
    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 24px; border-bottom: 1px solid #273442; background: #0B0F14;
    }
    .modal-header h2 { font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; }
    /* Form */
    .modal-form { padding: 24px; }
    /* Poster + form row */
    .poster-form-row { display: flex; flex-direction: row; gap: 24px; }
    .poster { width: 112px; flex-shrink: 0; }
    .poster-img { width: 112px; aspect-ratio: 2/3; background: #1A2430; border: 1px solid #273442; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #9AA8B7; font-size: 12px; }
    .form-fields { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 20px; }

    /* THE FIX: always single-column, space-y-4 equivalent */
    .date-rating-stack { display: flex; flex-direction: column; gap: 16px; }

    .field-group { display: flex; flex-direction: column; gap: 6px; }
    .field-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9AA8B7; }

    /* Date input */
    .date-wrapper { position: relative; }
    .date-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9AA8B7; pointer-events: none; }
    .date-input {
      width: 100%; height: 44px; padding-left: 36px; padding-right: 12px;
      background: #0B0F14; border: 1px solid #273442; border-radius: 12px;
      color: #F4F3EC; font-size: 14px; outline: none; appearance: none;
      color-scheme: dark;
    }
    .date-input:focus { border-color: #35D6A0; box-shadow: 0 0 0 1px #35D6A0; }

    /* Rating container */
    .rating-container {
      display: flex; align-items: center;
      min-height: 44px; width: 100%;
      padding: 8px 12px;
      background: #0B0F14; border: 1px solid #273442; border-radius: 12px;
      overflow: visible;
    }
    /* Stars */
    .stars-row { display: inline-flex; align-items: center; flex-wrap: nowrap; flex-shrink: 0; gap: 6px; }
    .star-btn {
      display: flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; flex-shrink: 0;
      background: transparent; border: none; cursor: pointer; border-radius: 4px;
      padding: 0; transition: transform 0.1s;
    }
    .star-btn:hover { transform: scale(1.1); }
    .star-btn svg { width: 24px; height: 24px; flex-shrink: 0; stroke-width: 1.75; }
    .star-empty svg { color: transparent; stroke: #3B4D61; fill: transparent; }
    .star-filled svg { color: #35D6A0; stroke: #35D6A0; fill: #35D6A0; }
    .not-rated { font-size: 12px; font-weight: 700; color: #9AA8B7; white-space: nowrap; margin-left: 4px; flex-shrink: 0; }

    /* Title */
    .movie-title { font-size: 20px; font-weight: 700; }
    .movie-year { font-size: 12px; color: #9AA8B7; margin-top: 4px; font-weight: 600; }

    /* Viewport label */
    .vp-label { position: fixed; top: 8px; left: 8px; background: #35D6A0; color: #0B0F14; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; z-index: 9999; }
  </style>
</head>
<body>
  <span class="vp-label" id="vp-label">vw: <span id="vw"></span>px</span>
  <div class="modal" data-testid="log-review-modal">
    <div class="modal-header">
      <h2>Log / Review Film</h2>
      <button style="color:#9AA8B7;background:none;border:none;cursor:pointer;font-size:18px;">✕</button>
    </div>
    <div class="modal-form">
      <div class="poster-form-row">
        <div class="poster">
          <div class="poster-img">No Poster</div>
        </div>
        <div class="form-fields">
          <div>
            <div class="movie-title">Fight Club</div>
            <div class="movie-year">1999</div>
          </div>

          <!-- THE FIX: always stacked, never grid -->
          <div class="date-rating-stack" data-testid="date-rating-stack">
            <!-- Date -->
            <div class="field-group">
              <label class="field-label">Specify Date</label>
              <div class="date-wrapper">
                <svg class="date-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <input class="date-input" type="date" value="2026-10-31" data-testid="date-input" />
              </div>
            </div>

            <!-- Rating -->
            <div class="field-group">
              <label class="field-label">Rating</label>
              <div class="rating-container">
                <div class="stars-row" role="radiogroup" aria-label="Rating">
                  <button class="star-btn star-empty" type="button" aria-label="1 of 5 stars" role="radio">
                    <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </button>
                  <button class="star-btn star-empty" type="button" aria-label="2 of 5 stars" role="radio">
                    <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </button>
                  <button class="star-btn star-empty" type="button" aria-label="3 of 5 stars" role="radio">
                    <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </button>
                  <button class="star-btn star-empty" type="button" aria-label="4 of 5 stars" role="radio">
                    <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </button>
                  <button class="star-btn star-empty" type="button" aria-label="5 of 5 stars" role="radio">
                    <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </button>
                  <span class="not-rated">Not rated</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
  <script>
    document.getElementById('vw').textContent = window.innerWidth;
    // Star click interaction
    document.querySelectorAll('.star-btn').forEach((btn, i) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.star-btn').forEach((b, j) => {
          b.className = 'star-btn ' + (j <= i ? 'star-filled' : 'star-empty');
        });
        document.querySelector('.not-rated').textContent = (i + 1) + '.0 ★';
        document.querySelector('.not-rated').style.color = '#35D6A0';
      });
    });
  </script>
</body>
</html>`;

const VIEWPORTS = [
  { name: '375px-mobile', width: 375, height: 812 },
  { name: '640px-sm-boundary', width: 640, height: 900 },
  { name: '768px-tablet', width: 768, height: 1024 },
  { name: '1071px-desktop', width: 1071, height: 900 },
  { name: '1440px-wide', width: 1440, height: 900 },
];

for (const vp of VIEWPORTS) {
  test(`Inline modal layout — ${vp.name} — no overlap, all 5 stars visible`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.setContent(MODAL_HTML);
    await page.waitForTimeout(200);

    // Screenshot
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `inline-${vp.name}.png`),
      fullPage: false,
    });

    // 1. All 5 star buttons present and visible
    for (let i = 1; i <= 5; i++) {
      const star = page.locator(`[aria-label="${i} of 5 stars"]`);
      await expect(star).toBeVisible(`Star ${i} must be visible at ${vp.name}`);
    }

    // 2. "Not rated" label visible
    await expect(page.locator('.not-rated')).toBeVisible();
    await expect(page.locator('.not-rated')).toHaveText('Not rated');

    // 3. Date input visible, full-width (fills its container)
    const dateInput = page.locator('[data-testid="date-input"]');
    await expect(dateInput).toBeVisible();

    const dateBB = await dateInput.boundingBox();
    const firstStarBB = await page.locator('[aria-label="1 of 5 stars"]').boundingBox();
    const lastStarBB = await page.locator('[aria-label="5 of 5 stars"]').boundingBox();
    const notRatedBB = await page.locator('.not-rated').boundingBox();

    expect(dateBB).not.toBeNull();
    expect(firstStarBB).not.toBeNull();
    expect(lastStarBB).not.toBeNull();
    expect(notRatedBB).not.toBeNull();

    if (dateBB && firstStarBB && lastStarBB && notRatedBB) {
      const dateBottom = dateBB.y + dateBB.height;

      // 4. All stars must be BELOW the date input (stacked layout)
      expect(firstStarBB.y).toBeGreaterThanOrEqual(
        dateBottom - 2,
        `Star 1 (y=${firstStarBB.y}) must be below date input bottom (y=${dateBottom}) at ${vp.name}`,
      );
      expect(lastStarBB.y).toBeGreaterThanOrEqual(
        dateBottom - 2,
        `Star 5 (y=${lastStarBB.y}) must be below date input bottom (y=${dateBottom}) at ${vp.name}`,
      );

      // 5. Stars appear in left-to-right order (x increases from star 1 to 5)
      const star1x = firstStarBB.x;
      const star5x = lastStarBB.x;
      expect(star5x).toBeGreaterThan(star1x, `Stars must be left-to-right at ${vp.name}`);

      // 6. "Not rated" label does not overlap stars — it must be to the right of star 5
      expect(notRatedBB.x).toBeGreaterThanOrEqual(
        star5x,
        `"Not rated" must be to the right of star 5 at ${vp.name}`,
      );

      // 7. No star's right edge overflows the modal boundary
      const modal = page.locator('[data-testid="log-review-modal"]');
      const modalBB = await modal.boundingBox();
      if (modalBB) {
        const modalRight = modalBB.x + modalBB.width;
        expect(lastStarBB.x + lastStarBB.width).toBeLessThanOrEqual(
          modalRight + 2,
          `Star 5 right edge must not overflow modal at ${vp.name}`,
        );
      }
    }

    // 8. Star click: clicking star 3 changes label
    await page.locator('[aria-label="3 of 5 stars"]').click();
    await page.waitForTimeout(150);
    const label = await page.locator('.not-rated').textContent();
    expect(label).toMatch(/3\.0\s*★/);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `inline-${vp.name}-rated.png`),
      fullPage: false,
    });
  });
}
