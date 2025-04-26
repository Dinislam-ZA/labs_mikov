import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const UsersPage = () => {
  const { isAdmin, addAuthToRequest } = useAuth();
  const [users, setUsers] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Состояние для создания/редактирования пользователя
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userData, setUserData] = useState({
    name: '',
    password: '',
    role: 0,
    workshop: null
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Получаем список пользователей
        const usersResponse = await api.post('/users', addAuthToRequest());
        setUsers(usersResponse.data);
        
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
    
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, addAuthToRequest]);
  
  const handleCreateUser = async () => {
    try {
      // Проверка данных
      if (!userData.name.trim()) {
        setError('Имя пользователя не может быть пустым');
        return;
      }
      
      if (!userData.password.trim()) {
        setError('Пароль не может быть пустым');
        return;
      }
      
      setLoading(true);
      
      // Отправка запроса на создание пользователя
      await api.post('/users/create', addAuthToRequest(userData));
      
      // Получаем обновленный список пользователей
      const usersResponse = await api.post('/users', addAuthToRequest());
      setUsers(usersResponse.data);
      
      // Сброс формы
      setUserData({
        name: '',
        password: '',
        role: 0,
        workshop: null
      });
      
      setIsCreating(false);
      setError('');
    } catch (error) {
      console.error('Ошибка при создании пользователя:', error);
      setError('Произошла ошибка при создании пользователя');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateUser = async () => {
    try {
      // Проверка данных
      if (!userData.name.trim()) {
        setError('Имя пользователя не может быть пустым');
        return;
      }
      
      setLoading(true);
      
      // Отправка запроса на обновление пользователя
      await api.post(`/users/update/${editingUserId}`, addAuthToRequest(userData));
      
      // Получаем обновленный список пользователей
      const usersResponse = await api.post('/users', addAuthToRequest());
      setUsers(usersResponse.data);
      
      // Сброс формы
      setUserData({
        name: '',
        password: '',
        role: 0,
        workshop: null
      });
      
      setIsEditing(false);
      setEditingUserId(null);
      setError('');
    } catch (error) {
      console.error('Ошибка при обновлении пользователя:', error);
      setError('Произошла ошибка при обновлении пользователя');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Вы действительно хотите удалить этого пользователя?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Отправка запроса на удаление пользователя
      await api.post(`/users/delete/${id}`, addAuthToRequest());
      
      // Получаем обновленный список пользователей
      const usersResponse = await api.post('/users', addAuthToRequest());
      setUsers(usersResponse.data);
      
      setError('');
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
      setError('Произошла ошибка при удалении пользователя');
    } finally {
      setLoading(false);
    }
  };
  
  const startEditing = (user) => {
    setIsEditing(true);
    setEditingUserId(user.id);
    setUserData({
      name: user.username,
      password: '', // Пароль не отправляется с сервера
      role: user.role,
      workshop: user.workshop
    });
  };
  
  const cancelForm = () => {
    setIsCreating(false);
    setIsEditing(false);
    setEditingUserId(null);
    setUserData({
      name: '',
      password: '',
      role: 0,
      workshop: null
    });
  };
  
  const getRoleName = (role) => {
    switch (role) {
      case 0: return 'Начальник цеха';
      case 1: return 'Диспетчер';
      case 2: return 'Администратор';
      default: return 'Пользователь';
    }
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
        <h1 className="text-2xl font-bold text-gray-800">Пользователи</h1>
        
        {isAdmin && !isCreating && !isEditing && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Создать пользователя
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
            {isCreating ? 'Создание нового пользователя' : 'Редактирование пользователя'}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Имя пользователя
              </label>
              <input
                type="text"
                id="name"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Пароль {isEditing && '(оставьте пустым, чтобы не менять)'}
              </label>
              <input
                type="password"
                id="password"
                value={userData.password}
                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Роль
              </label>
              <select
                id="role"
                value={userData.role}
                onChange={(e) => setUserData({ ...userData, role: parseInt(e.target.value) })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={0}>Начальник цеха</option>
                <option value={1}>Диспетчер</option>
                <option value={2}>Администратор</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="workshop" className="block text-sm font-medium text-gray-700">
                Цех (только для начальников цехов)
              </label>
              <select
                id="workshop"
                value={userData.workshop || ''}
                onChange={(e) => setUserData({ 
                  ...userData, 
                  workshop: e.target.value === '' ? null : parseInt(e.target.value)
                })}
                disabled={userData.role !== 0}
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
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={cancelForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Отмена
              </button>
              
              <button
                onClick={isCreating ? handleCreateUser : handleUpdateUser}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading 
                  ? 'Сохранение...' 
                  : isCreating 
                    ? 'Создать пользователя' 
                    : 'Сохранить изменения'
                }
              </button>
            </div>
          </div>
        </div>
      )}
      
      {users.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">Нет доступных пользователей</p>
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
                  Имя пользователя
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Роль
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Цех
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getRoleName(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.workshop ? (
                      workshops.find(w => w.id === user.workshop)?.name || `Цех #${user.workshop}`
                    ) : (
                      'Не назначен'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => startEditing(user)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                      disabled={isCreating || isEditing}
                    >
                      Редактировать
                    </button>
                    
                    {user.id !== 1 && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={isCreating || isEditing}
                      >
                        Удалить
                      </button>
                    )}
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

export default UsersPage; 