import { afterEach, describe, expect, it, vi } from "vitest";
import { validateTurnstileToken } from "../../apps/frontend/src/lib/turnstile";
import { isE2ETestMode } from "../../apps/frontend/src/lib/test-mode";

describe("production security defaults", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("never enables E2E test shortcuts in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("E2E_TEST_MODE", "true");

    expect(isE2ETestMode()).toBe(false);
  });

  it("fails closed when Turnstile is unconfigured in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");

    await expect(validateTurnstileToken("attacker-controlled-token")).resolves.toBe(
      false,
    );
  });
});
