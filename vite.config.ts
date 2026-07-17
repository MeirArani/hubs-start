import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { defineConfig } from 'vite';
import { devtools } from '@tanstack/devtools-vite';

import { tanstackStart } from '@tanstack/react-start/plugin/vite';

import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { nitro } from 'nitro/vite';
import formatjs from '@formatjs/unplugin/vite';
import svgr from 'vite-plugin-svgr';
const config = defineConfig({
  // css: {
  //   lightningcss: {
  //     cssModules: true,
  //   },
  // },
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
    devtools(),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    svgr(),
    formatjs({
      idInterpolationPattern: '[sha512:contenthash:base64:6]',
      ast: true,
    }),
  ],
});

export default config;
