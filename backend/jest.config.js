const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: { "^.+\\.[tj]sx?$": "ts-jest" },

  // Recognize these file extensions
  moduleFileExtensions: ["ts", "js", "json"],

  // Automatically find tests
  testMatch: ["**/__tests__/**/*.spec.ts", "**/?(*.)+(spec|test).ts"],

  // Clear mocks between tests
  clearMocks: true,

  // Collect coverage (optional, but recommended)
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.(t|j)s", "!src/main.ts", "!src/**/index.ts"],
  coverageDirectory: "coverage",

  // Helpful for debugging async issues
  testTimeout: 30000,
};
