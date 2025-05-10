const { Client } = require('pg');
require('dotenv').config();

async function testDbConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Successfully connected to the database!');
    
    console.log('Database connection info:');
    const dbResult = await client.query('SELECT current_database() as db_name');
    console.log(`Database Name: ${dbResult.rows[0].db_name}`);
    
    const schemaResult = await client.query('SELECT current_schema() as schema_name');
    console.log(`Schema Name: ${schemaResult.rows[0].schema_name}`);
    
    console.log('Tables in database:');
    const tableResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    if (tableResult.rows.length === 0) {
      console.log('No tables found. This appears to be a new database.');
    } else {
      tableResult.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await client.end();
    console.log('Connection closed');
  }
}

testDbConnection();