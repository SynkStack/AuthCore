// Runs before every test file, BEFORE the app is loaded.
require('dotenv').config();

const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl) {
  throw new Error('TEST_DATABASE_URL is not set');
}

// Safety guard: tests wipe tables, so they must never touch the dev database.
if (!/_test(\?.*)?$/.test(testUrl)) {
  throw new Error('TEST_DATABASE_URL must point to a database whose name ends with _test');
}

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = testUrl; // the app now talks to the test database
process.env.JWT_ACCESS_SECRET =
process.env.JWT_ACCESS_SECRET || 'test-only-secret-not-for-production';
process.env.LOGIN_RATE_LIMIT = '5'; // small limit so the rate-limit test is quick