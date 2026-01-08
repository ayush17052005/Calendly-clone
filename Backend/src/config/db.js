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
        process.exit(1);
    }
};

module.exports = {
    pool: promisePool,
    testConnection
};
