const {startMongoContainer} = require('../docker/mongoContainer');

module.exports = async function globalSetup() {
  const {containerName, uri} = await startMongoContainer('office-trackr-mongo-e2e', 'office-trackr-e2e-test');

  // Stored on global so globalTeardown (same process) can remove it again.
  global.__MONGO_CONTAINER_NAME__ = containerName;
  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = 'e2e-test-secret';
};
