import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import fs from 'fs';

// Automatically ensure logo.png is present in public directory during any Vite execution/build
try {
  const srcPath = path.resolve(process.cwd(), "src/assets/images/club_logo_1780074680882.png");
  const destDir = path.resolve(process.cwd(), "public");
  const destPath = path.resolve(destDir, "logo.png");

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log("vite.config.ts: Successfully ensured public/logo.png is prepared.");
  } else {
    console.warn("vite.config.ts: Source logo image not found at:", srcPath);
  }
} catch (error) {
  console.error("vite.config.ts: Error ensuring logo copy:", error);
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
