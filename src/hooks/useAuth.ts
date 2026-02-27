import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
  });

  useEffect(() => {
    // Проверяем, что мы на клиенте
    if (typeof window === 'undefined') {
      return;
    }
    // Используем setTimeout для отложенной загрузки
    const timer = setTimeout(() => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('accessToken');

        setAuthState({
          user: storedUser ? JSON.parse(storedUser) : null,
          accessToken: storedToken || null,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error loading auth state:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    // Сохраняем в localStorage
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

    setAuthState({
      user: data.user,
      accessToken: data.accessToken,
      isLoading: false,
    });

    return data;
  };

  const register = async (email: string, password: string, name?: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    // Сохраняем в localStorage
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

    setAuthState({
      user: data.user,
      accessToken: data.accessToken,
      isLoading: false,
    });

    return data;
  };

  const logout = async (logoutAll = false) => {
    const refreshToken = localStorage.getItem('refreshToken');

    if (refreshToken) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.accessToken}`,
        },
        body: JSON.stringify({ refreshToken, logoutAll }),
      });
    }

    // Очищаем localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    setAuthState({
      user: null,
      accessToken: null,
      isLoading: false,
    });
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Если refresh token невалидный, разлогиниваем
      await logout();
      throw new Error(data.error);
    }

    // Обновляем токены в localStorage
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

    setAuthState(prev => ({
      ...prev,
      accessToken: data.accessToken,
    }));

    return data;
  };

  return {
    ...authState,
    login,
    register,
    logout,
    refreshAccessToken,
    
  };
}