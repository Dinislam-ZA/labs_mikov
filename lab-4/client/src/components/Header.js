import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, logout, isAdmin, isDispatcher } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Функция для получения текстового представления роли пользователя
  const getRoleName = (role) => {
    switch (role) {
      case 0: return 'Начальник цеха';
      case 1: return 'Диспетчер';
      case 2: return 'Администратор';
      default: return 'Пользователь';
    }
  };
  
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Link to="/dashboard" className="text-xl font-bold text-gray-800">
              Управление цехами
            </Link>
            
            <nav className="flex space-x-4">
              <Link 
                to="/dashboard" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
              >
                Главная
              </Link>
              
              <Link 
                to="/datasets" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
              >
                Датасеты
              </Link>
              
              {isAdmin && (
                <>
                  <Link 
                    to="/users" 
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
                  >
                    Пользователи
                  </Link>
                  
                  <Link 
                    to="/workshops" 
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
                  >
                    Цеха
                  </Link>
                </>
              )}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              <span className="font-medium">{user?.username}</span>
              <span className="mx-1">·</span>
              <span className="text-gray-500">{getRoleName(user?.role)}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 