import { useEffect, useRef, useState } from "react";
import { EllipsisVertical, X } from "lucide-react"

interface ActionsBlockProps {
  children: React.ReactNode;
  className?: string;
}


export default function ActionsBlock({
  children,
  className = ''
} : ActionsBlockProps){
  const [isOpen, setIsOpen] = useState(false);
  const actionRef = useRef<HTMLDivElement>(null);

  // ! Временно делаем закрытие по ивенту клика (правильно хранить состояние в родительском компоненте)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionRef.current && !actionRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  })

  return (
    <div className="relative">
      <div className="h-8 w-8 rounded-full bg-gray-300/20 cursor-pointer flex items-center justify-center" 
        onClick={() => setIsOpen(prev => !prev)} ref={actionRef}>
        {isOpen ? (
          <X className="h-4"/>  
        ) : (
          <EllipsisVertical className="h-4"/>
        )}
      </div>
      {isOpen && (
        <div className={`${className} absolute top-9 right-0 z-30 bg-white border rounded-lg p-2 flex flex-col gap-1`}>
          {children}
        </div>
      )}
    </div>
  )
}