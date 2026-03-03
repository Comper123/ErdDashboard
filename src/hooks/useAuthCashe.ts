import { useState, useEffect, useRef, useCallback } from 'react';

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

// Кеш в памяти (очищается при перезагрузке страницы)
const authCache = {
  user: null as User | null,
  accessToken: null as string | null,
  refreshToken: null as string | null,
  
  set(user: User | null, accessToken: string | null, refreshToken: string | null) {
    this.user = user;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  },
  
  clear() {
    this.user = null;
    this.accessToken = null;
    this.refreshToken = null;
  },
  
  get() {
    return {
      user: this.user,
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
    };
  }
};


export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
  });

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  // Функция для обновления токена
  const refreshAccessToken = useCallback(async () => {
    const {refreshToken} = authCache.get();

    if (!refreshToken){return null}
    if (isRefreshingRef.current) {return null}

    try {
      isRefreshingRef.current = true;
      const response = await fetch('/api/auth/refresh', {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({refreshToken})
      });
      const data = await response.json();

      if (!response.ok) {
        await logout();
        return null;
      }

      // Обновляем кеш
      authCache.set(data.user, data.accessToken, data.refreshToken || refreshToken);

      setAuthState({
        user: data.user,
        accessToken: data.accessToken,
        isLoading: false,
      });

      scheduleTokenRefresh(data.accessToken);

      return data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    } finally {
      isRefreshingRef.current = false;
    }

  }, []);

  // Планирование автоматического обновления
  const scheduleTokenRefresh = useCallback((token: string) => {
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const expiresIn = tokenData.exp * 1000 - Date.now();

      if (refreshTimeoutRef.current){
        clearTimeout(refreshTimeoutRef.current);
      }

      // Обновляем за 1 минуту до истечения
      const refreshTime = Math.max(expiresIn - 60000, 0);

      if (refreshTime > 0) {
        refreshTimeoutRef.current = setTimeout(() => {
          refreshAccessToken();
        }, refreshTime);
      }
    } catch (error) {
      console.error('Error parsing token:', error);
    }
  }, [refreshAccessToken])

  // Инициализация из кеша
  useEffect(() => {
    const { user, accessToken, refreshToken } = authCache.get();
    if (user && accessToken && refreshToken) {
      setAuthState({
        user,
        accessToken,
        isLoading: false,
      });
      
      scheduleTokenRefresh(accessToken);
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [scheduleTokenRefresh]);


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

    // Сохраняем в кеш
    authCache.set(data.user, data.accessToken, data.refreshToken);

    setAuthState({
      user: data.user,
      accessToken: data.accessToken,
      isLoading: false,
    });
    scheduleTokenRefresh(data.accessToken);
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

    // Сохарянем в кеш
    authCache.set(data.user, data.accessToken, data.refreshToken);

    setAuthState({
      user: data.user,
      accessToken: data.accessToken,
      isLoading: false,
    });

    scheduleTokenRefresh(data.accessToken);

    return data;
  };

  const logout = useCallback(async (logoutAll = false) =>  {
    const { accessToken, refreshToken } = authCache.get();

    if (refreshToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ refreshToken, logoutAll }),
        });
      } catch (error) {
        console.error('Logout error:', error);
      }

      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      // Очищаем кеш
      authCache.clear();

      setAuthState({
        user: null,
        accessToken: null,
        isLoading: false,
      });
    }
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
  };
}