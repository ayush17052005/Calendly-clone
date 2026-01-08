const app = require('./app');
const config = require('./config/env');
const { testConnection } = require('./config/db');

const startServer = async () => {
  await testConnection();

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
};

startServer();
