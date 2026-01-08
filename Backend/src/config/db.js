const mysql = require('mysql2');
const config = require('./env');

const pool = mysql.createPool(config.db);

// Convert pool to allow using async/await
const promisePool = pool.promise();

const testConnection = async () => {
    try {
        const [rows] = await promisePool.query('SELECT 1');
        console.log('Database connected successfully.');
    } catch (error) {
        console.error('Database connection failed:', error);
        console.error('Connection details:', {
            host: config.db.host,
            user: config.db.user,
            port: config.db.port,
            database: config.db.database
        });
        process.exit(1);
    }
};

module.exports = {
    pool: promisePool,
    testConnection
};
