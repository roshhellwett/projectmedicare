import { test, expect } from "@playwright/test";

test.describe("public site", () => {
  test("home page shows the brand, camp section and bulletin board", async ({
    page,
  }) => {
    await page.goto("/en");
    await expect(page).toHaveTitle(/Janta Medicare/i);
    await expect(page.locator("#sunday-camp")).toBeVisible();
    await expect(page.locator("#bulletin-board")).toBeVisible();
  });

  test("navigation reaches every public page", async ({ page }) => {
    for (const path of [
      "/en/medicines",
      "/en/patient-rate-chart",
      "/en/locations",
      "/en/doctors",
      "/en/bulletins",
    ]) {
      const response = await page.goto(path);
      expect(response?.status(), `${path} status`).toBe(200);
      await expect(page.locator("h1").first()).toBeVisible();
    }
  });

  test("medicine search filters through the URL", async ({ page }) => {
    await page.goto("/en/medicines");
    const search = page
      .getByRole("searchbox")
      .or(page.locator('input[type="search"]'))
      .first();
    await search.fill("para");
    await expect(page).toHaveURL(/query=para/, { timeout: 15_000 });
  });

  test("language switch keeps the user on the same page", async ({ page }) => {
    await page.goto("/en/locations");
    await page.goto("/hi/locations");
    await expect(page.locator("html")).toHaveAttribute("lang", "hi");
  });
});

test.describe("admin", () => {
  test("admin panel asks for the password", async ({ page }) => {
    await page.goto("/en/admin");
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("wrong password is rejected", async ({ page }) => {
    await page.goto("/en/admin");
    await page
      .locator('input[type="password"]')
      .fill("definitely-not-the-password");
    await page.getByRole("button", { name: /sign in|unlock|log in/i }).click();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("admin API is locked without a session", async ({ request }) => {
    const res = await request.get("/api/admin/camp");
    expect(res.status()).toBe(401);
  });
});
