import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const DatasetsPage = () => {
  const { user, isAdmin, isDispatcher, isForeman, addUserToRequest } = useAuth();

  console.log("isDispatcher", isDispatcher);
  console.log("isAdmin", isAdmin);
  console.log("isForeman", isForeman);  
  
  const [datasetList, setDatasetList] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [datasetData, setDatasetData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [workshops, setWorkshops] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [selectedWorkshop, setSelectedWorkshop] = useState('');
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [calculationResults, setCalculationResults] = useState(null);
  
  // Загрузка списка датасетов
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        setLoading(true);
        const response = await api.post('/datasets/list', addUserToRequest());
        setDatasetList(response.data.datasets);
        
        if (response.data.datasets.length > 0) {
          setSelectedDataset(response.data.datasets[0]);
        }
        
        setError('');
      } catch (error) {
        console.error('Ошибка при загрузке списка датасетов:', error);
        setError('Ошибка при загрузке списка датасетов');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDatasets();
  }, [addUserToRequest]);
  
  // Загрузка данных выбранного датасета
  useEffect(() => {
    const fetchDatasetData = async () => {
      if (!selectedDataset) return;
      
      try {
        setLoading(true);
        const response = await api.post('/datasets/get', addUserToRequest({ name: selectedDataset }));
        setDatasetData(response.data.data);
        setError('');
      } catch (error) {
        console.error('Ошибка при загрузке данных датасета:', error);
        setError('Ошибка при загрузке данных датасета');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDatasetData();
  }, [selectedDataset, addUserToRequest]);

  // Загрузка списка цехов
  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const response = await api.post('/workshops', addUserToRequest());
        setWorkshops(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке списка цехов:', error);
      }
    };
    
    fetchWorkshops();
  }, [addUserToRequest]);
  
  // Обработчик изменения выбранного датасета
  const handleDatasetChange = (e) => {
    setSelectedDataset(e.target.value);
  };
  
  // Обработчик нажатия на кнопку Сохранить
  const handleSave = async () => {
    try {
      setLoading(true);
      await api.post('/datasets/save', addUserToRequest({
        name: selectedDataset,
        data: datasetData
      }));
      setError('');
      alert('Датасет успешно сохранен');
    } catch (error) {
      console.error('Ошибка при сохранении датасета:', error);
      setError('Ошибка при сохранении датасета');
    } finally {
      setLoading(false);
    }
  };
  
  // Обработчик редактирования ячейки
  const handleCellChange = (rowIndex, colIndex, value) => {
    const newData = [...datasetData];
    newData[rowIndex][colIndex] = value;
    setDatasetData(newData);
  };
  
  // Обработчик нажатия на кнопку Редактировать
  const handleEdit = () => {
    setEditName(selectedDataset);
    setSelectedWorkshop(workshops.length > 0 ? workshops[0].id : '');
    setShowEditModal(true);
  };
  
  // Обработчик нажатия на кнопку Добавить
  const handleAdd = () => {
    openAddWindow();
  };
  
  // Обработчик нажатия на кнопку Рассчитать
  const handleCalculate = () => {
    if (datasetData.length === 0) {
      setError('Нет данных для расчета');
      return;
    }
    
    const results = calculateOptimization(datasetData);
    setCalculationResults(results);
    setShowCalculateModal(true);
  };
  
  // Функция для генерации случайного числа в заданном диапазоне
  const rand1 = (rfrom, rto) => {
    const d = Math.random();
    const value = rfrom + d * (rto - rfrom);
    const i = Math.round(value * 10);
    return i / 10;
  };
  
  // Функция для нахождения максимального значения в массиве
  const maxX = (val, size) => {
    if (size > 0) {
      return Math.max(...val.slice(0, size));
    }
    return 0;
  };
  
  // Функция для нахождения минимального значения в массиве
  const minX = (val, size) => {
    if (size > 0) {
      return Math.min(...val.slice(0, size));
    }
    return 0;
  };
  
  // Функция для расчета оптимизации
  const calculateOptimization = (data) => {
    // Константы
    const MMAX = 10;
    const NMAX = 10;
    const TMAX = 1;
    
    // Извлекаем размерности из данных
    const m = data.length; // количество строк
    const n = data[0].length; // количество столбцов
    
    if (m > MMAX || n > NMAX) {
      setError('Слишком большие размерности данных');
      return null;
    }
    
    // Создаем массивы для расчетов
    const A = Array(TMAX).fill().map(() => 
      Array(MMAX).fill().map(() => 
        Array(NMAX).fill(0)
      )
    );
    const C = Array(NMAX).fill(0);
    const DN = Array(NMAX).fill(0);
    const DV = Array(NMAX).fill(0);
    const DEL = Array(NMAX).fill(0);
    const BN = Array(MMAX).fill(0);
    const BV = Array(MMAX).fill(0);
    const Y = Array(MMAX).fill(0);
    const X = Array(NMAX).fill(0);
    const AX = Array(MMAX).fill(0);
    
    // Заполняем матрицу A данными из датасета
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        // Преобразуем значение в число, если оно не число
        const value = Number(data[i][j]);
        A[0][i][j] = isNaN(value) ? 0 : value;
      }
    }
    
    // Инициализируем план X (просто заполняем числами от 1 до n)
    for (let j = 0; j < n; j++) {
      X[j] = j + 1;
    }
    
    // Вычисляем AX
    for (let i = 0; i < m; i++) {
      AX[i] = 0;
      for (let j = 0; j < n; j++) {
        AX[i] += A[0][i][j] * X[j];
      }
    }
    
    // Вычисляем DN, DV, DEL
    for (let j = 0; j < n; j++) {
      const minXVal = minX(X.slice(0, n), n);
      const maxXVal = maxX(X.slice(0, n), n);
      const threshold1 = minXVal + 0.35 * (maxXVal - minXVal);
      const threshold2 = minXVal + 0.65 * (maxXVal - minXVal);
      
      if (X[j] < threshold1) {
        DN[j] = X[j];
        DV[j] = maxXVal;
        DEL[j] = rand1(
          DN[j] + 0.25 * (DV[j] - DN[j]),
          DN[j] + 0.45 * (DV[j] - DN[j])
        );
      } else if (X[j] <= threshold2) {
        DN[j] = minXVal;
        DV[j] = maxXVal;
        DEL[j] = (maxXVal - minXVal) / 2;
      } else {
        DN[j] = minXVal;
        DV[j] = X[j];
        DEL[j] = rand1(
          DN[j] + 0.55 * (DV[j] - DN[j]),
          DN[j] + 0.75 * (DV[j] - DN[j])
        );
      }
    }
    
    // Вычисляем BN, BV, Y
    for (let i = 0; i < m; i++) {
      const minAXVal = minX(AX.slice(0, m), m);
      const maxAXVal = maxX(AX.slice(0, m), m);
      const threshold1 = minAXVal + 0.35 * (maxAXVal - minAXVal);
      const threshold2 = minAXVal + 0.65 * (maxAXVal - minAXVal);
      
      if (AX[i] < threshold1) {
        BN[i] = AX[i];
        BV[i] = maxAXVal;
        Y[i] = rand1(
          BN[i] + 0.25 * (BV[i] - BN[i]),
          BN[i] + 0.45 * (BV[i] - BN[i])
        );
      } else if (AX[i] <= threshold2) {
        BN[i] = minAXVal;
        BV[i] = maxAXVal;
        Y[i] = (maxAXVal - minAXVal) / 2;
      } else {
        BN[i] = minAXVal;
        BV[i] = AX[i];
        Y[i] = rand1(
          BN[i] + 0.55 * (BV[i] - BN[i]),
          BN[i] + 0.75 * (BV[i] - BN[i])
        );
      }
    }
    
    // Вычисляем C и CX
    let CX = 0;
    for (let j = 0; j < n; j++) {
      C[j] = DEL[j];
      for (let i = 0; i < m; i++) {
        C[j] += A[0][i][j] * Y[i];
      }
      CX += C[j] * X[j];
    }
    
    // Формируем результаты
    return {
      C,
      CX,
      DN,
      DV,
      BN,
      BV,
      A: A[0],
      X,
      AX
    };
  };
  
  // Открытие окна добавления
  const openAddWindow = () => {
    const rows = prompt('Введите количество строк:', '10');
    const cols = prompt('Введите количество столбцов:', '8');
    
    if (rows && cols) {
      createDataset(rows, cols);
    }
  };
  
  // Закрыть модальное окно редактирования
  const closeEditModal = () => {
    setShowEditModal(false);
  };
  
  // Закрыть модальное окно расчетов
  const closeCalculateModal = () => {
    setShowCalculateModal(false);
  };
  
  // Сохранить изменения датасета
  const saveDatasetChanges = async () => {
    try {
      setLoading(true);
      await api.post('/datasets/update', addUserToRequest({
        oldName: selectedDataset,
        newName: editName,
        workshopId: selectedWorkshop
      }));
      
      // Обновляем список датасетов
      const response = await api.post('/datasets/list', addUserToRequest());
      setDatasetList(response.data.datasets);
      setSelectedDataset(editName);
      
      setError('');
      setShowEditModal(false);
      alert('Датасет успешно обновлен');
    } catch (error) {
      console.error('Ошибка при обновлении датасета:', error);
      setError('Ошибка при обновлении датасета');
    } finally {
      setLoading(false);
    }
  };
  
  // Переименование датасета
  const renameDataset = async (oldName, newName) => {
    try {
      setLoading(true);
      await api.post('/datasets/rename', addUserToRequest({
        oldName: oldName,
        newName: newName
      }));
      
      // Обновляем список датасетов
      const response = await api.post('/datasets/list', addUserToRequest());
      setDatasetList(response.data.datasets);
      setSelectedDataset(newName);
      
      setError('');
      alert('Датасет успешно переименован');
    } catch (error) {
      console.error('Ошибка при переименовании датасета:', error);
      setError('Ошибка при переименовании датасета');
    } finally {
      setLoading(false);
    }
  };
  
  // Создание датасета
  const createDataset = async (rows, cols) => {
    try {
      setLoading(true);
      const response = await api.post('/datasets/create', addUserToRequest({
        rows: rows,
        cols: cols
      }));
      
      // Обновляем список датасетов
      const listResponse = await api.post('/datasets/list', addUserToRequest());
      setDatasetList(listResponse.data.datasets);
      setSelectedDataset(response.data.name);
      
      setError('');
      alert('Датасет успешно создан');
    } catch (error) {
      console.error('Ошибка при создании датасета:', error);
      setError('Ошибка при создании датасета');
    } finally {
      setLoading(false);
    }
  };
  
  // Отображение компонента
  if (loading && !datasetData.length) {
    return <div className="flex justify-center items-center h-64"><div className="text-lg text-gray-500">Загрузка...</div></div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Управление датасетами</h1>
        <div className="text-sm text-gray-600">Вы вошли как: {user?.username}</div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="flex space-x-4 items-center mb-4">
        <div className="w-64">
          <label htmlFor="dataset" className="block text-sm font-medium text-gray-700 mb-2">
            Выберите датасет:
          </label>
          <select
            id="dataset"
            value={selectedDataset}
            onChange={handleDatasetChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {datasetList.map(dataset => (
              <option key={dataset} value={dataset}>{dataset}</option>
            ))}
          </select>
        </div>
        
        <div className="text-gray-700 font-medium">
          Выбранный датасет: {selectedDataset}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Прод</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Шифр_п</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Шифр_ц</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Шифр_пц</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Орган_н_п</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Орган_в_п</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">План_пц</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Приб_пц</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {datasetData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                    {isDispatcher() ? (
                      <span>{cell}</span>
                    ) : (
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        className="border-0 p-0 w-full focus:ring-0"
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex space-x-4">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Сохранить
        </button>
        
        <button
          onClick={handleEdit}
          disabled={!isAdmin}
          className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Редактировать
        </button>
        
        <button
          onClick={handleAdd}
          disabled={!isAdmin}
          className={`px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Добавить
        </button>
        
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          disabled={!isAdmin}
          onClick={handleCalculate}
        >
          Рассчитать
        </button>
      </div>

      {/* Модальное окно редактирования датасета */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Редактирование датасета</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="editName" className="block text-sm font-medium text-gray-700 mb-1">
                  Название датасета:
                </label>
                <input
                  type="text"
                  id="editName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="workshopSelect" className="block text-sm font-medium text-gray-700 mb-1">
                  Цех:
                </label>
                <select
                  id="workshopSelect"
                  value={selectedWorkshop}
                  onChange={(e) => setSelectedWorkshop(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {workshops.map(workshop => (
                    <option key={workshop.id} value={workshop.id}>{workshop.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Отмена
              </button>
              <button
                onClick={saveDatasetChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Сохранить изменения
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно результатов расчетов */}
      {showCalculateModal && calculationResults && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Результаты расчетов</h2>
            
            <div className="space-y-6">
              <div>
                <div className="bg-gray-100 p-3 rounded">
                  <p><span className="font-semibold">CX:</span> {calculationResults.CX.toFixed(2)}</p>
                  <p><span className="font-semibold">C:</span> {calculationResults.C.map(val => val.toFixed(2)).join(', ')}</p>
                </div>
              </div>
              
              <div>
                <div className="bg-gray-100 p-3 rounded">
                  <p><span className="font-semibold">DN:</span> {calculationResults.DN.map(val => val.toFixed(2)).join(', ')}</p>
                  <p><span className="font-semibold">DV:</span> {calculationResults.DV.map(val => val.toFixed(2)).join(', ')}</p>
                </div>
              </div>
              
              <div>
                <div className="bg-gray-100 p-3 rounded">
                  <p><span className="font-semibold">BN:</span> {calculationResults.BN.map(val => val.toFixed(2)).join(', ')}</p>
                  <p><span className="font-semibold">BV:</span> {calculationResults.BV.map(val => val.toFixed(2)).join(', ')}</p>
                </div>
              </div>
              
              <div>
                <div className="bg-gray-100 p-3 rounded">
                  <p><span className="font-semibold">X:</span> {calculationResults.X.map(val => val.toFixed(2)).join(', ')}</p>
                  <p><span className="font-semibold">AX:</span> {calculationResults.AX.map(val => val.toFixed(2)).join(', ')}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">A:</h3>
                <div className="bg-gray-100 p-3 rounded overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="bg-white divide-y divide-gray-200">
                      {calculationResults.A.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.slice(0, calculationResults.X.length).map((cell, colIndex) => (
                            <td key={colIndex} className="px-3 py-2 text-center">{cell.toFixed(2)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeCalculateModal}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatasetsPage; 