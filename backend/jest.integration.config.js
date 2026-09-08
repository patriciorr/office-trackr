const {createDefaultPreset} = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    ...tsJestTransformCfg,
  },
  testMatch: ['**/test/integration/**/*.test.ts'],
  globalSetup: '<rootDir>/test/integration/globalSetup.js',
  globalTeardown: '<rootDir>/test/integration/globalTeardown.js',
  setupFilesAfterEnv: ['<rootDir>/test/integration/setupTests.ts'],
  testTimeout: 30000,
  // A single shared MongoDB container is used, so tests must run sequentially.
  maxWorkers: 1,
  collectCoverage: true,
  collectCoverageFrom: ['src/repositories/**/*.ts', 'src/services/**/*.ts'],
  coverageDirectory: 'coverage/integration',
  coverageReporters: ['text', 'lcov'],
};
