import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    global: "globalThis",
  },
  server: {
    host: "::",
    port: 5173,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Pin only the always-loaded core (React, Router, Query) into stable, long-cacheable
        // chunks so an app-code change doesn't re-download them. Everything else returns
        // undefined so Vite keeps its automatic per-route / shared splitting — route-specific
        // libs (STOMP, charts, …) stay in their lazy route chunks instead of an eager catch-all.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (
            id.includes("react-router") ||
            id.includes("react-dom") ||
            /node_modules[/\\]react[/\\]/.test(id)
          )
            return "react-vendor";
          if (id.includes("@tanstack")) return "query-vendor";
          return undefined;
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
}));
