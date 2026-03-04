'use client';

import { useAuth } from '@/hooks/useAuthSession';
import { useEffect, useRef } from 'react';

export function SessionKeepAlive() {
  const { isAuthenticated, keepAlive } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isAuthenticated) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    // Функция поддержания активности
    const handleKeepAlive = async () => {
      try {
        await keepAlive();
      } catch (error) {
        console.error('Keep alive error:', error);
      }
    };

    // Запускаем интервал
    handleKeepAlive(); // Сразу выполняем
    intervalRef.current = setInterval(handleKeepAlive, 10 * 60 * 1000); // Каждые 10 минут

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated, keepAlive]);

  return null;
}