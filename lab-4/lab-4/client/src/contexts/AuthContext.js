import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

// Создаем контекст аутентификации
const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Функция для входа в систему
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // При отладке выводим данные запроса
      console.log('Отправка запроса аутентификации:', { username, password });
      
      const response = await api.post('/auth/login', { username, password });
      
      // При отладке выводим ответ сервера
      console.log('Ответ сервера:', response.data);
      
      // Сервер возвращает информацию о пользователе
      const { user: userData } = response.data;
      
      // Сохраняем информацию о пользователе в localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Устанавливаем состояния пользователя
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (err) {
      console.error('Ошибка при входе:', err);
      
      let errorMessage = 'Произошла ошибка при входе';
      
      if (err.response) {
        errorMessage = err.response.data.message || errorMessage;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Функция для выхода из системы
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Проверка сохраненных данных пользователя при загрузке
  useEffect(() => {
    const checkAuth = () => {
      console.log('AuthContext: проверка сохраненной аутентификации...');
      
      const savedUser = localStorage.getItem('user');
      
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          console.log('AuthContext: пользователь найден в localStorage', parsedUser);
          
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Ошибка при чтении данных пользователя:', err);
          localStorage.removeItem('user');
        }
      } else {
        console.log('AuthContext: пользователь не найден в localStorage');
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Функция для регистрации
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.error('Регистрация:', userData);
      
      const response = await api.post('/auth/register', userData);
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Ошибка при регистрации:', err);
      
      let errorMessage = 'Произошла ошибка при регистрации';
      
      if (err.response) {
        errorMessage = err.response.data.message || errorMessage;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = () => {
    return user?.role === 2; // admin
  };

  const isDispatcher = () => {
    return user?.role === 1; // operator
  };

  const isForeman = () => {
    return user?.role === 0; // foreman
  };

  // Функция для добавления данных пользователя в запрос
  const addUserToRequest = (requestData = {}) => {
    if (user) {
      return {
        ...requestData,
        user: user
      };
    }
    return requestData;
  };

  // Значение, которое будет доступно через контекст
  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    register,
    isAdmin,
    isDispatcher,
    isForeman,
    addUserToRequest
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 