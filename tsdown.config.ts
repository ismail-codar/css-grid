import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: false,
  minify: true,
  clean: true,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
})
