import { describe, it, expect, beforeAll } from "vitest";
import { createSessionToken } from "../../apps/frontend/src/lib/auth/session";

const API_BASE = "http://127.0.0.1:3000/api";

describe("Admin vs Biller Roles & Security", () => {
  let adminCookie = "";
  let billerCookie = "";

  beforeAll(() => {
    // Generate valid session tokens for testing
    // Note: This relies on the environment having a valid ADMIN_SESSION_SECRET
    const adminSession = createSessionToken("admin_user", "ADMIN");
    adminCookie = `jm_admin_session=${adminSession.token}`;

    const billerSession = createSessionToken("biller_user", "BILLER");
    billerCookie = `jm_admin_session=${billerSession.token}`;
  });

  describe("API Guards", () => {
    it("should allow ADMIN to access sensitive routes", async () => {
      // Create a dummy global setting update
      // Since it's a server action, we test an API route that requires admin
      const res = await fetch(`${API_BASE}/admin/medicine-batches?page=1&pageSize=1`, {
        headers: { Cookie: adminCookie },
      });
      // Should not be 401
      expect(res.status).not.toBe(401);
    });

    it("should reject BILLER from accessing sensitive routes (e.g. settings/medicines)", async () => {
      const res = await fetch(`${API_BASE}/admin/medicines`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Cookie: billerCookie 
        },
        body: JSON.stringify({
          medicine_name: "Hacker Med",
          pack_size: "10s",
        }),
      });
      // Should be 401 Unauthorized because billers cannot create medicines
      expect(res.status).toBe(401);
    });
  });
});
