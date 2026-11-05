// Last-resort handler: log details on the server, send a generic message to the client.
module.exports = (err, req, res, next) => {
  const status = err.status && err.status < 500 ? err.status : 500;
  if (status === 500) console.error(err);
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : 'Invalid request',
  });
};
