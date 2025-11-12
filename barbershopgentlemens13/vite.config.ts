import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: ".htaccess",
          dest: ".",
        },
        {
          src: "public/sitemap.xml",
          dest: ".",
        },
        {
          src: "public/robots.txt",
          dest: ".",
        },
      ],
    }),
  ],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
});
