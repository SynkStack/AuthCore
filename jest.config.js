module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/tests/setup-env.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/server.js', '!src/db/migrate.js'],
};