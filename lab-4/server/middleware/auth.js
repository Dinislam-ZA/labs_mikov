const db = require('../db');

// Middleware для проверки пользователя
const authMiddleware = (req, res, next) => {
  try {
    // Получаем данные пользователя из тела запроса
    const user = req.body.user;
    
    if (!user || !user.username) {
      return res.status(401).json({ message: 'Доступ запрещен. Необходима аутентификация' });
    }
    
    // Добавляем данные пользователя в объект запроса
    req.user = user;
    
    // Продолжаем обработку запроса
    next();
  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Middleware для проверки роли администратора
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 2) {
    return res.status(403).json({ message: 'Доступ запрещен. Требуется роль администратора' });
  }
  next();
};

// Middleware для проверки роли диспетчера (operator)
const dispatcherMiddleware = (req, res, next) => {
  if (req.user.role !== 1 && req.user.role !== 2) {
    return res.status(403).json({ message: 'Доступ запрещен. Требуется роль диспетчера или выше' });
  }
  next();
};

// Middleware для проверки роли начальника цеха
const workshopHeadMiddleware = (req, res, next) => {
  // Начальники цехов, диспетчеры и администраторы имеют доступ
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  dispatcherMiddleware,
  workshopHeadMiddleware
}; 