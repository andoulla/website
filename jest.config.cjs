module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '<rootDir>/.claude/worktrees/'],
  modulePathIgnorePatterns: ['<rootDir>/.claude/worktrees/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  coverageReporters: ['text', 'text-summary', 'json-summary', 'lcov', 'html'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|svg|gif|webp)$': '<rootDir>/jest/fileMock.cjs',
    '^@vercel/analytics/react$': '<rootDir>/jest/vercelAnalyticsMock.cjs',
    '^@vercel/speed-insights/react$': '<rootDir>/jest/vercelSpeedInsightsMock.cjs',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
