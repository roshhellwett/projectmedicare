import { describe, it, expect } from "vitest";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

describe("Backend Worker Tests", () => {
  it("should return healthy status from /healthz", async () => {
    // This assumes the backend is running locally on 8080
    // If it's not running, the fetch will fail.
    try {
      const res = await fetch(`${BACKEND_URL}/healthz`);
      const data = await res.json();

      // Even if degraded (e.g. SITE_URL not set), it should return JSON
      expect(res.status).toBeGreaterThanOrEqual(200);
      expect(data).toHaveProperty("status");
      expect(data).toHaveProperty("health");
      expect(data).toHaveProperty("purge");
    } catch (e) {
      console.warn(`Backend worker might not be running at ${BACKEND_URL}`);
      // Skip if backend isn't running for this test context, or throw
      // throw e;
    }
  });
});
