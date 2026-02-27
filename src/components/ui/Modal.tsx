import { X } from "lucide-react"


interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}


export default function Modal({ 
  children, 
  isOpen, 
  onClose,
  title,
  size = 'md'
}: ModalProps) {
  const sizes = {
    xs: 'w-1/5',
    sm: 'w-[30%]',
    md: 'w-2/5',
    lg: 'w-3/5',
    xl: 'w-4/5'
  }

  if (!isOpen) return null;
  
  const stopPropogation = (e: React.MouseEvent) => {
    e.stopPropagation();
  }

  return (
    <div className="fixed z-10 bg-black/50 w-screen h-screen top-0 left-0 bottom-0 right-0 flex items-center justify-center" onClick={onClose}>
      <div className={`bg-white rounded-xl min-h-20 p-8 ${sizes[size]}`} onClick={stopPropogation}>
        <div className="flex justify-between items-center h-max">
          <h2 className="font-bold text-xl">{title}</h2>
          <X className="cursor-pointer" onClick={onClose}></X>
        </div>
        {children}
      </div>
    </div>
  )
}