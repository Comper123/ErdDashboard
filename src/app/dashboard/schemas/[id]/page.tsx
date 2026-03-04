'use client';


import Header from "@/components/Header"
import { useAuth } from "@/hooks/useAuthSession";


export default function SchemaPage(){
  const { user } = useAuth();
  return (
    <div className="bg-gray-50 max-w-[99vw] min-h-screen">
      <Header></Header>
      
    </div>
  )
}