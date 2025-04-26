import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl">Управление цехами</span>
            </Link>
          </div>
          
          {isAuthenticated ? (
            <div className="flex items-center">
              <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                Панель управления
              </Link>
              
              <Link to="/datasets" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                Датасеты
              </Link>
              
              {isAdmin() && (
                <>
                  <Link to="/workshops" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                    Цеха
                  </Link>
                  <Link to="/users" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                    Пользователи
                  </Link>
                </>
              )}
              
              <div className="ml-4 flex items-center">
                <span className="mr-2 text-sm">{user?.username}</span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-md text-sm font-medium"
                >
                  Выйти
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                Войти
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 