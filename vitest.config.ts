import { defineConfig } from "vitest/config";
import dotenv from "dotenv";
import path from "path";

// Load the .env.local file because local supabase container is not available
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "tests/integration/**/*.test.ts",
      "tests/integration/**/*.test.js",
      "tests/unit/**/*.test.ts",
    ],
  },
});
