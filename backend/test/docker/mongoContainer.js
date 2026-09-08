const {execFileSync} = require('child_process');
const {MongoClient} = require('mongodb');

const IMAGE = 'mongo:7';
const READY_TIMEOUT_MS = 30000;
const READY_INTERVAL_MS = 500;

function docker(args) {
  return execFileSync('docker', args, {encoding: 'utf-8'}).trim();
}

function removeStaleContainers(label) {
  const staleIds = docker(['ps', '-aq', '--filter', `label=${label}`]);
  if (staleIds) {
    docker(['rm', '-f', '-v', ...staleIds.split('\n')]);
  }
}

async function waitUntilReady(uri) {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  let lastError;
  while (Date.now() < deadline) {
    const client = new MongoClient(uri, {serverSelectionTimeoutMS: READY_INTERVAL_MS});
    try {
      await client.connect();
      await client.db().command({ping: 1});
      return;
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, READY_INTERVAL_MS));
    } finally {
      await client.close().catch(() => {});
    }
  }
  throw new Error(`Timed out waiting for the MongoDB test container to become ready: ${lastError}`);
}

/**
 * Starts an isolated, disposable MongoDB container for a test suite.
 * `namePrefix` and `label` must be unique per suite so concurrent suites
 * (e.g. integration + e2e) never touch each other's containers.
 */
async function startMongoContainer(namePrefix, label) {
  try {
    docker(['version']);
  } catch {
    throw new Error('Docker is required to run these tests but is not available.');
  }

  removeStaleContainers(label);

  const containerName = `${namePrefix}-${process.pid}-${Date.now()}`;
  docker(['run', '-d', '--name', containerName, '--label', `${label}=true`, '-p', '127.0.0.1::27017', IMAGE]);

  try {
    const portMapping = docker(['port', containerName, '27017/tcp']);
    const hostPort = portMapping.split(':').pop();
    const uri = `mongodb://127.0.0.1:${hostPort}/${namePrefix}`;

    await waitUntilReady(uri);

    return {containerName, uri};
  } catch (error) {
    docker(['rm', '-f', '-v', containerName]);
    throw error;
  }
}

function stopMongoContainer(containerName) {
  if (!containerName) return;
  // -v also removes the anonymous volumes the mongo image declares for /data/db and /data/configdb.
  execFileSync('docker', ['rm', '-f', '-v', containerName], {stdio: 'ignore'});
}

module.exports = {startMongoContainer, stopMongoContainer};
