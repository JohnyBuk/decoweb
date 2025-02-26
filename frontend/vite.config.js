import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: ["www.decoweb.online, decoweb.online"],
    proxy: {
      "/plan-dive": "http://backend:5000",
    },
  },
  preview: {
    port: 5173,
    allowedHosts: ["www.decoweb.online, decoweb.online"],
    proxy: {
      "/plan-dive": "http://backend:5000",
    },
  },
});
