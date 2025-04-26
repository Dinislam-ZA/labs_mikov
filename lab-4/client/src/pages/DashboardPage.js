import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { user, isAdmin, isDispatcher, isWorkshopManager, addAuthToRequest } = useAuth();
  const [datasets, setDatasets] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Получаем список датасетов
        const datasetsResponse = await api.post('/datasets', addAuthToRequest());
        setDatasets(datasetsResponse.data);
        
        // Если пользователь - админ или диспетчер, получаем список цехов
        if (isAdmin || isDispatcher) {
          const workshopsResponse = await api.post('/workshops', addAuthToRequest());
          setWorkshops(workshopsResponse.data);
        }
        
        setError('');
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setError('Произошла ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAdmin, isDispatcher, addAuthToRequest]);
  
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
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Панель управления</h1>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Добро пожаловать, {user?.username}!</h2>
        
        <div className="mb-6">
          <p className="text-gray-600">
            Роль: <span className="font-medium text-gray-800">
              {isAdmin ? 'Администратор' : isDispatcher ? 'Диспетчер' : 'Начальник цеха'}
            </span>
          </p>
          {isWorkshopManager && user.workshop && (
            <p className="text-gray-600">
              Цех: <span className="font-medium text-gray-800">
                {workshops.find(w => w.id === user.workshop)?.name || `№${user.workshop}`}
              </span>
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Мои датасеты</h3>
            
            {datasets.length === 0 ? (
              <p className="text-gray-500">Нет доступных датасетов</p>
            ) : (
              <ul className="space-y-2">
                {datasets.slice(0, 5).map(dataset => (
                  <li key={dataset.id} className="border-b border-gray-200 pb-2">
                    <Link to={`/datasets/${dataset.id}`} className="text-indigo-600 hover:text-indigo-800">
                      {dataset.name || `Датасет #${dataset.id}`}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {dataset.M && dataset.N ? `Размер: ${dataset.M}x${dataset.N}` : 'Размер не указан'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            
            <Link 
              to="/datasets" 
              className="mt-4 inline-block text-sm text-indigo-600 hover:text-indigo-800"
            >
              Все датасеты →
            </Link>
          </div>
          
          {(isAdmin || isDispatcher) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Цеха</h3>
              
              {workshops.length === 0 ? (
                <p className="text-gray-500">Нет доступных цехов</p>
              ) : (
                <ul className="space-y-2">
                  {workshops.map(workshop => (
                    <li key={workshop.id} className="border-b border-gray-200 pb-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{workshop.name || `Цех #${workshop.id}`}</span>
                        <span className="text-sm text-gray-500">
                          ID: {workshop.id}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              
              {isAdmin && (
                <Link 
                  to="/workshops" 
                  className="mt-4 inline-block text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Управление цехами →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 