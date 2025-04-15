import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Include normal test files
    include: ['src/**/*.spec.ts'],
    // Specify benchmark files pattern
    benchmark: {
      include: ['bench/**/*.bench.ts'],
      outputFile: './bench/report.json', // Optional: Output benchmark results to a file
      // reporters: ['verbose'], // Use verbose reporter for benchmarks
    },
  },
});
