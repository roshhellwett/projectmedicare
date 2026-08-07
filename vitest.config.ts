import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';
import path from 'path';

// Load the .env.test file
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.test.ts', 'tests/integration/**/*.test.js'],
  },
});
