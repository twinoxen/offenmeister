import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Only the pure, runtime-independent logic is unit-tested here. These tests
    // need no Convex backend or network and form the primary automated gate.
    include: ['convex/lib/**/*.test.ts'],
    environment: 'node',
  },
})
