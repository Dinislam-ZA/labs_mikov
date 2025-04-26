const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Получение всех пользователей (доступно только администратору)
router.post('/', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const users = db.prepare(`
      SELECT u.id, u.name, u.role, u.workshop, w.name as workshop_name 
      FROM users u 
      LEFT JOIN workshops w ON u.workshop = w.id
    `).all();
    
    // Удаляем пароли из ответа
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    
    res.json(safeUsers);
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении пользователей' });
  }
});

// Получение пользователя по ID (доступно только администратору)
router.post('/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    
    const user = db.prepare(`
      SELECT u.id, u.name, u.role, u.workshop, w.name as workshop_name 
      FROM users u 
      LEFT JOIN workshops w ON u.workshop = w.id
      WHERE u.id = ?
    `).get(id);
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    // Удаляем пароль из ответа
    const { password, ...safeUser } = user;
    
    res.json(safeUser);
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении пользователя' });
  }
});

// Создание нового пользователя (доступно только администратору)
router.post('/create', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { name, password, role, workshop } = req.body;
    
    if (!name || !password) {
      return res.status(400).json({ message: 'Имя пользователя и пароль обязательны' });
    }
    
    // Проверяем, существует ли пользователь с таким именем
    const existingUser = db.prepare('SELECT * FROM users WHERE name = ?').get(name);
    
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким именем уже существует' });
    }
    
    // Если указан workshop, проверяем его существование
    if (workshop) {
      const existingWorkshop = db.prepare('SELECT * FROM workshops WHERE id = ?').get(workshop);
      
      if (!existingWorkshop) {
        return res.status(400).json({ message: 'Указанный цех не существует' });
      }
    }
    
    const info = db.prepare(
      'INSERT INTO users (name, password, role, workshop) VALUES (?, ?, ?, ?)'
    ).run(name, password, role || 0, workshop || null);
    
    const newUser = db.prepare(`
      SELECT u.id, u.name, u.role, u.workshop, w.name as workshop_name 
      FROM users u 
      LEFT JOIN workshops w ON u.workshop = w.id
      WHERE u.id = ?
    `).get(info.lastInsertRowid);
    
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Ошибка при создании пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера при создании пользователя' });
  }
});

// Обновление пользователя (доступно только администратору)
router.post('/update/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { name, password, role, workshop } = req.body;
    
    // Проверяем, существует ли пользователь
    const existingUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    
    if (!existingUser) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    // Проверяем, существует ли пользователь с таким именем
    if (name && name !== existingUser.name) {
      const existingUserWithName = db.prepare('SELECT * FROM users WHERE name = ? AND id != ?').get(name, id);
      
      if (existingUserWithName) {
        return res.status(400).json({ message: 'Пользователь с таким именем уже существует' });
      }
    }
    
    // Если указан workshop, проверяем его существование
    if (workshop) {
      const existingWorkshop = db.prepare('SELECT * FROM workshops WHERE id = ?').get(workshop);
      
      if (!existingWorkshop) {
        return res.status(400).json({ message: 'Указанный цех не существует' });
      }
    }
    
    // Формируем SQL запрос и параметры в зависимости от переданных полей
    let updateSQL = 'UPDATE users SET';
    const updateParams = [];
    
    if (name) {
      updateSQL += ' name = ?,';
      updateParams.push(name);
    }
    
    if (password) {
      updateSQL += ' password = ?,';
      updateParams.push(password);
    }
    
    if (role !== undefined) {
      updateSQL += ' role = ?,';
      updateParams.push(role);
    }
    
    updateSQL += ' workshop = ?';
    updateParams.push(workshop === undefined ? existingUser.workshop : workshop);
    
    updateSQL += ' WHERE id = ?';
    updateParams.push(id);
    
    db.prepare(updateSQL).run(...updateParams);
    
    const updatedUser = db.prepare(`
      SELECT u.id, u.name, u.role, u.workshop, w.name as workshop_name 
      FROM users u 
      LEFT JOIN workshops w ON u.workshop = w.id
      WHERE u.id = ?
    `).get(id);
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Ошибка при обновлении пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера при обновлении пользователя' });
  }
});

// Удаление пользователя (доступно только администратору)
router.post('/delete/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверяем, существует ли пользователь
    const existingUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    
    if (!existingUser) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    // Не даем удалить последнего администратора
    if (existingUser.role === 2) {
      const adminCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = 2').get();
      
      if (adminCount.count <= 1) {
        return res.status(400).json({ message: 'Невозможно удалить последнего администратора' });
      }
    }
    
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    
    res.json({ message: 'Пользователь успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера при удалении пользователя' });
  }
});

module.exports = router; 