import { useEffect, useRef, useState } from "react";
import { EllipsisVertical, X } from "lucide-react"
import { stopPropogation } from "@/lib/utils/propogation";

interface ActionsBlockProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  size?: 'base' | 'small'
}


export default function ActionsBlock({
  children,
  className = '',
  isOpen,
  setIsOpen,
  size = 'base'
} : ActionsBlockProps){
  // const [isOpen, setIsOpen] = useState(false);
  const actionRef = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне блока
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionRef.current && !actionRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const sizesClass = {
    base: {
      btnSize: 'h-8 w-8',
      iconSize: 'h-4',
    },
    small: {
      btnSize: 'h-6 w-6',
      iconSize: 'h-3'
    }
  }

  return (
    <div className="relative" ref={actionRef}>
      <div className={`${sizesClass[size].btnSize} rounded-full bg-gray-300/20 cursor-pointer flex items-center justify-center`}
        onClick={(e) => {
          stopPropogation(e);
          setIsOpen(isOpen ? false : true);
        }}>
        {isOpen ? (
          <X className={`${sizesClass[size].iconSize}`}/>  
        ) : (
          <EllipsisVertical className={`${sizesClass[size].iconSize}`}/>
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