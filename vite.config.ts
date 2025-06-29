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
import manifest from './src/manifest.json'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  const env = loadEnv(mode, process.cwd());

  const hbPluginOptions = {
    apiKey: env.VITE_HONEYBADGER_API_KEY,
    assetsUrl: 'https://lisudoku.xyz',
    environment: mode,
    deploy: true,
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
      topLevelAwait(),
      VitePWA({
        registerType: 'autoUpdate',
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
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
          // Note: removing this step for now as they don't work properly
          // honeybadgerRollupPlugin(hbPluginOptions)
        ] : [],
      }
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
    },
  }
})
