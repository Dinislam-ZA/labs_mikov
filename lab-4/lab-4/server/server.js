const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Загружаем переменные окружения из файла .env
dotenv.config();

// Импортируем маршруты
const authRoutes = require('./routes/auth');
const datasetsRoutes = require('./routes/datasets');
const workshopsRoutes = require('./routes/workshops');
const usersRoutes = require('./routes/users');

// Создаем приложение Express
const app = express();

// Устанавливаем порт
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/datasets', datasetsRoutes);
app.use('/api/workshops', workshopsRoutes);
app.use('/api/users', usersRoutes);

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Что-то пошло не так на сервере!' });
});

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
}); 