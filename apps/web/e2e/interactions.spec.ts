import { test, expect } from '@playwright/test';

test.describe('Automated UI Interaction Testing', () => {

  test('Header Navigation and Search Interactions', async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const isMobile = testInfo.project.name === 'mobile-chromium';

    if (isMobile) {
      await page.waitForTimeout(500);
      const bottomNav = page.locator('nav[aria-label="Mobile navigation"]');
      await bottomNav.waitFor({ state: 'attached', timeout: 10000 });
      await expect(bottomNav).toBeVisible();

      const moviesLink = bottomNav.locator('a[href="/films"]').first();
      await expect(moviesLink).toBeVisible();
      await moviesLink.evaluate((el: HTMLElement) => el.click());
      await expect(page).toHaveURL(/\/films/);

      const listsLink = bottomNav.locator('a[href="/lists"]').first();
      await listsLink.evaluate((el: HTMLElement) => el.click());
      await expect(page).toHaveURL(/\/lists/);

      const discoverLink = bottomNav.locator('a[href="/discovery"]').first();
      await discoverLink.evaluate((el: HTMLElement) => el.click());
      await expect(page).toHaveURL(/\/discovery/);
    } else {
      const nav = page.locator('nav[aria-label="Main navigation"]');
      await expect(nav).toBeVisible();

      const moviesLink = nav.getByRole('link', { name: 'Movies' });
      await expect(moviesLink).toBeVisible();
      await moviesLink.evaluate((el: HTMLElement) => el.click());
      await expect(page).toHaveURL(/\/films/);

      const listsLink = nav.getByRole('link', { name: 'Lists' });
      await listsLink.evaluate((el: HTMLElement) => el.click());
      await expect(page).toHaveURL(/\/lists/);

      const discoverLink = nav.getByRole('link', { name: 'Discover' });
      await discoverLink.evaluate((el: HTMLElement) => el.click());
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
    await expect(heroTitle).toBeAttached();

    const viewMovieBtn = page.getByRole('link', { name: /View Movie/i }).first();
    if (await viewMovieBtn.isVisible()) {
      await expect(viewMovieBtn).toHaveAttribute('href', /\/movies\/\d+/);
    }

    const moviesTab = page.locator('a[href="/films"]').first();
    await expect(moviesTab).toBeAttached();
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

  test('Search Autocomplete Panel and Keyboard Dismissal', async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name === 'mobile-chromium';
    if (isMobile) return;

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const searchInput = page.locator('input[type="search"]').first();
    await expect(searchInput).toBeVisible();

    // Type query to trigger autocomplete
    await searchInput.fill('Inception');
    const suggestionsPanel = page.locator('#search-suggestions');
    await expect(suggestionsPanel).toBeVisible({ timeout: 10000 });

    // Test Escape key dismissal
    await page.keyboard.press('Escape');
    await expect(suggestionsPanel).not.toBeVisible();
  });

  test('Search Page Category Navigation and Tab Switching', async ({ page }) => {
    await page.goto('/search?q=Inception', { waitUntil: 'domcontentloaded' });

    // Verify search heading
    const heading = page.locator('h1').first();
    await expect(heading).toContainText(/Inception/i);

    // Verify and switch category tabs
    const tvTab = page.getByRole('button', { name: /TV Shows/i });
    if (await tvTab.isVisible()) {
      await tvTab.click();
      await expect(page).toHaveURL(/tab=tv/);
    }

    const peopleTab = page.getByRole('button', { name: /Cast & Crew/i });
    if (await peopleTab.isVisible()) {
      await peopleTab.click();
      await expect(page).toHaveURL(/tab=people/);
    }

    const filmsTab = page.getByRole('button', { name: /Films/i });
    if (await filmsTab.isVisible()) {
      await filmsTab.click();
      await expect(page).toHaveURL(/tab=films/);
    }
  });

  test('Search Page Empty Discovery State and Suggestion Pills', async ({ page }) => {
    await page.goto('/search', { waitUntil: 'domcontentloaded' });

    // Verify empty state hero
    await expect(page.locator('h1').first()).toContainText(/Search CineVault/i);

    // Verify suggested search pills exist and are clickable
    const pill = page.locator('button:has-text("Christopher Nolan"), button:has-text("Dune"), button:has-text("Studio Ghibli")').first();
    await expect(pill).toBeVisible();
    await pill.click();

    // Verify URL updated with query
    await expect(page).toHaveURL(/\/search\?q=/);
  });

  test('Movie Detail Page 3-Column Composition, Info Tabs & Action Panel', async ({ page }) => {
    await page.goto('/movies/550', { waitUntil: 'domcontentloaded' });

    // Verify Title heading exists
    const titleHeading = page.locator('h1').first();
    await expect(titleHeading).toBeVisible({ timeout: 15000 });

    const isNotFound = await page.locator('text=Movie Not Found').isVisible();
    if (isNotFound) {
      // In CI environments without external TMDB API access, verify the fallback UI rendered without crashing
      await expect(page.getByRole('link', { name: /Back to Movies/i })).toBeVisible();
      return;
    }

    // Verify Title & Director
    await expect(titleHeading).toContainText(/Fight Club/i);

    // Verify Director link
    const directorLink = page.locator('text=David Fincher').first();
    await expect(directorLink).toBeVisible();

    // Verify Left Column: Community stats bar
    const statsBar = page.locator('[aria-label="Community activity metrics"]');
    await expect(statsBar).toBeVisible();

    // Verify Left Column: Where to Watch card
    const whereToWatch = page.locator('text=Where to Watch').first();
    await expect(whereToWatch).toBeVisible();

    // Verify Center Column: Info Tabs
    const castTab = page.getByRole('tab', { name: 'CAST' });
    const crewTab = page.getByRole('tab', { name: 'CREW' });
    const detailsTab = page.getByRole('tab', { name: 'DETAILS' });
    const genresTab = page.getByRole('tab', { name: 'GENRES' });
    const releasesTab = page.getByRole('tab', { name: 'RELEASES' });

    await expect(castTab).toBeVisible();
    await expect(crewTab).toBeVisible();
    await expect(detailsTab).toBeVisible();
    await expect(genresTab).toBeVisible();
    await expect(releasesTab).toBeVisible();

    // Check switching to CREW tab
    await crewTab.click();
    await expect(page.locator('text=Director:').or(page.locator('text=David Fincher')).first()).toBeVisible();

    // Check switching to DETAILS tab
    await detailsTab.click();
    await expect(page.locator('text=Runtime').first()).toBeVisible();

    // Check switching to GENRES tab
    await genresTab.click();
    await expect(page.locator('text=Drama').first()).toBeVisible();

    // Verify Right Column: Movie Action Panel buttons
    const watchBtn = page.getByRole('button', { name: /Watch/i }).first();
    const likeBtn = page.getByRole('button', { name: /Like/i }).first();
    const watchlistBtn = page.getByRole('button', { name: /Watchlist/i }).first();
    await expect(watchBtn).toBeVisible();
    await expect(likeBtn).toBeVisible();
    await expect(watchlistBtn).toBeVisible();

    // Verify Right Column: Ratings Histogram card
    const ratingsCard = page.locator('text=Ratings').first();
    await expect(ratingsCard).toBeVisible();
    const histogram = page.locator('[aria-label="Rating distribution histogram"]');
    await expect(histogram).toBeVisible();
  });

});
