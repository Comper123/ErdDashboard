'use client';

import { ToolbarButtonProps, ToolbarGroupProps, ToolbarProps } from "@/types/erd/toolbar";


// Компонент Панели инструментов
export default function Toolbar({ children } : ToolbarProps){
  return (
    <div className="absolute bottom-5 left-[50%] translate-x-[-50%] bg-gray-100 rounded-xl flex items-center p-2 z-20">
      {children}
    </div>
  )
}

// Компонент группы кнопок
Toolbar.Group = function ToolbarGroup({ children }: ToolbarGroupProps){
  return <div className="flex gap-1">{children}</div>
}

// Коомпонент разделителя
Toolbar.Divider = function ToolbarDivider(){
  return <div className="w-px h-8 bg-gray-300 mx-2" />
}

// Компонент кнопки на панели инструментов
Toolbar.Button = function ToolbarButton({
  children,
  icon,
  onClick,
  active = false,
  as = 'button'
} : ToolbarButtonProps) {
  const Component = as;

  return (
    <Component onClick={onClick}
      className={`p-3 rounded-lg text-sm font-medium flex items-center
                  gap-2 transition-colors cursor-pointer
                  ${active ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-200'}`}>
      {icon}
      {children}
    </Component>
  )
}

