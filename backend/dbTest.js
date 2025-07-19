require('dotenv').config();
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

connection.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    process.exit(1);
  }
  console.log('Connected to database successfully.');
  
  // Optional: run a simple test query
  connection.query('SELECT 1 + 1 AS result', (err, results) => {
    if (err) throw err;
    console.log('Test query result:', results[0].result);
    connection.end(); // Only end after queries are done
  });
});
