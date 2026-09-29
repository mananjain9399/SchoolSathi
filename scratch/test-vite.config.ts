import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'scratch/dist',
    lib: {
      entry: resolve(__dirname, 'run_test.ts'),
      formats: ['es'],
      fileName: () => 'bundle_test.mjs',
    },
    rollupOptions: {
      external: ['fs', 'path', 'url'],
    },
    emptyOutDir: true,
  },
});
