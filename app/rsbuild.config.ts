import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  server: {
    open: false,
    base: '/rpg/foto_dev'
  },
  dev: {
    client: {
      path: '/ws/rpg/foto_dev_hmr',
      port: 9911
    }
  }
});
