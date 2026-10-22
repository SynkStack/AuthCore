const app = require('./app');
const { port } = require('./config/env');

app.listen(port, () => {
  console.log(`AuthCore listening on port ${port}`);
});