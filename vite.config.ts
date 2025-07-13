
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Define process global for Node.js packages in browser
    'process.env': {},
    'process.env.NODE_ENV': JSON.stringify(mode),
    global: 'globalThis',
  },
  optimizeDeps: {
    // Pre-bundle these Node.js packages to avoid issues
    include: [
      '@babel/types',
      '@babel/parser',
      '@babel/traverse',
      '@babel/generator'
    ]
  }
}));
