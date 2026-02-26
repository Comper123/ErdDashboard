import { useEffect, useState } from "react"
import { UserRound, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import Sep from "@/components/ui/Sep";
import { useAuth } from "@/hooks/useAuth";


export default function Header() {
  const [isOpenProfileMenu, setIsOpenProfileMenu] = useState(false);
  const [storedRefreshToken, setStoredRefreshToken] = useState<string | null>('');
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setStoredRefreshToken(localStorage.getItem('refreshToken'));

    }, 0) 

  }), [];

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: "POST",
        body: JSON.stringify({
          logoutAll: false
        }),
        headers: {
          "Authorization": "Bearer " + storedRefreshToken
        }
      })
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <header className="flex justify-between px-[10%] border-b border-gray-300 py-3">
      <div>

      </div>
      <div className="relative">
        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-300/20 duration-300 hover:bg-slate-400/20 cursor-pointer"
            onClick={() => setIsOpenProfileMenu(prev => !prev)}>
          <UserRound className="h-5 w-5"/>
        </div>
        {isOpenProfileMenu && (
          <div className="absolute top-10 right-0 bg-gray-50 shadow-lg rounded-md p-2 min-w-[300px] border-[1px] flex flex-col gap-1 z-11">
            <div className="px-3 py-2">
              <p className="font-semibold">{user?.email}</p>
            </div>
            <Sep />
            <Link href='/dashboard' className="duration-300 text-sm hover:bg-slate-300/30 px-3 py-2 rounded-md min-w-full flex gap-2 items-center">
              <LayoutDashboard className="h-4 w-4"/>Dashboard
            </Link>
            <div onClick={() => logout()} className="duration-300 text-sm hover:bg-slate-300/30 px-3 py-2 rounded-md min-w-full flex gap-2 items-center">
              <LogOut className="h-4 w-4"/>Выйти
            </div>
          </div>
        )}
      </div>
    </header>
  )
}