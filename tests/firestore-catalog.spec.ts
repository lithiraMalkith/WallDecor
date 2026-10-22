import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });

test("the API returns hosted Firestore images with caching disabled", async ({ request }) => {
  const response = await request.get("/api/products?visibility=published");
  expect(response.ok()).toBe(true);
  expect(response.headers()["cache-control"]).toContain("no-store");
  const result = await response.json();
  expect(result.success).toBe(true);
  expect(result.data.length).toBeGreaterThan(0);
  for (const product of result.data) {
    const detail = await request.get(`/api/products/${product.id}`);
    expect((await detail.json()).data.images).toEqual(product.images);
    for (const image of product.images) expect(image).toMatch(/^https:\/\/res\.cloudinary\.com\/.+\/green-collection\//);
  }
  expect((await request.get("/api/products/missing-catalog-product")).status()).toBe(404);
});

for (const route of ["/", "/shop"]) {
  test(`${route}: an empty Firestore response does not restore demo products or local catalog data`, async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("ceylon.products", JSON.stringify([{ id: "fake", name: "Local fake product" }]));
    });
    await page.route("**/api/products?*", intercepted => intercepted.fulfill({ json: { success: true, data: [] } }));
    await page.goto(route);
    await expect(page.getByText("No artworks are available yet.")).toBeVisible();
    await expect(page.locator("a[href^='/product/']")).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText("Local fake product");
    await expect(page.getByRole("heading", { name: "Walls worth feeling." })).toHaveCount(0);
  });

  test(`${route}: a failed refresh clears stale products and shows an unavailable state`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("a[href^='/product/']").first()).toBeVisible();
    await page.route("**/api/products?*", intercepted => intercepted.fulfill({ status: 503, json: { success: false, error: "Firestore unavailable" } }));
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(page.getByText("The collection is unavailable. Please try again shortly.")).toBeVisible();
    await expect(page.locator("a[href^='/product/']")).toHaveCount(0);
  });
}

test("saved carts store selections only and hydrate details and prices from Firestore", async ({ page, request }) => {
  const live = (await (await request.get("/api/products/prod_01")).json()).data;
  const variant = live.sizes[0];
  await page.addInitScript(({ id, label }) => {
    localStorage.setItem("ceylon.cart.v1", JSON.stringify([{ product: { id, name: "Forged local name", image: "/old-yellow.jpg" }, size: `${label} in`, framed: false, qty: 2, unitPrice: 1 }]));
  }, { id: live.id, label: variant.label });
  await page.goto("/cart");
  await expect(page.locator("main")).toContainText(live.name);
  await expect(page.locator("main")).not.toContainText("Forged local name");
  await expect(page.locator("main img").first()).toHaveAttribute("src", /green-collection/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("ceylon.cart.v2"))).not.toBeNull();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("ceylon.cart.v2")!));
  expect(stored).toEqual([{ productId: live.id, size: `${variant.label} in`, framed: false, qty: 2 }]);
  expect(await page.evaluate(() => localStorage.getItem("ceylon.cart.v1"))).toBeNull();
  await expect(page.locator("main")).toContainText(`Rs. ${variant.priceWithoutFrame.toLocaleString("en-LK")}`);
});

test("deleted products cannot return through a saved cart snapshot", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("ceylon.cart.v1", JSON.stringify([{ product: { id: "deleted-product", name: "Deleted local artwork" }, size: "6×6 in", qty: 1, framed: false, unitPrice: 1 }])));
  await page.goto("/cart");
  await expect(page.locator("main")).not.toContainText("Deleted local artwork");
  await expect(page.locator("main img")).toHaveCount(0);
});

test("a slow older catalog response cannot replace the latest failed refresh", async ({ page, request }) => {
  const live = await (await request.get("/api/products?visibility=published")).json();
  let release!: () => void;
  const delayed = new Promise<void>(resolve => { release = resolve; });
  let requests = 0;
  await page.route("**/api/products?*", async route => {
    if (++requests === 1) {
      await delayed;
      await route.fulfill({ json: live }).catch(() => {}); // The obsolete request may already be aborted.
    } else {
      await route.fulfill({ status: 503, json: { success: false, error: "Firestore unavailable" } });
    }
  });
  await page.goto("/shop");
  await expect.poll(() => requests).toBe(1);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByText("The collection is unavailable. Please try again shortly.")).toBeVisible();
  release();
  await expect(page.locator("a[href^='/product/']")).toHaveCount(0);
  await expect(page.getByText("The collection is unavailable. Please try again shortly.")).toBeVisible();
});
