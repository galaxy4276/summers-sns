import { Config } from '@jest/types'

const jestConfig: Config.InitialOptions = {
  rootDir: './',
  roots: ['./test/'],
  moduleFileExtensions: ['json', 'ts', 'js'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testRegex: '.test.ts$',
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  moduleNameMapper: {
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
    '^@typings/(.*)$': '<rootDir>/typings/$1',
  },
};

export default jestConfig;
