/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',

  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],

  // DB setup/teardown
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],

  // Treat TS as ESM
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'js'],

  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        isolatedModules: true, // (ts-jest warns; optional to also set in tsconfig)
        tsconfig: './tsconfig.json'
      }
    ]
  },

  // REMOVE the old moduleNameMapper that tried to rewrite ".js"
  // moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },

  clearMocks: true,
  restoreMocks: true,
  testTimeout: 30000
};
