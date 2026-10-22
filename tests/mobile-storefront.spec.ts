import { test, expect, type Page } from "@playwright/test";

async function verifyShell(page: Page, width: number) {
  const header = page.locator("header.reference-header");
  await expect(header).toBeVisible();
  const controls = header.locator(".mobile-menu-trigger:visible, .reference-brand, .header-actions > :visible");
  const bounds = await controls.evaluateAll((elements) => elements.map((element) => {
    const r = element.getBoundingClientRect();
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
  }));
  for (const rect of bounds) {
    expect(rect.left).toBeGreaterThanOrEqual(0);
    expect(rect.right).toBeLessThanOrEqual(width);
  }
  for (let i = 0; i < bounds.length; i++) {
    for (let j = i + 1; j < bounds.length; j++) {
      const a = bounds[i], b = bounds[j];
      expect(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top).toBe(true);
    }
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const title = await page.locator("h1").boundingBox();
  const nav = await header.boundingBox();
  expect(title!.y).toBeGreaterThanOrEqual(nav!.y + nav!.height);
  if (width < 1024) {
    await expect(header.getByRole("button", { name: "Open menu" })).toBeVisible();
    await expect(header.getByRole("navigation", { name: "Primary navigation" })).toBeHidden();
  } else {
    await expect(header.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
  }
}

for (const width of [320, 390, 768, 1024]) {
  test.describe(`${width}px storefront`, () => {
    test.use({ viewport: { width, height: 844 }, reducedMotion: "reduce", hasTouch: width < 1024 });

    test("header controls and page content fit on home, gallery, and shop", async ({ page }) => {
      for (const route of ["/", "/gallery", "/shop"]) {
        await page.goto(route);
        await verifyShell(page, width);
      }
    });

    test("carousel cannot paint or intercept taps over the sticky header", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator(".art-carousel-card").first()).toBeVisible();
      const hit = await page.evaluate(() => {
        const header = document.querySelector("header.reference-header")!;
        const headerHeight = header.getBoundingClientRect().height;
        const cards = [...document.querySelectorAll<HTMLElement>(".art-carousel-card")]
          .filter((card) => getComputedStyle(card).visibility === "visible")
          .map((card) => card.getBoundingClientRect())
          .filter((rect) => rect.right > 10 && rect.left < innerWidth - 10)
          .sort((a, b) => Math.abs(b.x + b.width / 2 - innerWidth / 2) - Math.abs(a.x + a.width / 2 - innerWidth / 2));
        const card = cards[0];
        const x = Math.max(12, Math.min(innerWidth - 12, card.x + card.width / 2));
        window.scrollTo({ top: scrollY + card.y + card.height / 2 - headerHeight / 2, behavior: "instant" });
        return { x, y: headerHeight / 2 };
      });
      await expect.poll(() => page.evaluate(({ x, y }) => Boolean(document.elementFromPoint(x, y)?.closest("header.reference-header")), hit)).toBe(true);
      await page.locator("header.reference-header").getByRole("button", { name: /^Cart with/ }).click();
      await expect(page.getByRole("heading", { name: "Your Cart", exact: true })).toBeVisible();
    });

    if (width < 1024) {
      test("mobile menu covers the viewport, locks scrolling, closes with Escape, and navigates", async ({ page }) => {
        await page.goto("/");
        const openMenu = page.getByRole("button", { name: "Open menu", exact: true });
        const dialog = page.getByRole("dialog", { name: "Site navigation" });
        await openMenu.click();
        await expect(dialog).toBeVisible();
        const rect = await dialog.boundingBox();
        expect(rect!.x).toBe(0);
        expect(rect!.y).toBe(0);
        expect(rect!.width).toBe(width);
        expect(rect!.height).toBe(844);
        expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
        await page.keyboard.press("Tab");
        expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
        const scrollBefore = await page.evaluate(() => scrollY);
        await page.mouse.wheel(0, 300);
        expect(await page.evaluate(() => scrollY)).toBe(scrollBefore);
        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();
        await expect(openMenu).toBeFocused();
        expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
        await openMenu.click();
        await dialog.getByRole("link", { name: "Gallery", exact: true }).click();
        await expect(page).toHaveURL(/\/gallery$/);
        await expect(dialog).toBeHidden();
        await expect(page.getByRole("heading", { name: "Art, at home.", exact: true })).toBeVisible();
      });
    }
  });
}

test.describe("Green gallery and seed images", () => {
  test.use({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });

  test("all seven gallery photographs load and their captions fit", async ({ page }) => {
    await page.goto("/gallery");
    const images = page.locator(".gallery-grid img");
    await expect(images).toHaveCount(7);
    for (const image of await images.all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
      expect(decodeURIComponent(await image.getAttribute("src") || "")).toContain("res.cloudinary.com");
      expect(decodeURIComponent(await image.getAttribute("src") || "")).toContain("/green-collection/");
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByText("AI-generated room studies", { exact: false })).toBeVisible();
  });

  test("the original sunrise seed is replaced on product detail", async ({ page }) => {
    await page.goto("/product/golden-rise");
    await expect(page.locator("main img").first()).toHaveAttribute("src", /sage-arches/);
    await expect(page.locator("main")).not.toContainText("Ceylon yellow");
  });

  test("the horizon seed image and its material description agree", async ({ page }) => {
    await page.goto("/product/sun-room");
    await expect(page.locator("main img").first()).toHaveAttribute("src", /coastal/);
    await expect(page.locator("main")).not.toContainText("burnished golden disc");
    await expect(page.locator("main")).not.toContainText("gold leaf foil");
  });

  test("an old saved cart also displays the new sage seed image", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("ceylon.cart.v1", JSON.stringify([{
        product: { id: "prod_01", slug: "golden-rise", name: "Golden Rise", image: "https://res.cloudinary.com/dtxw88le2/image/upload/e_noise:20,q_auto,f_auto/v1791451905/ceylon-wall-decor/products/sunrise.jpg", room: "Living Room", style: "Minimalist", price: 4400, description: "Sculpted relief" },
        size: "12 × 16 in", framed: false, qty: 1, unitPrice: 4400,
      }]));
    });
    await page.goto("/cart");
    await expect(page.locator("main img").first()).toHaveAttribute("src", /sage-arches/);
  });
});
