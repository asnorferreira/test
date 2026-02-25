module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.e2e(-|\\.)spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../src/$1',
    '^@maemais/shared-types$': '<rootDir>/../../packages/shared-types/src/index.ts',
    '^@maemais/shared-types/(.*)$': '<rootDir>/../../packages/shared-types/src/$1'
  },
};