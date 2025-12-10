import path from "path";
import fs from "fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// Resolve backend path - check Docker location first, then local dev location
const backendPath = fs.existsSync("/backend/src")
  ? "/backend/src"
  : path.resolve(__dirname, "../../backend/src");

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react(), tsconfigPaths],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@backend": backendPath,
    },
  },
  server: {
    port: 3000,
    host: true,
    watch: {
      usePolling: true,
    },
  },
});
