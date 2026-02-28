import { useState } from "react";
import { EllipsisVertical, X } from "lucide-react"

interface ActionsBlockProps {
  children: React.ReactNode
}


export default function ActionsBlock({
  children
} : ActionsBlockProps){
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div className="h-8 w-8 rounded-full bg-gray-300/20 cursor-pointer flex items-center justify-center" 
        onClick={() => setIsOpen(prev => !prev)}>
        {isOpen ? (
          <X className="h-4"/>
        ) : (
          <EllipsisVertical className="h-4"/>
        )}
      </div>
      {isOpen && (
        <div className="absolute top-9 right-0 z-30">
          {children}
        </div>
      )}
    </div>
  )
}