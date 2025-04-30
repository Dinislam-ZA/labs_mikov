const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './database.sqlite';

// Проверяем, существует ли директория для базы данных
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Удаляем существующую базу данных, если она существует
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

// Создаем новую базу данных
const db = new Database(dbPath);

// SQL для инициализации базы данных
const initSQL = `
BEGIN TRANSACTION; 
DROP TABLE IF EXISTS workshops; 
CREATE TABLE IF NOT EXISTS workshops ( 
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  name TEXT 
); 

DROP TABLE IF EXISTS users; 
CREATE TABLE IF NOT EXISTS users ( 
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  name TEXT NOT NULL UNIQUE, 
  password TEXT NOT NULL, 
  role INTEGER NOT NULL DEFAULT 0, 
  workshop INTEGER, 
  FOREIGN KEY(workshop) REFERENCES workshops(id) 
); 
INSERT INTO users VALUES (1, 'admin', '123', 2, NULL); 

DROP TABLE IF EXISTS datasets; 
CREATE TABLE IF NOT EXISTS datasets ( 
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
  name TEXT, 
  M INTEGER, 
  N INTEGER, 
  data TEXT, 
  workshop INTEGER, 
  FOREIGN KEY(workshop) REFERENCES workshops(id) 
); 
INSERT INTO datasets VALUES (1, 'test1', 3, 2, '1;2;3;4;5;6', NULL); 
INSERT INTO datasets VALUES (2, 'test2', NULL, 4, NULL, NULL); 

-- Добавим тестовых пользователей разных ролей
INSERT INTO workshops VALUES (1, 'Цех №1');
INSERT INTO workshops VALUES (2, 'Цех №2');

-- Добавим диспетчера
INSERT INTO users VALUES (2, 'dispatcher', '123', 1, NULL);

-- Добавим начальников цехов
INSERT INTO users VALUES (3, 'workshop1', '123', 0, 1);
INSERT INTO users VALUES (4, 'workshop2', '123', 0, 2);

COMMIT;
`;

// Выполняем SQL запрос
db.exec(initSQL);

console.log('База данных успешно инициализирована');

// Закрываем соединение с базой данных
db.close(); 