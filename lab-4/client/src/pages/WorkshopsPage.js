import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const WorkshopsPage = () => {
  const { isAdmin, addAuthToRequest } = useAuth();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Состояние для создания/редактирования цеха
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingWorkshopId, setEditingWorkshopId] = useState(null);
  const [workshopName, setWorkshopName] = useState('');
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
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
  
  useEffect(() => {
    fetchData();
  }, [addAuthToRequest]);
  
  const handleCreateWorkshop = async () => {
    try {
      if (!workshopName.trim()) {
        setError('Название цеха не может быть пустым');
        return;
      }
      
      setLoading(true);
      
      // Отправка запроса на создание цеха
      await api.post('/workshops/create', addAuthToRequest({ name: workshopName }));
      
      // Обновляем список цехов
      await fetchData();
      
      // Сбрасываем форму
      setWorkshopName('');
      setIsCreating(false);
    } catch (error) {
      console.error('Ошибка при создании цеха:', error);
      setError('Произошла ошибка при создании цеха');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateWorkshop = async () => {
    try {
      if (!workshopName.trim()) {
        setError('Название цеха не может быть пустым');
        return;
      }
      
      setLoading(true);
      
      // Отправка запроса на обновление цеха
      await api.post(`/workshops/update/${editingWorkshopId}`, addAuthToRequest({ name: workshopName }));
      
      // Обновляем список цехов
      await fetchData();
      
      // Сбрасываем форму
      setWorkshopName('');
      setIsEditing(false);
      setEditingWorkshopId(null);
    } catch (error) {
      console.error('Ошибка при обновлении цеха:', error);
      setError('Произошла ошибка при обновлении цеха');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteWorkshop = async (id) => {
    if (!window.confirm('Вы действительно хотите удалить этот цех?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Отправка запроса на удаление цеха
      await api.post(`/workshops/delete/${id}`, addAuthToRequest());
      
      // Обновляем список цехов
      await fetchData();
    } catch (error) {
      console.error('Ошибка при удалении цеха:', error);
      let errorMessage = 'Произошла ошибка при удалении цеха';
      
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const startEditing = (workshop) => {
    setIsEditing(true);
    setEditingWorkshopId(workshop.id);
    setWorkshopName(workshop.name || '');
  };
  
  const cancelForm = () => {
    setIsCreating(false);
    setIsEditing(false);
    setEditingWorkshopId(null);
    setWorkshopName('');
  };
  
  if (loading && !isCreating && !isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-500">Загрузка...</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Цеха</h1>
        
        {isAdmin && !isCreating && !isEditing && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Создать цех
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {(isCreating || isEditing) && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {isCreating ? 'Создание нового цеха' : 'Редактирование цеха'}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Название цеха
              </label>
              <input
                type="text"
                id="name"
                value={workshopName}
                onChange={(e) => setWorkshopName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={cancelForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Отмена
              </button>
              
              <button
                onClick={isCreating ? handleCreateWorkshop : handleUpdateWorkshop}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading 
                  ? 'Сохранение...' 
                  : isCreating 
                    ? 'Создать цех' 
                    : 'Сохранить изменения'
                }
              </button>
            </div>
          </div>
        </div>
      )}
      
      {workshops.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">Нет доступных цехов</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Название
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workshops.map(workshop => (
                <tr key={workshop.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {workshop.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {workshop.name || `Цех #${workshop.id}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => startEditing(workshop)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                      disabled={isCreating || isEditing}
                    >
                      Редактировать
                    </button>
                    
                    <button
                      onClick={() => handleDeleteWorkshop(workshop.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={isCreating || isEditing}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WorkshopsPage; 