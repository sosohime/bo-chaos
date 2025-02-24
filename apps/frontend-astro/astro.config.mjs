// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// import tailwind from '@astrojs/tailwind';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  build: {
    assetsPrefix: '/tuixiu/',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    react(),
    // tailwind({
    //   applyBaseStyles: false,
    // }),
  ],
});
