module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/tests/setup/db.setup.js'],
    testMatch: ['**/tests/**/*.test.js'],
};
