module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testRegex: '.*\\.e2e-spec\\.ts$',
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/', '<rootDir>/src/'],
  roots: ['<rootDir>/test/'],
  globalSetup: '<rootDir>/test/global-setup.ts',
  globalTeardown: '<rootDir>/test/global-teardown.ts',
    moduleNameMapper: {
    '^@jsp/shared(.*)$': '<rootDir>/../shared/src$1',
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};