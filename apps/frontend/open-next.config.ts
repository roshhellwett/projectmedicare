// OpenNext adapter config for Cloudflare Workers.
// Build with: npm run build:cf  (from the repo root or apps/frontend)
import type { OpenNextConfig } from "@opennextjs/cloudflare";

const config: OpenNextConfig = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      // No caching layer configured: pages are either static assets or
      // dynamic (admin + Supabase reads), so there is nothing to cache in KV.
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
};

export default config;
