/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",   // TypeScript handled by ts-jest
    "^.+\\.(js|jsx)$": "babel-jest" // JS/JSX handled by babel-jest
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  testMatch: [
    "**/__tests__/**/*.(spec|test).[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{ts,tsx,js,jsx}",
    "!src/pages/_app.tsx",
    "!src/pages/_document.tsx",
    "!src/index.js",
    "!src/**/index.ts",
    "!src/**/index.tsx"
  ],
  coverageDirectory: "coverage",
  testTimeout: 30000,
};
