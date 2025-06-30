import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-preset-angular',
  testMatch: ['**/*.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  globalSetup: 'jest-preset-angular/global-setup.mjs',
  testEnvironment: 'jsdom',
};

export default config;
