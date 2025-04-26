const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './database.sqlite';

// Создаем соединение с базой данных
const db = new Database(dbPath, { verbose: console.log });

module.exports = db; 