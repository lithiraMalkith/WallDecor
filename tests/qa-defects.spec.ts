import { test, expect, type Page } from '@playwright/test';
import sharp from 'sharp';

const image = async (name = 'reference.png') => ({ name, mimeType: 'image/png', buffer: await sharp({ create: { width: 16, height: 16, channels: 3, background: '#45654c' } }).png().toBuffer() });
async function fillRequest(page: Page) {
  await page.getByPlaceholder('Your full name *').fill('QA reference request');
  await page.getByPlaceholder('Phone · 07XXXXXXXX *').fill('0770000000');
  await page.getByPlaceholder(/Tell us about the textures/).fill('QA reference photo upload regression test.');
}

test.describe('TC-STORE-05 custom reference uploads', () => {
  test('invalid formats and files over 10MB are rejected before uploading', async ({ page }) => {
    let uploads = 0;
    await page.route('**/api/upload', route => { uploads++; return route.fulfill({ status: 500 }); });
    await page.goto('/custom-order');
    await page.getByLabel('Reference photos').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('not a photo') });
    await expect(page.locator('form').getByRole('alert')).toContainText('JPG, PNG, or WEBP');
    await page.getByLabel('Reference photos').setInputFiles({ name: 'large.png', mimeType: 'image/png', buffer: Buffer.alloc(10 * 1024 * 1024 + 1) });
    await expect(page.locator('form').getByRole('alert')).toContainText('10MB or smaller');
    await expect(page.getByRole('list', { name: 'Selected reference photos' })).toHaveCount(0);
    expect(uploads).toBe(0);
  });

  test('a failed upload preserves the form and retries before submitting hosted URLs', async ({ page }) => {
    let uploads = 0, submissions = 0;
    const url = 'https://res.cloudinary.com/qa/image/upload/reference.png';
    await page.route('**/api/upload', route => ++uploads === 1 ? route.fulfill({ status: 503, json: { success: false, error: 'Upload temporarily unavailable' } }) : route.fulfill({ json: { success: true, data: { url } } }));
    await page.route('**/api/custom-requests', async route => {
      if (route.request().method() !== 'POST') return route.continue();
      submissions++;
      expect(route.request().postDataJSON().designUploadUrls).toEqual([url]);
      await route.fulfill({ status: 201, json: { success: true, data: { id: 'req_qa_upload' } } });
    });
    await page.goto('/custom-order');
    await fillRequest(page);
    await page.getByLabel('Reference photos').setInputFiles(await image());
    await page.getByRole('button', { name: 'Submit Bespoke Request' }).click();
    await expect(page.locator('form').getByRole('alert')).toContainText('Upload temporarily unavailable');
    await expect(page.getByPlaceholder('Your full name *')).toHaveValue('QA reference request');
    await expect(page.getByRole('button', { name: 'Remove reference.png' })).toBeVisible();
    expect(submissions).toBe(0);
    await page.getByRole('button', { name: 'Submit Bespoke Request' }).click();
    await expect(page.getByRole('heading', { name: 'Request Received' })).toBeVisible();
    expect(uploads).toBe(2);
    expect(submissions).toBe(1);
  });

  test('retrying multiple photos retains completed uploads and permits removing a selection', async ({ page }) => {
    let uploads = 0;
    await page.route('**/api/upload', route => {
      uploads++;
      return uploads === 2 ? route.fulfill({ status: 502, json: { error: 'Second photo failed' } }) : route.fulfill({ json: { success: true, data: { url: `https://res.cloudinary.com/qa/image/upload/${uploads}.png` } } });
    });
    await page.route('**/api/custom-requests', async route => {
      if (route.request().method() !== 'POST') return route.continue();
      expect(route.request().postDataJSON().designUploadUrls).toEqual(['https://res.cloudinary.com/qa/image/upload/1.png', 'https://res.cloudinary.com/qa/image/upload/3.png']);
      await route.fulfill({ status: 201, json: { success: true, data: { id: 'req_qa_multiple' } } });
    });
    await page.goto('/custom-order');
    await fillRequest(page);
    await page.getByLabel('Reference photos').setInputFiles([await image('one.png'), await image('two.png'), await image('remove.png')]);
    await page.getByRole('button', { name: 'Remove remove.png' }).click();
    await page.getByRole('button', { name: 'Submit Bespoke Request' }).click();
    await expect(page.locator('form').getByRole('alert')).toContainText('Second photo failed');
    await page.getByRole('button', { name: 'Submit Bespoke Request' }).click();
    await expect(page.getByRole('heading', { name: 'Request Received' })).toBeVisible();
    expect(uploads).toBe(3);
  });

  test('large valid photos are reduced below the hosting request limit', async ({ page }) => {
    let bytes = 0;
    await page.route('**/api/upload', route => {
      bytes = route.request().postDataBuffer()?.byteLength || 0;
      return route.fulfill({ json: { success: true, data: { url: 'https://res.cloudinary.com/qa/image/upload/compressed.webp' } } });
    });
    await page.route('**/api/custom-requests', route => route.request().method() === 'POST' ? route.fulfill({ status: 201, json: { success: true, data: { id: 'req_qa_compressed' } } }) : route.continue());
    await page.goto('/custom-order');
    await fillRequest(page);
    const png = await image();
    await page.getByLabel('Reference photos').setInputFiles({ ...png, buffer: Buffer.concat([png.buffer, Buffer.alloc(5 * 1024 * 1024)]) });
    await page.getByRole('button', { name: 'Submit Bespoke Request' }).click();
    await expect(page.getByRole('heading', { name: 'Request Received' })).toBeVisible();
    expect(bytes).toBeGreaterThan(0);
    expect(bytes).toBeLessThan(3.5 * 1024 * 1024);
  });

  test('the upload API rejects missing, disguised, oversized, and unsupported files', async ({ request }) => {
    const missing = await request.post('/api/upload', { multipart: { folder: 'ceylon-wall-decor/custom-requests' } });
    expect(missing.status()).toBe(400);
    const disguised = await request.post('/api/upload', { multipart: { file: { name: 'fake.png', mimeType: 'image/png', buffer: Buffer.from('not a png') } } });
    expect(disguised.status()).toBe(400);
    const invalid = await request.post('/api/upload', { multipart: { file: { name: 'vector.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') } } });
    expect(invalid.status()).toBe(400);
    const oversized = await request.post('/api/upload', { data: { dataUrl: 'data:image/png;base64,' + 'A'.repeat(Math.ceil(10 * 1024 * 1024 * 4 / 3) + 101) } });
    expect(oversized.status()).toBe(413);
  });
});

