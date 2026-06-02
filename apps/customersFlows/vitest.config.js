import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: 'src',
  test: {
    globals: false,
    include: ['**/__tests__/**/*.test.js'],
  },
})
