const app = require('./app');
const pool = require('./db/pool');
const { port } = require('./config/env');

const server = app.listen(port, () => {
  console.log(`AuthCore listening on port ${port}`);
});

// Docker and hosting platforms send SIGTERM when stopping the container.
// Stop taking new requests, let running ones finish, close the DB pool, then exit.
function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
  // Safety net: force an exit if something hangs.
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));