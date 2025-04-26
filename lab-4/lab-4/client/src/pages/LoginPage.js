import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      const result = await login(username, password);
      
      if (result.success) {
        navigate('/datasets');
      } else {
        setError(result.error || 'Ошибка при входе');
      }
    } catch (error) {
      console.error('Ошибка при входе:', error);
      setError('Произошла ошибка при входе');
    } finally {
      setLoading(false);
    }
  };
  
  const handleExitClick = () => {
    window.close(); // В браузере не всегда работает, но идентично примеру на Java
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Вход в систему</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 self-center">
              Имя пользователя:
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 self-center">
              Пароль:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white rounded py-2 px-4 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
            
            <button
              type="button"
              onClick={handleExitClick}
              className="bg-red-600 text-white rounded py-2 px-4 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Выход
            </button>
          </div>
        </form>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>Доступные учетные записи:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>admin / 123 (Администратор)</li>
            <li>operator / 321 (Диспетчер)</li>
            <li>foreman1 / 456 (Начальник цеха 1)</li>
            <li>foreman2 / 678 (Начальник цеха 2)</li>
            <li>foreman3 / 890 (Начальник цеха 3)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 