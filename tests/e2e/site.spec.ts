import { test, expect } from "@playwright/test";

test.describe("public site", () => {
  test("home page shows the brand, camp section and bulletin board", async ({
    page,
  }) => {
    await page.goto("/en");
    await expect(page).toHaveTitle(/Janta Medicare LLP/i);
    await expect(page.locator("#sunday-camp")).toBeVisible();
    await expect(page.locator("#bulletin-board")).toBeVisible();

    // Verify Announcements are visible
    await expect(
      page.getByRole("heading", { name: "Announcements", exact: true }),
    ).toBeVisible();

    // Verify Latest Products & Offers are visible from our seed data
    await expect(
      page.getByRole("heading", { name: "Latest Products", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Latest Offers", exact: true }),
    ).toBeVisible();

    // Test the Image Zoom functionality
    const productImages = page.locator("#bulletin-board img.cursor-pointer");
    if ((await productImages.count()) > 0) {
      await productImages.first().click();
      // Zoom modal should appear with a close button
      await expect(page.locator('button[title="Close"]')).toBeVisible({
        timeout: 5000,
      });
      await page.locator('button[title="Close"]').click();
      // Modal should disappear
      await expect(page.locator('button[title="Close"]')).toBeHidden({
        timeout: 5000,
      });
    }
  });

  test("navigation reaches every public page", async ({ page }) => {
    for (const path of [
      "/en/medicines",
      "/en/patient-rate-chart",
      "/en/locations",
      "/en/doctors",
      "/en/bulletins",
      "/en/careers",
      "/en/order",
      "/en/gallery",
      "/en/packages",
      "/en/feedback",
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
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill("definitely-not-the-password");
    
    const submitBtn = page.getByRole("button", { name: /sign in|unlock|log in/i });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();
    
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("admin settings page is locked without a session", async ({ page }) => {
    await page.goto("/en/admin/settings");
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("admin API is locked without a session", async ({ request }) => {
    const res = await request.get("/api/admin/camp");
    expect(res.status()).toBe(401);
  });

  test("admin feedbacks API is locked without a session", async ({
    request,
  }) => {
    const res = await request.delete("/api/admin/feedbacks/123");
    expect(res.status()).toBe(401);
  });
  test("super admin password required to delete order", async ({ page }) => {
    // 1. Create a real order (no 'E2E ' prefix so it goes to DB)
    await page.goto("/en/packages");
    const bookBtn = page.getByRole("button", { name: /book package/i }).first();
    await expect(bookBtn).toBeVisible();
    await bookBtn.click();
    await expect(page.getByText("Total Payable")).toBeVisible({ timeout: 5000 });
    await page.locator('input[name="customer_name"]').fill("E2E-DB Delete Me Package");
    await page.locator('input[name="phone_number"]').fill("9999999999");
    await page.locator('select[name="store_id"]').selectOption({ index: 1 });
    
    // Capture the API response to see why it fails
    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/packages/book')),
      page.getByRole("button", { name: /confirm booking/i }).click()
    ]);
    const responseBody = await response.json().catch(() => ({}));
    console.log("BOOKING API RESPONSE:", response.status(), responseBody);
    
    await expect(page.getByText("Booking Confirmed!")).toBeVisible({ timeout: 10000 });

    // Login
    await page.goto("/en/admin");
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill("test-password-123");
    
    const submitBtn = page.getByRole("button", { name: /sign in|unlock|log in/i });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Verify logged in and wait for the page to reload
    await expect(page.locator("h2", { hasText: "System Status" })).toBeVisible({ timeout: 15000 });

    // Select store if prompted
    const storeSelector = page.getByText("Select Active Store");
    if (await storeSelector.isVisible({ timeout: 5000 }).catch(() => false)) {
      await page.getByRole("button").filter({ hasText: /store/i }).first().click();
      await expect(storeSelector).toBeHidden({ timeout: 10000 });
    }

    // Go to package orders
    await page.goto("/en/admin/package-orders");
    
    // Check the New tab (default) for our newly created order
    await expect(page.getByRole("button", { name: /delete/i }).first()).toBeVisible({ timeout: 10000 });
    
    // Click delete on the first order
    await page.getByRole("button", { name: /delete/i }).first().click();

    // Expect the Super Admin dialog to appear
    const dialogTitle = page.getByText("Delete Package Booking");
    await expect(dialogTitle).toBeVisible();

    // Try with wrong password
    const superAdminInput = page.locator('input[placeholder*="Enter password" i]');
    await expect(superAdminInput).toBeVisible();
    await superAdminInput.fill("wrong-super-password");

    const confirmBtn = page.getByRole("button", { name: /confirm/i });
    await expect(confirmBtn).toBeEnabled();
    await confirmBtn.click();

    // Should see error
    await expect(page.getByText(/Invalid super admin password/i)).toBeVisible();

    // Try with right password
    await superAdminInput.fill("janta@123");
    await confirmBtn.click();

    // Should succeed and show toast
    await expect(page.getByText(/Booking deleted successfully|Order deleted successfully/i)).toBeVisible();
  });
});

test.describe("feedback", () => {
  test("submits a feedback successfully and shows toast", async ({ page }) => {
    await page.goto("/en/feedback");

    // Fill the form
    await page.locator('input[name="name"]').fill("E2E Test User");
    // Use a unique phone for each test run if possible, or just a static one that we clean up
    const randomPhone = `999${Math.floor(Math.random() * 10000000)
      .toString()
      .padStart(7, "0")}`;
    await page.locator('input[name="phone"]').fill(randomPhone);
    await page
      .locator('textarea[name="note"]')
      .fill("This is an E2E test feedback.");

    // Submit
    await page.getByRole("button", { name: /submit|send/i }).click();

    // Expect success message card instead of a toast
    await expect(page.getByText("Feedback Submitted!")).toBeVisible({
      timeout: 10000,
    });

    // Click button to show form again
    await page
      .getByRole("button", { name: /submit another feedback/i })
      .click();

    // Try to submit with the same phone again to test the duplicate phone error toast
    await page.locator('input[name="name"]').fill("E2E Test User 2");
    await page.locator('input[name="phone"]').fill(randomPhone);
    await page.locator('textarea[name="note"]').fill("Another note");
    await page.getByRole("button", { name: /submit|send/i }).click();

    // Expect error toast (we use showToast for errors)
    await expect(page.locator("text=✕")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("forms", () => {
  const randomPhone = () =>
    `999${Math.floor(Math.random() * 10000000)
      .toString()
      .padStart(7, "0")}`;

  test("submits a job application successfully", async ({ page }) => {
    await page.goto("/en/careers");
    await page.locator('input[name="name"]').fill("E2E Applicant");
    await page.locator('input[name="phone"]').fill(randomPhone());
    await page.locator('select[name="store_id"]').selectOption({ index: 1 });
    await page
      .locator('input[type="file"]')
      .setInputFiles("fixtures/dummy.pdf");

    await page.getByRole("button", { name: /submit/i }).click();
    await expect(page.getByText("Application Submitted!")).toBeVisible({
      timeout: 10000,
    });
  });

  test("submits a medicine order successfully", async ({ page }) => {
    await page.goto("/en/order");
    await page.locator('input[name="name"]').fill("E2E Order");
    await page.locator('input[name="phone"]').fill(randomPhone());
    await page.locator('textarea[name="address"]').fill("E2E Test Address");
    await page.locator('input[name="note"]').fill("E2E Test Note");
    await page
      .locator('input[type="file"]')
      .setInputFiles("fixtures/dummy.png");

    await page.getByRole("button", { name: /submit/i }).click();
    await expect(page.getByText("Order Received!")).toBeVisible({
      timeout: 10000,
    });
  });

  test("submits a package booking successfully", async ({ page }) => {
    await page.goto("/en/packages");
    await page
      .getByRole("button", { name: /book package/i })
      .first()
      .click();

    // Modal is open
    await expect(page.getByText("Total Payable")).toBeVisible({
      timeout: 5000,
    });
    await page.locator('input[name="customer_name"]').fill("E2E Patient");
    await page.locator('input[name="phone_number"]').fill(randomPhone());
    await page.locator('select[name="store_id"]').selectOption({ index: 1 });

    await page.getByRole("button", { name: /confirm booking/i }).click();
    await expect(page.getByText("Booking Confirmed!")).toBeVisible({
      timeout: 10000,
    });
  });
});
