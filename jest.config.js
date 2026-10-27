const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Next.js 앱의 경로를 지정
  dir: './',
});

// Jest에 전달할 사용자 정의 설정
const customJestConfig = {
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',

    // Handle CSS imports (without CSS modules)
    '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',

    // Handle image imports
    '^.+\\.(jpg|jpeg|png|gif|webp|avif|svg)$': '<rootDir>/__mocks__/fileMock.js',

    // Handle module aliases
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/', 
    '<rootDir>/.next/',
    '<rootDir>/__tests__/types.d.ts'
  ],
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    // Use babel-jest to transpile tests with the next/babel preset
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
};

module.exports = async () => {
  const config = await createJestConfig(customJestConfig)();

  // sanitize-html 2.18 uses ESM-only parser dependencies. Apply this after
  // next/jest, which otherwise always excludes node_modules from transforms.
  config.transformIgnorePatterns = [
    '/node_modules/(?!(?:geist|sanitize-html|htmlparser2|dom-serializer|domelementtype|domhandler|domutils|entities)/)',
    '^.+\\.module\\.(css|sass|scss)$',
  ];

  return config;
};
