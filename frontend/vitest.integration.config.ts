import {defineConfig, mergeConfig} from 'vitest/config';
import viteConfig from './vite.config.js';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./test/setupTests.ts'],
      include: ['test/integration/**/*.test.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov'],
        reportsDirectory: 'coverage/integration',
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/main.tsx', 'src/index.tsx', 'src/vite-env.d.ts', 'src/locales/**'],
      },
    },
  })
);
