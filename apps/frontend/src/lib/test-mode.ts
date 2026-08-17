/**
 * Enables deterministic E2E shortcuts only in a non-production server that
 * explicitly opts in. Production must never accept client-controlled test data.
 */
export function isE2ETestMode(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.E2E_TEST_MODE === "true"
  );
}
