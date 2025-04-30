const express = require('express');
const router = express.Router();
const db = require('../db');

// Маршрут для аутентификации пользователя
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Проверяем учетные данные (как в методе authenticate в Java-примере)
    if ((username === 'admin' && password === '123') || 
        (username === 'operator' && password === '321') || 
        (username.startsWith('foreman') && password === '456') ||
        (username.startsWith('foreman') && password === '678') ||
        (username.startsWith('foreman') && password === '890')) {
      
      // Определяем роль на основе имени пользователя
      let role = 0; // По умолчанию начальник цеха (foreman)
      if (username === 'admin') {
        role = 2; // Администратор
      } else if (username === 'operator') {
        role = 1; // Диспетчер (operator)
      }
      
      // Отправка информации о пользователе клиенту
      res.json({
        user: {
          id: Math.floor(Math.random() * 1000), // Генерируем случайный ID
          username: username,
          role: role,
          workshop: role === 0 ? 1 : null // Приписываем начальника цеха к первому цеху
        }
      });
    } else {
      return res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
    }
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ message: 'Ошибка сервера при аутентификации' });
  }
});

// Маршрут для получения информации о текущем пользователе
router.post('/me', (req, res) => {
  try {
    const { id, username } = req.body;
    
    if (!id || !username) {
      return res.status(401).json({ message: 'Необходимо предоставить данные пользователя' });
    }
    
    // Получаем актуальную информацию о пользователе из базы данных
    const user = db.prepare('SELECT id, name, role, workshop FROM users WHERE id = ? AND name = ?').get(id, username);
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    res.json({
      id: user.id,
      username: user.name,
      role: user.role,
      workshop: user.workshop
    });
  } catch (error) {
    console.error('Ошибка при получении информации о пользователе:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router; 