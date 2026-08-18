import { afterEach, describe, expect, it, vi } from "vitest";
import { 
  createSessionToken, 
  verifySessionToken, 
  getSessionPayload, 
  hashPassword,
  safeEqual
} from "../../apps/frontend/src/lib/auth/session";

describe("Session and Authentication Utilities", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("Session Token Generation and Validation", () => {
    it("should generate a valid session token with username and role", () => {
      vi.stubEnv("ADMIN_SESSION_SECRET", "super-secret-key-that-is-at-least-32-chars-long-12345");
      
      const { token, maxAge } = createSessionToken("testadmin", "ADMIN");
      expect(token).toBeDefined();
      expect(maxAge).toBe(28800); // 8 hours
      
      const isValid = verifySessionToken(token);
      expect(isValid).toBe(true);
      
      const payload = getSessionPayload(token);
      expect(payload).toBeDefined();
      expect(payload?.username).toBe("testadmin");
      expect(payload?.role).toBe("ADMIN");
    });
    
    it("should invalidate a token if it's tampered with", () => {
      vi.stubEnv("ADMIN_SESSION_SECRET", "super-secret-key-that-is-at-least-32-chars-long-12345");
      
      const { token } = createSessionToken("biller", "BILLER");
      const [body, signature] = token.split(".");
      
      const tamperedToken = `${body}tampered.${signature}`;
      expect(verifySessionToken(tamperedToken)).toBe(false);
      
      const tamperedSignature = `${body}.tampered${signature}`;
      expect(verifySessionToken(tamperedSignature)).toBe(false);
    });

    it("should fail gracefully if secret is missing", () => {
      vi.stubEnv("ADMIN_SESSION_SECRET", "");
      
      expect(() => createSessionToken("test", "ADMIN")).toThrow();
      expect(verifySessionToken("some.token.here")).toBe(false);
    });
  });

  describe("Password Hashing & Safe Equal", () => {
    it("should correctly hash passwords deterministically based on secret", () => {
      vi.stubEnv("ADMIN_SESSION_SECRET", "super-secret-key-that-is-at-least-32-chars-long-12345");
      
      const hash1 = hashPassword("mypassword123");
      const hash2 = hashPassword("mypassword123");
      
      expect(hash1).toEqual(hash2);
      expect(hash1).toHaveLength(64); // sha256 hex is 64 chars
      
      const hash3 = hashPassword("different");
      expect(hash3).not.toEqual(hash1);
    });
    
    it("safeEqual should prevent timing attacks and match identical strings", () => {
      expect(safeEqual("abc", "abc")).toBe(true);
      expect(safeEqual("abc", "def")).toBe(false);
      expect(safeEqual("abc", "abcd")).toBe(false);
      expect(safeEqual("", "")).toBe(true);
    });
  });
});
