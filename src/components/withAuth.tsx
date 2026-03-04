'use client';

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export function withAuth<P extends object>(
    WrappedComponent: React.ComponentType<P>
) {
    return function WithAuthComponent(props: P) {
        const router = useRouter();
        const { user, isLoading, refreshAccessToken } = useAuth();

        // Нужно обновлять токен до его истечения
        useEffect(() => {
            const refreshInterval = setInterval(async () => {
                try {
                    await refreshAccessToken(); // Обновляем токен каждые 14 минут
                } catch (error) {
                    console.error('Token refresh failed:', error);
                }
            }, 14 * 50 * 1000); // 14 минут
            
            return () => clearInterval(refreshInterval);
        }, []);

        // Проверка авторизации
        useEffect(() => {
        if (!isLoading && !user) {
            const returnUrl = encodeURIComponent(window.location.pathname);
            router.push(`/login?from=${returnUrl}`);
        }
        }, [user, isLoading, router]);

        // Показываем загрузку
        if (isLoading) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
            );
        }

        // Если не авторизован - ничего не рендерим
        if (!user) {
            return null;
        }

        // Авторизован - рендерим компонент
        return <WrappedComponent {...props} />;
    }
}