import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sentry from '@sentry/astro';

const noStoreHeaders = {
  'Cache-Control': 'no-store, max-age=0, must-revalidate',
};

function noStoreDevHeaders() {
  const setHeaders = (_req, res, next) => {
    for (const [key, value] of Object.entries(noStoreHeaders)) {
      res.setHeader(key, value);
    }

    next();
  };

  return {
    name: 'bo-chaos-no-store-dev-headers',
    configureServer(server) {
      server.middlewares.use(setHeaders);
    },
    configurePreviewServer(server) {
      server.middlewares.use(setHeaders);
    },
  };
}

// https://astro.build/config
export default defineConfig({
  build: {
    assetsPrefix: '/retire/',
  },
  vite: {
    plugins: [noStoreDevHeaders()],
  },
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    sentry({
      dsn: 'https://55a75cceaf622a672fc7a5e79a265454@o4507808803782656.ingest.us.sentry.io/4508964321820672',
      tracesSampleRate: 0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      sourceMapsUploadOptions: {
        project: 'javascript-astro',
        authToken: process.env.ASTRO_SENTRY_AUTH_TOKEN,
      },
    }),
  ],
});
