import { test, expect } from "@playwright/test";

test("every admin section loads with green accents and working navigation", async ({ page, request }) => {
  test.setTimeout(180_000);
  const runtimeErrors: string[] = [];
  const apiFailures: string[] = [];
  page.on("pageerror", error => runtimeErrors.push(error.message));
  page.on("response", response => {
    const url = new URL(response.url());
    if (url.pathname.startsWith("/api/") && response.status() >= 500) apiFailures.push(`${response.status()} ${url.pathname}`);
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/adminlogin");
  await page.locator("input[type=email]").fill(process.env.E2E_ADMIN_EMAIL || "owner@ceylonwalldecor.lk");
  await page.locator("input[type=password]").fill(process.env.E2E_ADMIN_PASSWORD || "Admin@2026#owner");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 20_000 });

  const routes = ["/admin", "/admin/products", "/admin/orders", "/admin/custom-requests", "/admin/messages", "/admin/customers", "/admin/categories", "/admin/delivery", "/admin/content", "/admin/promotions", "/admin/reviews", "/admin/marketing", "/admin/users", "/admin/settings", "/admin/audit"];
  for (const route of routes) {
    await test.step(route, async () => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.locator("main h1").first()).toBeVisible({ timeout: 15_000 });
      const active = page.locator(`aside nav a[href='${route}']`);
      await expect(active).toHaveCSS("color", "rgb(16, 79, 55)");
      const oldAccent = await page.locator("body").evaluate(element => [...element.querySelectorAll("*")].filter(node => {
        const style = getComputedStyle(node);
        return style.display !== "none" && [style.color, style.backgroundColor, style.borderTopColor, style.stroke, style.fill].some(value => /^rgba?\((186, 142, 35|160, 123, 30|138, 107, 26)[,)]/.test(value));
      }).map(node => node.tagName));
      expect(oldAccent, `Legacy yellow accents on ${route}`).toEqual([]);
    });
  }

  await test.step("product authoring and existing detail pages", async () => {
    const products = (await (await request.get("/api/products")).json()).data;
    expect(products.length).toBeGreaterThan(0);
    for (const route of ["/admin/products/new", `/admin/products/${products[0].id}/edit`, "/admin/notifications"]) {
      expect((await page.goto(route))?.status()).toBe(200);
      await expect(page.locator("main h1").first()).toBeVisible({ timeout: 15_000 });
    }
    for (const collection of ["orders", "custom-requests"]) {
      const result = await (await request.get(`/api/${collection}`)).json();
      expect(result.success).toBe(true);
      if (result.data.length) {
        expect((await page.goto(`/admin/${collection}/${result.data[0].id}`))?.status()).toBe(200);
        await expect(page.locator("main h1").first()).toBeVisible({ timeout: 15_000 });
      }
    }
  });

  await page.goto("/admin/products");
  const add = page.getByRole("link", { name: "Add New Design", exact: true });
  await expect(add).toHaveCSS("background-color", "rgb(16, 79, 55)");
  await expect(add).toHaveCSS("color", "rgb(255, 255, 255)");
  await add.hover();
  await expect(add).toHaveCSS("background-color", "rgb(31, 103, 72)");
  for (const width of [390, 768]) {
    await test.step(`admin mobile navigation at ${width}px`, async () => {
      await page.setViewportSize({ width, height: 844 });
      await page.getByRole("button", { name: "Open navigation menu" }).click();
      const products = page.locator("aside nav").getByRole("link", { name: "Products", exact: true });
      await expect(products).toBeInViewport();
      await expect(products).toHaveCSS("color", "rgb(16, 79, 55)");
      await page.locator("aside nav").getByRole("link", { name: "Dashboard", exact: true }).click();
      await expect(page).toHaveURL(/\/admin$/);
      await expect(page.locator("aside")).not.toBeInViewport();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.goto("/admin/products");
    });
  }
  expect(runtimeErrors).toEqual([]);
  expect(apiFailures).toEqual([]);
});
