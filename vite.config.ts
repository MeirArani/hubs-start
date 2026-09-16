import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { defineConfig } from 'vite';
import { devtools } from '@tanstack/devtools-vite';

import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { createRunnableDevEnvironment } from 'vite';

import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { nitro } from 'nitro/vite';
import svgr from 'vite-plugin-svgr';
import { colyseus } from 'colyseus/vite';

const config = defineConfig({
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  envPrefix: 'HUBS_',
  resolve: { tsconfigPaths: true },
  plugins: [
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      outputStructure: 'message-modules',
      cookieName: 'PARAGLIDE_LOCALE',
      strategy: ['url', 'cookie', 'preferredLanguage', 'baseLocale'],
      urlPatterns: [
        {
          pattern: '/:path(.*)?',
          localized: [['en', '/en/:path(.*)?']],
        },
      ],
    }),
    devtools({
      injectSource: {
        enabled: false,
      },
    }),
    tanstackStart(),
    svgr({
      svgrOptions: {
        replaceAttrValues: {
          '#000': 'currentColor',
          '#000000': 'currentColor',
          black: 'currentColor',
        },
      },
    }),
    tailwindcss(),
    nitro({
      rollupConfig: { external: [/^@sentry\//] },
    }),
    viteReact(),
    colyseus({
      serverEntry: './server/src/app.config.ts',
      serveClient: true,
    }),
  ],
  environments: {
    colyseus: {
      dev: {
        createEnvironment(name, config, context) {
          return createRunnableDevEnvironment(name, config);
        },
      },
      consumer: 'server',
      build: {
        target: 'esnext',
      },
    },
  },
});

export default config;
