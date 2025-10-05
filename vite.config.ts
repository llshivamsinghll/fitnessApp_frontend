import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: process.env.VITE_DEV_HOST || "::",
    port: parseInt(process.env.VITE_DEV_PORT || "8080"),
    // Proxy disabled - using direct backend calls via VITE_API_BASE_URL
    // proxy: {
    //   "/api": {
    //     target: process.env.VITE_BACKEND_URL || "https://fitness-backend-jkfm.onrender.com",
    //     changeOrigin: true,
    //     secure: true,
    //     rewrite: (path) => path.replace(/^\/api/, '/api'),
    //   },
    // },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
