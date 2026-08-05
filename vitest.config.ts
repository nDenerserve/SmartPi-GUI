import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vite'
import { configDefaults, defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig, // reuse the app's Vite plugins/aliases so tests resolve modules the same way as the build
  defineConfig({
    test: {
      environment: 'jsdom', // simulate a browser DOM for component tests
      exclude: [...configDefaults.exclude, 'e2e/*'], // e2e tests run separately, not via vitest
      root: fileURLToPath(new URL('./', import.meta.url)),
      transformMode: {
        web: [/\.[jt]sx$/] // treat .jsx/.tsx as browser (web) code rather than SSR
      }
    }
  })
)
