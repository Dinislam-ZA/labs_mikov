import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const DatasetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isDispatcher, isWorkshopManager, addAuthToRequest } = useAuth();
  
  const [dataset, setDataset] = useState(null);
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedDataset, setEditedDataset] = useState(null);
  const [saveAsNew, setSaveAsNew] = useState(false);
  const [newName, setNewName] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Получаем информацию о датасете
        const datasetResponse = await api.post(`/datasets/${id}`, addAuthToRequest());
        setDataset(datasetResponse.data);
        
        // Устанавливаем начальные данные для редактирования
        setEditedDataset(datasetResponse.data);
        setNewName(datasetResponse.data.name);
        
        // Получаем список цехов
        const workshopsResponse = await api.post('/workshops', addAuthToRequest());
        setWorkshops(workshopsResponse.data);
        
        setError('');
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setError('Произошла ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, addAuthToRequest]);
  
  const handleSave = async () => {
    try {
      setLoading(true);
      
      const dataToSend = {
        name: newName || editedDataset.name,
        M: editedDataset.matrix.length,
        N: editedDataset.matrix[0]?.length || 0,
        matrix: editedDataset.matrix,
        workshop: editedDataset.workshop
      };
      
      let response;
      
      if (saveAsNew) {
        // Сохраняем как новый датасет
        response = await api.post('/datasets/create', addAuthToRequest(dataToSend));
        navigate(`/datasets/${response.data.id}`);
      } else {
        // Обновляем существующий датасет
        response = await api.post(`/datasets/update/${id}`, addAuthToRequest(dataToSend));
        setDataset(response.data);
      }
      
      setIsEditing(false);
      setSaveAsNew(false);
      setError('');
    } catch (error) {
      console.error('Ошибка при сохранении датасета:', error);
      setError('Произошла ошибка при сохранении датасета');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm('Вы действительно хотите удалить этот датасет?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      await api.post(`/datasets/delete/${id}`, addAuthToRequest());
      
      navigate('/datasets');
    } catch (error) {
      console.error('Ошибка при удалении датасета:', error);
      setError('Произошла ошибка при удалении датасета');
    }
  };
  
  const handleMatrixChange = (rowIndex, colIndex, value) => {
    const newMatrix = [...editedDataset.matrix];
    newMatrix[rowIndex][colIndex] = parseInt(value) || 0;
    
    setEditedDataset({
      ...editedDataset,
      matrix: newMatrix
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-500">Загрузка...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }
  
  if (!dataset) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        Датасет не найден
      </div>
    );
  }
  
  const canEdit = isAdmin || (isDispatcher && isEditing) || (isWorkshopManager && dataset.workshop === user.workshop);
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditing ? 'Редактирование датасета' : 'Просмотр датасета'}
        </h1>
        
        <div className="flex space-x-3">
          {!isEditing && canEdit && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Редактировать
            </button>
          )}
          
          <button
            onClick={() => navigate('/datasets')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Назад к списку
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        {isEditing ? (
          <div className="space-y-6">
            {(isAdmin || (isWorkshopManager && saveAsNew)) && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Название
                </label>
                <input
                  type="text"
                  id="name"
                  value={isWorkshopManager && saveAsNew ? newName : editedDataset.name}
                  onChange={(e) => {
                    if (isWorkshopManager && saveAsNew) {
                      setNewName(e.target.value);
                    } else {
                      setEditedDataset({ ...editedDataset, name: e.target.value });
                    }
                  }}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}
            
            {isWorkshopManager && (
              <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-md">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="saveAsNew"
                    checked={saveAsNew}
                    onChange={(e) => setSaveAsNew(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="saveAsNew" className="ml-2 block text-sm text-gray-900">
                    Сохранить как новый датасет
                  </label>
                </div>
                {saveAsNew && (
                  <p className="text-sm text-yellow-700">
                    Данные будут сохранены в новый датасет. Исходный датасет останется без изменений.
                  </p>
                )}
              </div>
            )}
            
            {(isAdmin || isDispatcher) && (
              <div>
                <label htmlFor="workshop" className="block text-sm font-medium text-gray-700">
                  Цех
                </label>
                <select
                  id="workshop"
                  value={editedDataset.workshop || ''}
                  onChange={(e) => setEditedDataset({ 
                    ...editedDataset, 
                    workshop: e.target.value === '' ? null : parseInt(e.target.value)
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Не выбрано</option>
                  {workshops.map(workshop => (
                    <option key={workshop.id} value={workshop.id}>
                      {workshop.name || `Цех #${workshop.id}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {(isAdmin || isWorkshopManager) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Матрица данных
                </label>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border">
                    <tbody className="bg-white divide-y divide-gray-200">
                      {editedDataset.matrix?.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, colIndex) => (
                            <td key={colIndex} className="px-2 py-2 whitespace-nowrap border">
                              <input
                                type="number"
                                value={cell}
                                onChange={(e) => handleMatrixChange(rowIndex, colIndex, e.target.value)}
                                className="block w-full border-0 p-1 focus:outline-none focus:ring-0 text-center"
                                style={{ width: '60px' }}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Отмена
              </button>
              
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? 'Сохранение...' : saveAsNew ? 'Сохранить как новый' : 'Сохранить изменения'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{dataset.name || `Датасет #${dataset.id}`}</h2>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">ID:</p>
                  <p className="mt-1">{dataset.id}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Размер:</p>
                  <p className="mt-1">{dataset.M && dataset.N ? `${dataset.M}x${dataset.N}` : 'Не указан'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Цех:</p>
                  <p className="mt-1">
                    {dataset.workshop ? (
                      workshops.find(w => w.id === dataset.workshop)?.name || `Цех #${dataset.workshop}`
                    ) : (
                      'Не назначен'
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Матрица данных</h3>
              
              {dataset.matrix ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border">
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dataset.matrix.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, colIndex) => (
                            <td key={colIndex} className="px-4 py-2 whitespace-nowrap text-center border">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">Данные отсутствуют</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatasetDetails; 