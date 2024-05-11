const dotenv = require("dotenv");
const mysql = require("mysql2/promise");
dotenv.config();

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectTimeout: 60000,
};

async function query(sql, params) {
  const connection = await mysql.createConnection(config);
  const [results] = await connection.execute(sql, params);

  return results;
}

module.exports = { query };
