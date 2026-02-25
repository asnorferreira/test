import type { Config } from "jest";

const config: Config = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["src/**/*.(t|j)s"],
  coverageDirectory: "./coverage",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@maemais/shared-types$":
      "<rootDir>/../../packages/shared-types/src/index.ts",
    "^@maemais/shared-types/(.*)$":
      "<rootDir>/../../packages/shared-types/src/$1",
  },
};

export default config;