for (const width of [320, 390, 1440]) {
  test(`TC-STORE-06: collection search and room/style filters work at ${width}px`, async ({ page, request }) => {
    await page.setViewportSize({ width, height: 900 });
    const products = (await (await request.get('/api/products?visibility=published')).json()).data;
    const product = products[0];
    await page.goto('/');
    const collection = page.locator('#collection');
    await collection.getByRole('searchbox', { name: 'Search collection', exact: true }).fill(product.name);
    await collection.getByRole('combobox', { name: 'Collection room', exact: true }).selectOption(product.room[0]);
    await collection.getByRole('combobox', { name: 'Collection style', exact: true }).selectOption(product.style[0]);
    await expect(collection.locator('a[href^="/product/"]')).toHaveCount(1);
    await expect(collection.getByRole('heading', { name: product.name, exact: true })).toBeVisible();
    await collection.getByRole('searchbox').fill('no-matching-qa-design-987654321');
    await expect(collection.getByRole('status')).toContainText('No artworks match');
    await collection.getByRole('button', { name: 'Clear collection filters' }).click();
    await expect(collection.locator('a[href^="/product/"]')).toHaveCount(products.length);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.goto('/shop');
    await page.getByRole('searchbox', { name: 'Search artworks', exact: true }).fill(product.name);
    await page.getByRole('combobox', { name: 'Artwork style', exact: true }).selectOption(product.style[0]);
    await expect(page.locator('a[href^="/product/"]')).toHaveCount(1);
  });
}

for (const width of [320, 390, 768]) {
  test(`TC-ADM-03: all main admin sections stay within the ${width}px viewport`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 844 });
    for (const route of ['/admin', '/admin/products', '/admin/orders', '/admin/custom-requests', '/admin/messages', '/admin/customers', '/admin/categories', '/admin/delivery', '/admin/content', '/admin/promotions', '/admin/reviews', '/admin/marketing', '/admin/users', '/admin/settings', '/admin/audit']) {
      await page.goto(route);
      await expect(page.locator('main h1').first()).toBeVisible();
      const geometry = await page.evaluate(() => {
        const main = document.querySelector('main')!;
        const bounds = main.getBoundingClientRect();
        return { pageWidth: document.documentElement.scrollWidth, width: innerWidth, mainRight: bounds.right, overflow: [...main.querySelectorAll<HTMLElement>('input, select, textarea')].filter(element => {
          if (!element.getClientRects().length) return false;
          if (element.closest('.overflow-x-auto')) return false; // Wide tables scroll inside their own bounded region.
          const rect = element.getBoundingClientRect();
          return rect.left < bounds.left - 1 || rect.right > bounds.right + 1;
        }).map(element => element.tagName) };
      });
      expect(geometry.pageWidth, route).toBeLessThanOrEqual(width);
      expect(geometry.mainRight, route).toBeLessThanOrEqual(width);
      expect(geometry.overflow, route).toEqual([]);
    }
    await page.getByRole('button', { name: 'Open navigation menu' }).click();
    const dialog = page.getByRole('dialog', { name: 'Admin navigation' });
    await expect(dialog).toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
    for (let index = 0; index < 25; index++) {
      await page.keyboard.press('Tab');
      expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(page.locator('aside')).not.toBeInViewport();
    await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeFocused();
    await page.getByRole('button', { name: 'Open navigation menu' }).click();
    await dialog.getByRole('link', { name: 'Audit Trail', exact: true }).click();
    await expect(page.locator('aside')).not.toBeInViewport();
  });
}

