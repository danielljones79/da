const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'test',
  database: 'insurance',
  port: 3308
};

let connection;

async function connect() {
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Database connected');
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
}

async function disconnect() {
  try {
    await connection.end();
    console.log('Database disconnected');
  } catch (error) {
    console.error('Error disconnecting from database:', error);
  }
}

async function healthCheck() {
  try {
    await connection.execute('SELECT 1');
    return true;
  } catch (error) {
    return false;
  }
}

async function executeQuery(query, params) {
  try {
    const [rows] = await connection.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

module.exports = { connect, disconnect, executeQuery, healthCheck };
