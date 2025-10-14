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
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Disable source maps in production for security
    sourcemap: mode === "development",
    // Minify code for obfuscation
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: mode === "production", // Remove console.log in production
        drop_debugger: true, // Remove debugger statements
      },
      mangle: {
        safari10: true, // Better obfuscation
      },
      format: {
        comments: false, // Remove all comments
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Obfuscate chunk names
        entryFileNames: 'assets/[hash].js',
        chunkFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash].[ext]',
        // Manual chunks for better code splitting
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'tensorflow': ['@tensorflow/tfjs', '@teachablemachine/image'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-toast', '@radix-ui/react-tabs'],
        },
      },
    },
  },
}));
