import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  
  const router = useRouter();

  // Проверка авторизации
  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {credentials: 'include'});

      if (response.ok) {
        const data = await response.json();
        setAuthState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();

    // Периодическая проверка сессии (каждые 5 минут)
    const interval = setInterval(checkAuth, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkAuth]);

  // Логин
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка входа');
      }
      
      setAuthState({
        user: data.user,
        isLoading: false,
        isAuthenticated: true,
      });

      router.push('/dashboard');
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Регистрация
  const register = async (email: string, password: string, name?: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка регистрации');
      }

      // После успешной регистрации автоматически логиним
      await login(email, password);
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Выход
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      router.push('/login');
    }
  };

  // Keep-alive функция
  const keepAlive = useCallback(async () => {
    if (authState.isAuthenticated) {
      await fetch('/api/auth/me');
    }
  }, [authState.isAuthenticated]);

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
    keepAlive,
  };
}