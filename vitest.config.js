import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true, // Use global test functions like `describe`, `it`, `expect`
    include: ['test/**/*.test.js'], // Match your test files in `test/`
    environment: 'node', // Use Node.js environment
    coverage: {
      provider: 'v8', // or v8
      reporter: ['text', 'json', 'html']
    },
    deps: {
      interopDefault: true
    }
  }
})
