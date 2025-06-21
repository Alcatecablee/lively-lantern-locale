
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async ({ command }) => {
  // Dynamically import lovable-tagger only when building
  const componentTagger = command === 'build' 
    ? (await import("lovable-tagger")).componentTagger 
    : null;

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      componentTagger && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
