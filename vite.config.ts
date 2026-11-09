/// <reference path="./src/types_custom.d.ts" />
import honeybadgerRollupPlugin from '@honeybadger-io/rollup-plugin'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import svgr from 'vite-plugin-svgr'
import wasm from 'vite-plugin-wasm'
import { ManifestOptions, VitePWA } from 'vite-plugin-pwa'
import browserslist from 'browserslist'
import { resolveToEsbuildTarget } from 'esbuild-plugin-browserslist'
import topLevelAwait from 'vite-plugin-top-level-await' // Need it because of vite-plugin-pwa
import { fixWasmUrlAssignment } from './scripts/fix-wasm-url-assignment.mjs'
import manifest from './src/manifest.json'
import { format } from 'date-fns'
import pkg from './package.json'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  const env = loadEnv(mode, process.cwd());
  const appVersion = format(new Date(), 'yyyy-MM-dd HHmm')

  const hbPluginOptions: Parameters<typeof honeybadgerRollupPlugin>[0] = {
    apiKey: env.VITE_HONEYBADGER_API_KEY,
    assetsUrl: 'https://lisudoku.xyz',
    deploy: {
      environment: mode,
    },
    revision: appVersion,
  }

  return {
    base: '/',
    plugins: [
      react(),
      viteTsconfigPaths(),
      svgr({
        include: '**/*.svg?react',
      }),
      wasm(),
      fixWasmUrlAssignment(),
      topLevelAwait(),
      VitePWA({
        registerType: 'autoUpdate',
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,wasm}'],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
        manifest: manifest as Partial<ManifestOptions>,
      }),
    ],
    worker: {
      plugins: () => [
        wasm(),
        fixWasmUrlAssignment(),
        topLevelAwait(),
      ],
    },
    build: {
      target: resolveToEsbuildTarget(browserslist(null, { env: mode, throwOnMissing: true })),
      outDir: 'build',
      sourcemap: true,
      rollupOptions: {
        // Upload sourcemaps on deployment
        plugins: isProd ? [
          honeybadgerRollupPlugin(hbPluginOptions)
        ] : [],
      },
    },
    optimizeDeps: {
      exclude: ['lisudoku-solver'], // helps with symlinking
    },
    server: {
      open: true,
    },
    resolve: {
      alias: {
        src: '/src',
      },
    },
    define: {
      global: {},
      __APP_VERSION__: JSON.stringify(appVersion),
      __SOLVER_VERSION__: JSON.stringify(pkg.dependencies['lisudoku-solver']),
      __SUDOKU_FORMATS_VERSION__: JSON.stringify(pkg.dependencies['sudoku-formats']),
    },
  }
})
