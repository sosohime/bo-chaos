import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig((config) => {
  return {
    plugins: [pluginReact()],
    server: {
      open: false,
      base: config.envMode === 'production' ? '/rpg/foto' : '/rpg/foto_dev'
    },
    dev: {
      client: {
        path: '/ws/rpg/foto_dev_hmr',
        port: 9911
      }
    }
  }
});
