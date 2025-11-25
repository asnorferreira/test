module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  roots: ['<rootDir>/apps/'],
  moduleNameMapper: {
    '^@/api-gateway/(.*)$': '<rootDir>/apps/api-gateway/src/$1',
    '^@/ingestor/(.*)$': '<rootDir>/apps/ingestor/src/$1',
    '^@/policy-service/(.*)$': '<rootDir>/apps/policy-service/src/$1',
    '^@/prisma/(.*)$': '<rootDir>/libs/prisma/$1',
    '^@/ts-shared/(.*)$': '<rootDir>/libs/ts-shared/src/$1',
    '^@/state-machine/(.*)$': '<rootDir>/libs/state-machine/src/$1',
    '^@/rules-engine/(.*)$': '<rootDir>/libs/rules-engine/src/$1',
  },
  collectCoverageFrom: [
    '**/src/**/*.service.ts',
    '**/src/**/*.controller.ts',
  ],  
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};