test('TC-ADM-04: sidebar and top bar remain fixed while admin content scrolls independently', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto('/admin');
  await expect(page.locator('main h1')).toBeVisible();
  const before = await page.locator('aside').boundingBox();
  await page.locator('main').evaluate(element => { element.scrollTop = 700; });
  await expect.poll(() => page.locator('main').evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  const after = await page.locator('aside').boundingBox();
  expect(after!.y).toBe(before!.y);
  expect(after!.height).toBe(800);
  expect((await page.locator('header').boundingBox())!.y).toBe(0);
  expect(await page.evaluate(() => scrollY)).toBe(0);
});

test('TC-ADM-05: pending-order count follows the actual list and refreshes without phantom items', async ({ page }) => {
  let pending = true;
  await page.route('**/api/orders?status=pending', route => route.fulfill({ json: { success: true, data: pending ? [{ id: 'qa_order', orderRef: 'QA-ORDER', customer: { name: 'QA order' }, deliveryAddress: { city: 'Colombo' }, total: 3500, status: 'pending' }] : [] } }));
  await page.route('**/api/custom-requests?status=new', route => route.fulfill({ json: { success: true, data: [{ id: 'qa_custom', customerName: 'QA custom request', notes: 'Reference artwork', status: 'new' }] } }));
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/admin/products');
  const badge = page.getByTestId('order-notification-count');
  await expect(badge).toHaveText('1');
  await page.getByRole('button', { name: 'Notifications', exact: true }).click();
  const panel = page.getByRole('region', { name: 'Order and custom request notifications' });
  await expect(panel.getByRole('link', { name: /QA-ORDER/ })).toHaveCount(1);
  await expect(panel.getByText('1 orders · 1 requests')).toBeVisible();
  const bounds = await panel.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
  pending = false;
  await page.evaluate(() => window.dispatchEvent(new Event('admin-records-changed')));
  await expect(badge).toHaveCount(0);
  await expect(panel.getByRole('link', { name: /QA-ORDER/ })).toHaveCount(0);
  await expect(panel.getByRole('link', { name: /QA custom request/ })).toHaveCount(1);
  await page.route('**/api/orders?status=pending', route => route.fulfill({ status: 503, json: { success: false } }));
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(panel.getByRole('alert')).toContainText('temporarily unavailable');
  await expect(badge).toHaveCount(0);
});

test('TC-NFN-01: streamed hero photographs paint without waiting for React hydration', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  // React's inline streaming swap remains available; no application bundle can hydrate.
  await context.route('**/_next/static/**/*.js', route => route.abort());
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('#art-hero-title')).toBeVisible();
  await expect(page.locator('.art-carousel-card').first()).toBeVisible();
  await expect.poll(() => page.locator('.art-carousel-card img').first().evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  await context.close();
});

test('deferred customer authentication keeps account navigation available', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Collector Account' }).click();
  await expect(page).toHaveURL(/\/account\/login$/);
  await expect(page.getByRole('heading', { name: 'Sign In', exact: true })).toBeVisible();
  await expect(page.locator('form input[type=text]')).toBeEditable();
  await expect(page.locator('form').getByRole('button', { name: 'Sign In', exact: true })).toBeEnabled();
});

test('returning customer details hydrate while authentication loads', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cwd_customer_session', JSON.stringify({ id: 'qa_existing_profile', name: 'QA Returning Collector', phone: '0770000000', email: 'qa@example.test', createdAt: '2026-10-29T00:00:00Z' })));
  await page.goto('/custom-order');
  await expect(page.getByPlaceholder('Your full name *')).toHaveValue('QA Returning Collector');
  await expect(page.getByPlaceholder('Phone · 07XXXXXXXX *')).toHaveValue('0770000000');
  await expect(page.getByPlaceholder('Email address (optional)')).toHaveValue('qa@example.test');
});

test('collection content becomes fully opaque with standard motion settings', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const title = page.locator('#collection .reveal').first();
  await title.scrollIntoViewIfNeeded();
  await expect(title).toHaveCSS('opacity', '1');
  const artwork = page.locator('#collection a[href^="/product/"]').first();
  await artwork.scrollIntoViewIfNeeded();
  await expect(artwork.locator('..')).toHaveCSS('opacity', '1');
});
