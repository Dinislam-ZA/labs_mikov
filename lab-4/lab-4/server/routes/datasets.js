const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware, dispatcherMiddleware } = require('../middleware/auth');
const db = require('../db');

// Хранилище датасетов в памяти (аналог HashMap в Java-примере)
const datasets = {
  'Dataset 1': generateRandomDataset(10, 8),
  'Dataset 2': generateRandomDataset(10, 8),
  'Dataset 3': generateRandomDataset(10, 8)
};

// Хранилище для соответствия датасетов и цехов
const datasetWorkshops = {
  'Dataset 1': null,
  'Dataset 2': null,
  'Dataset 3': null
};

// Функция для генерации случайных данных для датасета
function generateRandomDataset(rows, cols) {
  const data = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    row.push(`D${i + 1}`); // Прод
    row.push(`i${Math.floor(Math.random() * 26)}`); // Шифр_п
    row.push(`j${Math.floor(Math.random() * 26)}`); // Шифр_ц
    row.push(`c${Math.floor(Math.random() * 26)}`); // Шифр_пц
    
    // Орган_н_п
    row.push(String.fromCharCode(97 + Math.floor(Math.random() * 26)));
    
    // Орган_в_п
    row.push(String.fromCharCode(97 + Math.floor(Math.random() * 26)));
    
    // План_пц
    row.push(Math.floor(Math.random() * 100));
    
    // Приб_пц
    row.push(Math.floor(Math.random() * 100));
    
    data.push(row);
  }
  return data;
}

// Получение списка всех датасетов
router.post('/list', authMiddleware, (req, res) => {
  res.json({
    datasets: Object.keys(datasets)
  });
});

// Получение данных конкретного датасета
router.post('/get', authMiddleware, (req, res) => {
  const { name } = req.body;
  
  if (!name || !datasets[name]) {
    return res.status(404).json({ message: 'Датасет не найден' });
  }
  
  res.json({
    name: name,
    data: datasets[name],
    workshopId: datasetWorkshops[name]
  });
});

// Сохранение данных датасета
router.post('/save', authMiddleware, (req, res) => {
  const { name, data } = req.body;
  
  if (!name || !data) {
    return res.status(400).json({ message: 'Неверные данные для сохранения' });
  }
  
  datasets[name] = data;
  
  res.json({
    message: 'Датасет успешно сохранен',
    name: name
  });
});

// Обновление датасета (переименование и привязка к цеху)
router.post('/update', authMiddleware, dispatcherMiddleware, (req, res) => {
  const { oldName, newName, workshopId } = req.body;
  
  if (!oldName || !newName || !datasets[oldName]) {
    return res.status(400).json({ message: 'Неверные данные для обновления датасета' });
  }
  
  // Проверяем существование цеха, если указан ID
  if (workshopId) {
    try {
      const workshop = db.prepare('SELECT * FROM workshops WHERE id = ?').get(workshopId);
      if (!workshop) {
        return res.status(404).json({ message: 'Указанный цех не найден' });
      }
    } catch (error) {
      console.error('Ошибка при проверке цеха:', error);
      return res.status(500).json({ message: 'Ошибка сервера при обновлении датасета' });
    }
  }
  
  // Переименовываем датасет, если имя изменилось
  if (oldName !== newName) {
    datasets[newName] = datasets[oldName];
    delete datasets[oldName];
  }
  
  // Обновляем привязку к цеху
  datasetWorkshops[newName] = workshopId || null;
  
  res.json({
    message: 'Датасет успешно обновлен',
    name: newName,
    workshopId: datasetWorkshops[newName]
  });
});

// Переименование датасета
router.post('/rename', authMiddleware, dispatcherMiddleware, (req, res) => {
  const { oldName, newName } = req.body;
  
  if (!oldName || !newName || !datasets[oldName]) {
    return res.status(400).json({ message: 'Неверные данные для переименования' });
  }
  
  datasets[newName] = datasets[oldName];
  datasetWorkshops[newName] = datasetWorkshops[oldName];
  delete datasets[oldName];
  delete datasetWorkshops[oldName];
  
  res.json({
    message: 'Датасет успешно переименован',
    name: newName
  });
});

// Создание нового датасета (доступно только для администратора)
router.post('/create', authMiddleware, adminMiddleware, (req, res) => {
  const { rows, cols } = req.body;
  
  if (!rows || !cols || isNaN(rows) || isNaN(cols)) {
    return res.status(400).json({ message: 'Неверные данные для создания датасета' });
  }
  
  const newName = `Dataset ${Object.keys(datasets).length + 1}`;
  datasets[newName] = generateRandomDataset(parseInt(rows), parseInt(cols));
  datasetWorkshops[newName] = null;
  
  res.json({
    message: 'Датасет успешно создан',
    name: newName
  });
});

module.exports = router; 