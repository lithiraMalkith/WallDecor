import { test, expect } from "@playwright/test";

test.describe("Ceylon Wall Decor — Full Site Build & Journey Verification", () => {
  test("1. Storefront Homepage & Hero Wall Studio", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Ceylon Wall Decor/i);

    // Verify header navigation exists
    const nav = page.locator("header");
    await expect(nav).toBeVisible();

    // Verify Hero Studio visualizer
    const heroHeading = page.locator("h1");
    await expect(heroHeading).toBeVisible();

    // Verify catalog artworks exist
    const productCards = page.locator("a[href^='/product/']");
    await expect(productCards.first()).toBeVisible();
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);

    // Verify the generated green seed artwork is used
    const images = page.locator("img[src*='sage-arches']");
    const imgCount = await images.count();
    expect(imgCount).toBeGreaterThan(0);
  });

  test("2. Catalog Browsing & Category Filtering (/shop)", async ({ page }) => {
    await page.goto("/shop");
    await expect(page).toHaveTitle(/Shop|Catalog|Ceylon Wall Decor/i);

    // Verify product cards are displayed
    const productCards = page.locator("a[href^='/product/']");
    await expect(productCards.first()).toBeVisible();

    // Check category buttons
    const categoryBtns = page.locator("button, a").filter({ hasText: /Living Room|Minimalist|Botanical/i });
    if (await categoryBtns.first().isVisible()) {
      await categoryBtns.first().click();
      await page.waitForTimeout(400);
      await expect(productCards.first()).toBeVisible();
    }
  });

  test("3. Product Detail & Add to Cart Flow (/product/golden-rise)", async ({ page }) => {
    await page.goto("/product/golden-rise");
    await expect(page.locator("h1")).toContainText(/Golden Rise/i);

    // Verify main artwork image displays the replacement sage seed
    const mainImg = page.locator("main img[src*='sage-arches']").first();
    await expect(mainImg).toBeVisible();

    // Select a size variant
    const sizeButton = page.locator("button").filter({ hasText: /12×16|16×20|8×10/i }).first();
    if (await sizeButton.isVisible()) {
      await sizeButton.click();
    }

    // Add to order
    const addToOrderBtn = page.locator("button").filter({ hasText: /Add to (Order|Cart)/i });
    await expect(addToOrderBtn).toBeVisible();
    await addToOrderBtn.click();

    // Verify Cart Drawer opens
    await expect(page.locator("body")).toContainText(/Golden Rise/i);
  });

  test("4. Custom Commission Atelier (/custom-order)", async ({ page }) => {
    await page.goto("/custom-order");
    await expect(page.locator("h1")).toContainText(/Your idea|Custom|Commission/i);

    // Verify form fields
    await expect(page.locator("input[placeholder*='name' i], input#name, input[name='name']").first()).toBeVisible();
  });

  test("5. Room Inspiration Gallery (/gallery)", async ({ page }) => {
    await page.goto("/gallery");
    await expect(page.locator("h1")).toContainText(/Art, at home/i);

    // Verify gallery images render
    const galleryImgs = page.locator(".gallery-grid img");
    await expect(galleryImgs).toHaveCount(7);
  });

  test("6. Staff Sign In with Seeded Role Credentials (/adminlogin)", async ({ page }) => {
    await page.goto("/adminlogin");
    await expect(page.locator("h1")).toContainText(/Staff Sign In/i);

    // Ensure dummy "Quick Role Access" buttons are completely absent
    await expect(page.locator("text=Quick Role Access")).not.toBeVisible();

    // Sign in with seeded Super Admin (Owner) credentials
    await page.fill("input[type='email']", "owner@ceylonwalldecor.lk");
    await page.fill("input[type='password']", "Admin@2026#owner");

    await page.click("button[type='submit']");

    // Verify redirection to /admin dashboard
    await page.waitForURL("**/admin", { timeout: 15000 });
    await expect(page).toHaveURL(/.*\/admin/);
  });

  test("7. Admin Dashboard & Navigation (/admin)", async ({ page }) => {
    await page.goto("/adminlogin");
    await page.fill("input[type='email']", "owner@ceylonwalldecor.lk");
    await page.fill("input[type='password']", "Admin@2026#owner");
    await page.click("button[type='submit']");
    await page.waitForURL("**/admin", { timeout: 15000 });

    // Verify Admin Header / Sidebar
    await expect(page.locator("body")).toContainText(/Ceylon Wall Decor/i);
    await expect(page.locator("body")).toContainText(/Products/i);
  });

  test("8. Admin Catalog Table & Cloudinary Thumbnails (/admin/products)", async ({ page }) => {
    // Sign in first
    await page.goto("/adminlogin");
    await page.fill("input[type='email']", "owner@ceylonwalldecor.lk");
    await page.fill("input[type='password']", "Admin@2026#owner");
    await page.click("button[type='submit']");
    await page.waitForURL("**/admin", { timeout: 15000 });

    await page.goto("/admin/products");

    // Verify Products table loads
    await expect(page.locator("body")).toContainText(/Artwork Catalog|Products/i);

    // Wait for product rows to render from API
    await page.waitForSelector("table tbody tr, tr.item-row", { timeout: 10000 });

    // Verify Cloudinary thumbnails in product rows
    const productImgs = page.locator("img[src*='cloudinary']");
    expect(await productImgs.count()).toBeGreaterThan(0);
  });

  test("9. Admin Minimalist Artwork Media Uploader (/admin/products/new)", async ({ page, request }) => {
    // Sign in first
    await page.goto("/adminlogin");
    await page.fill("input[type='email']", "owner@ceylonwalldecor.lk");
    await page.fill("input[type='password']", "Admin@2026#owner");
    await page.click("button[type='submit']");
    await page.waitForURL("**/admin", { timeout: 15000 });

    await page.goto("/admin/products/new");
    await expect(page.locator("h1")).toContainText(/Add New Artwork/i);

    // Verify Artwork Media section exists
    await expect(page.locator("text=Artwork Media & Showcase")).toBeVisible();
    await expect(page.locator("text=Artwork Photography")).toBeVisible();

    // Verify "Upload New File" button
    await expect(page.locator("button:has-text('Upload New File')")).toBeVisible();

    // Verify direct Image URL input
    const urlInput = page.locator("input[placeholder*='cloudinary']");
    await expect(urlInput).toBeVisible();

    // Verify 11Labs Film Grain segmented control
    await expect(page.locator("text=11Labs Film Grain:")).toBeVisible();
    await expect(page.getByRole("button", { name: "Off", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Subtle (15)", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Standard (20)", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Deep (30)", exact: true })).toBeVisible();

    // Product media starts empty and uses actual hosted URLs from Firestore.
    await expect(urlInput).toHaveValue("");
    await expect(page.getByRole("button", { name: "Golden Rise", exact: true })).toHaveCount(0);
    const response = await request.get("/api/products?visibility=published");
    expect(response.ok()).toBe(true);
    const product = (await response.json()).data[0];
    await urlInput.fill(product.images[0]);
    await expect(urlInput).toHaveValue(product.images[0]);
    await page.getByRole("button", { name: "Deep (30)", exact: true }).click();
    await expect(urlInput).toHaveValue(/e_noise:30/);
    await page.getByRole("button", { name: "Off", exact: true }).click();
    await expect(urlInput).not.toHaveValue(/e_noise:/);
    await page.getByRole("button", { name: "Standard (20)", exact: true }).click();
    await expect(urlInput).toHaveValue(/e_noise:20/);
  });
});
