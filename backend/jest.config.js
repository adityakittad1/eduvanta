module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  testMatch: ['**/tests/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      diagnostics: false, // Type checking is handled by tsx/tsc; tests focus on runtime behavior
    }],
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
