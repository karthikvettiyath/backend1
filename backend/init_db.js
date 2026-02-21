const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

const client = new Client({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to database.');

        const sqlPath = path.join(__dirname, 'db_setup.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running SQL setup...');
        await client.query(sql);
        console.log('Database setup completed successfully.');
    } catch (err) {
        console.error('Error executing SQL:', err);
    } finally {
        await client.end();
    }
}

run();
