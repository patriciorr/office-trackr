const {createDefaultPreset} = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    ...tsJestTransformCfg,
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    // Pure wiring with no branch logic of its own; exercised end-to-end by the e2e suite instead.
    '!src/app.ts',
    '!src/index.ts',
    '!src/sockets.ts',
    '!src/routes/**/*.ts',
  ],
  coverageDirectory: 'coverage/unit',
  coverageReporters: ['text', 'lcov'],
  testMatch: ['**/test/unit/**/*.test.ts'],
};
