import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@data": path.resolve(__dirname, "../../data"),
    }
  },
  server: {
    fs: {
      // allow importing workspace packages (like @du/phases) from outside this folder
      allow: [path.resolve(__dirname, "../..")],
    }
  }
});