const {createDefaultPreset} = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    ...tsJestTransformCfg,
  },
  testMatch: ['**/test/e2e/**/*.test.ts'],
  globalSetup: '<rootDir>/test/e2e/globalSetup.js',
  globalTeardown: '<rootDir>/test/e2e/globalTeardown.js',
  setupFilesAfterEnv: ['<rootDir>/test/e2e/setupTests.ts'],
  testTimeout: 30000,
  // A single shared MongoDB container is used, so tests must run sequentially.
  maxWorkers: 1,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/app.ts',
    'src/sockets.ts',
    'src/controllers/**/*.ts',
    'src/routes/**/*.ts',
    'src/middleware/**/*.ts',
    'src/services/**/*.ts',
    'src/repositories/**/*.ts',
  ],
  coverageDirectory: 'coverage/e2e',
  coverageReporters: ['text', 'lcov'],
};
