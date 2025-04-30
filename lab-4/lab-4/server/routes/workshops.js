const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, adminMiddleware, dispatcherMiddleware } = require('../middleware/auth');

// Получение всех цехов (доступно всем авторизованным пользователям)
router.post('/', authMiddleware, (req, res) => {
  try {
    const workshops = db.prepare('SELECT * FROM workshops').all();
    res.json(workshops);
  } catch (error) {
    console.error('Ошибка при получении списка цехов:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении списка цехов' });
  }
});

// Получение конкретного цеха по ID
router.post('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const workshop = db.prepare('SELECT * FROM workshops WHERE id = ?').get(id);
    
    if (!workshop) {
      return res.status(404).json({ message: 'Цех не найден' });
    }
    
    res.json(workshop);
  } catch (error) {
    console.error('Ошибка при получении информации о цехе:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении информации о цехе' });
  }
});

// Создание нового цеха (доступно только администратору)
router.post('/create', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Название цеха обязательно' });
    }
    
    // Проверяем, существует ли цех с таким именем
    const existingWorkshop = db.prepare('SELECT * FROM workshops WHERE name = ?').get(name);
    
    if (existingWorkshop) {
      return res.status(400).json({ message: 'Цех с таким названием уже существует' });
    }
    
    const info = db.prepare('INSERT INTO workshops (name) VALUES (?)').run(name);
    const newWorkshop = db.prepare('SELECT * FROM workshops WHERE id = ?').get(info.lastInsertRowid);
    
    res.status(201).json(newWorkshop);
  } catch (error) {
    console.error('Ошибка при создании цеха:', error);
    res.status(500).json({ message: 'Ошибка сервера при создании цеха' });
  }
});

// Обновление цеха (доступно только администратору)
router.post('/update/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Название цеха обязательно' });
    }
    
    // Проверяем, существует ли цех с таким ID
    const existingWorkshop = db.prepare('SELECT * FROM workshops WHERE id = ?').get(id);
    
    if (!existingWorkshop) {
      return res.status(404).json({ message: 'Цех не найден' });
    }
    
    // Проверяем, существует ли другой цех с таким именем
    const existingWorkshopWithName = db.prepare('SELECT * FROM workshops WHERE name = ? AND id != ?').get(name, id);
    
    if (existingWorkshopWithName) {
      return res.status(400).json({ message: 'Цех с таким названием уже существует' });
    }
    
    db.prepare('UPDATE workshops SET name = ? WHERE id = ?').run(name, id);
    const updatedWorkshop = db.prepare('SELECT * FROM workshops WHERE id = ?').get(id);
    
    res.json(updatedWorkshop);
  } catch (error) {
    console.error('Ошибка при обновлении цеха:', error);
    res.status(500).json({ message: 'Ошибка сервера при обновлении цеха' });
  }
});

// Удаление цеха (доступно только администратору)
router.post('/delete/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверяем, существует ли цех с таким ID
    const existingWorkshop = db.prepare('SELECT * FROM workshops WHERE id = ?').get(id);
    
    if (!existingWorkshop) {
      return res.status(404).json({ message: 'Цех не найден' });
    }
    
    // Проверяем, есть ли датасеты, связанные с этим цехом
    const associatedDatasets = db.prepare('SELECT COUNT(*) as count FROM datasets WHERE workshop = ?').get(id);
    
    if (associatedDatasets.count > 0) {
      return res.status(400).json({ 
        message: 'Невозможно удалить цех, так как с ним связаны датасеты' 
      });
    }
    
    // Проверяем, есть ли пользователи, связанные с этим цехом
    const associatedUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE workshop = ?').get(id);
    
    if (associatedUsers.count > 0) {
      return res.status(400).json({ 
        message: 'Невозможно удалить цех, так как с ним связаны пользователи' 
      });
    }
    
    db.prepare('DELETE FROM workshops WHERE id = ?').run(id);
    
    res.json({ message: 'Цех успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении цеха:', error);
    res.status(500).json({ message: 'Ошибка сервера при удалении цеха' });
  }
});

module.exports = router; 