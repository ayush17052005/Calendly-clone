const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const run = async () => {
  const {
    DB_HOST, DB_PORT = '3306', DB_USER, DB_PASSWORD, DB_NAME, DB_SSL
  } = process.env;

  console.log(`Connecting to ${DB_HOST} as ${DB_USER}...`);

  const ssl =
    String(DB_SSL).toLowerCase() === 'true'
      ? { rejectUnauthorized: true }
      : undefined;

  try {
    const conn = await mysql.createConnection({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      ssl,
      multipleStatements: true
    });

    console.log('Connected!');

    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const seedPath = path.join(__dirname, '../database/seed.sql');

    const schema = fs.readFileSync(schemaPath, 'utf8');
    const seed = fs.readFileSync(seedPath, 'utf8');

    console.log('Running schema...');
    await conn.query(schema);
    console.log('Schema executed.');

    console.log('Running seed...');
    await conn.query(seed);
    console.log('Seed executed.');

    await conn.end();
    console.log('Migration complete!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

run();
