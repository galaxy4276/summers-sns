import { Config } from '@jest/types';

const jestConfig: Config.InitialOptions = {
  rootDir: './',
  moduleFileExtensions: ['json', 'tsx', 'jsx', 'js', 'ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx)?$': 'babel-jest',
    '^.+\\.(ts|tsx)?$': 'ts-jest',
  },
  testRegex: '.test.tsx$',
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },
};

export default jestConfig;
