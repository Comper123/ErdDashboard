import { useEffect, useRef, useState } from "react"
import { UserRound, LayoutDashboard, LogOut, DatabaseZap } from "lucide-react";
import Link from "next/link";
import Sep from "@/components/ui/Sep";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";


export default function Header() {
  const [isOpenProfileMenu, setIsOpenProfileMenu] = useState(false);
  const [storedRefreshToken, setStoredRefreshToken] = useState<string | null>('');
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout: authLogout } = useAuth();
  const router = useRouter();

  // Закрытие меню при клике вне компонента
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpenProfileMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleLogout = async () => {
    try {
      await authLogout();
      router.push('/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  }

  return (
    <header className="flex justify-between px-[10%] border-b py-3">
      <div className="flex items-center">
        <p className="font-semibold text-xl flex gap-2 items-center"><DatabaseZap className="text-gray-800"/>ERD Dashboard</p>
      </div>
      <div className="relative">
        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-300/20 duration-300 hover:bg-slate-400/20 cursor-pointer"
            onClick={() => setIsOpenProfileMenu(prev => !prev)}>
          <UserRound className="h-5 w-5"/>
        </div>
        {isOpenProfileMenu && (
          <div className="absolute top-10 right-0 bg-gray-50 shadow-lg rounded-md p-2 min-w-[300px] border-[1px] flex flex-col gap-1 z-50" ref={menuRef}>
            <div className="px-3 py-2">
              <p className="font-semibold">{user?.email}</p>
            </div>
            <Sep />
            <Link href='/dashboard' className="duration-300 text-sm hover:bg-slate-300/30 px-3 py-2 rounded-md min-w-full flex gap-2 items-center">
              <LayoutDashboard className="h-4 w-4"/>Dashboard
            </Link>
            <div onClick={() => handleLogout()} className="duration-300 cursor-pointer text-sm hover:bg-slate-300/30 px-3 py-2 rounded-md min-w-full flex gap-2 items-center">
              <LogOut className="h-4 w-4"/>Выйти
            </div>
          </div>
        )}
      </div>
    </header>
  )
}