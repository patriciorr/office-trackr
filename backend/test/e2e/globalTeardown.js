const {stopMongoContainer} = require('../docker/mongoContainer');

module.exports = async function globalTeardown() {
  stopMongoContainer(global.__MONGO_CONTAINER_NAME__);
};
