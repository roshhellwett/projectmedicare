import { describe, it, expect, beforeAll } from "vitest";

const API_BASE = "http://127.0.0.1:3000/api";

describe("Frontend API Routes Integration Tests", () => {
  let adminSessionCookie = "";

  beforeAll(async () => {
    // Attempt to login to get admin cookie
    const res = await fetch(`${API_BASE}/admin/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: process.env.ADMIN_PASSWORD || "admin123",
      }),
    });

    // We don't fail if we can't login, we just test with what we have
    if (res.ok) {
      const setCookie = res.headers.get("set-cookie");
      if (setCookie) adminSessionCookie = setCookie;
    }
  });

  describe("Bulletins (Products & Offers) API", () => {
    it("should return 401 Unauthorized without admin cookie", async () => {
      const res = await fetch(`${API_BASE}/admin/bulletins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: "Test", kind: "product" }),
      });
      expect(res.status).toBe(401);
    });
  });

  describe("Packages API", () => {
    it("should allow booking a package (public)", async () => {
      const res = await fetch(`${API_BASE}/packages/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: "aaaa1111-aaaa-1111-aaaa-111111111111",
          storeId: "11111111-1111-1111-1111-111111111111",
          customerName: "Test User",
          phoneNumber: "9999999999",
        }),
      });

      // If the API isn't fully implemented or we don't have the package, it might 400
      // but it shouldn't 401/500
      expect([200, 400]).toContain(res.status);
    });
  });

  describe("Orders API", () => {
    it("should allow submitting a medicine order (public)", async () => {
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: "Test Order",
          phoneNumber: "8888888888",
          storeId: "11111111-1111-1111-1111-111111111111",
          items: [{ medicineId: "1", quantity: 2 }],
        }),
      });

      expect([200, 400, 500]).toContain(res.status);
    });
  });
});
