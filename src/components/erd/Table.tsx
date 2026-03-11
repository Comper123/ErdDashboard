import { TableComponentProps } from "@/types/erd/erdeditor";
import { useCallback, useEffect, useRef, useState } from "react";
import ActionsBlock from "../ui/actions/ActionsBlock";
import Action from "../ui/actions/Action";
import { KeyRound, Link, TableProperties } from "lucide-react";

export default function Table({ 
  scale,
  table,
  openDeleteTableModal,
  openEditTableModal
} : TableComponentProps){
  const [isFocused, setIsFocused] = useState<boolean>(table.isFocused || false);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [isActionsOpen, setIsActionsOpen] = useState<boolean>(false);
  const [isActionBtn, setIsActionBtn] = useState<boolean>(false);
  const [position, setPosition] = useState(table.position || { x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const tableRef = useRef<HTMLDivElement>(null);

  const handleMouseDownTable = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0 || isActionsOpen) return; // Только левая мышь и не при открытых действиях
    e.preventDefault();
    e.stopPropagation();

    setIsMoving(true);
    setIsFocused(true);
    setDragStart({
      x: Math.round((e.clientX - position.x * scale) / scale),
      y: Math.round((e.clientY - position.y * scale) / scale)
    });

  }, [position, isActionsOpen, scale])

  const handleMouseMoveTable = useCallback((e: MouseEvent) => {
    if (!isMoving) return;
    e.preventDefault();
    
    const newPosition = {
      x: Math.round((e.clientX / scale) - dragStart.x),
      y: Math.round((e.clientY / scale) - dragStart.y)
    };
    
    setPosition(newPosition);
    
    // Вызываем колбэк для обновления позиции в родителе
    // if (onPositionChange) {
    //   onPositionChange(table.id, newPosition);
    // }
  }, [isMoving, dragStart, scale]);

  const handleMouseUpTable = useCallback(async (e: MouseEvent) => {
    e.preventDefault();
    setIsMoving(false);
    setIsFocused(false);
    // Отправляем новые координаты на сервер
    const response = await fetch(`/api/tables/${table.id}/coords`, {
      method: "POST",
      body: JSON.stringify({
        newX: position.x,
        newY: position.y
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }, [table, position]);

  // Добавляем и удаляем глобальные обработчики
  useEffect(() => {
    if (isMoving) {
      window.addEventListener('mousemove', handleMouseMoveTable);
      window.addEventListener('mouseup', handleMouseUpTable);
      
      // Меняем курсор для всей страницы
      document.body.style.cursor = 'grabbing';
      if (tableRef.current) {
        tableRef.current.style.cursor = 'grabbing';
      }
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveTable);
      window.removeEventListener('mouseup', handleMouseUpTable);
      
      // Возвращаем курсор
      document.body.style.cursor = 'default';
      if (tableRef.current) {
        tableRef.current.style.cursor = 'grab';
      }
    };
  }, [isMoving, handleMouseMoveTable, handleMouseUpTable]);

  const borderColor = isFocused ? '#4f46e5' : (table.color || '#e5e7eb');
  // const lightColor = isFocused ? 'rgba(79, 70, 229, 0.05)' : 'transparent';
  
  return (
    <div 
      ref={tableRef}
      className="rounded-lg absolute z-10 bg-white shadow-sm hover:shadow-md transition-shadow"
      style={{
        transform: `scale(${scale}) ${isMoving ? 'translateY(-2px)' : ''}`,
        minWidth: '220px',
        left: position.x * scale,
        top: position.y * scale,
        transformOrigin: 'top left',
        border: `2px solid ${borderColor}`,
        boxShadow: isMoving ? '0 10px 25px -5px rgba(0,0,0,0.2)' : '0 4px 6px -1px rgba(0,0,0,0.1)',
        cursor: isMoving ? 'grabbing' : 'grab',
        transition: 'box-shadow 0.2s ease',
      }}
      onMouseDown={handleMouseDownTable}
    >
      {/* Заголовок */}
      <div 
        className="px-3 flex items-center justify-between border-b-2 min-h-11"
        style={{ borderBottomColor: borderColor }}
        onMouseEnter={() => setIsActionBtn(true)} 
        onMouseLeave={() => {if(!isActionsOpen) setIsActionBtn(false)}}
      >
        <div className="flex items-center gap-2 min-w-0">
          <TableProperties size={14} className="text-gray-400 flex-shrink-0" color={table.color}/>
          <p className="font-medium text-sm h-full text-gray-700 truncate leading-none">
            {table.name}
          </p>
        </div>
        
        {isActionBtn && (
          <ActionsBlock isOpen={isActionsOpen} setIsOpen={setIsActionsOpen} size="small">
            <Action onClick={() => openDeleteTableModal(table.id)} afterClick={() => setIsActionsOpen(false)} size="small">
              Удалить
            </Action>
            <Action onClick={() => openEditTableModal(table.id)} afterClick={() => setIsActionsOpen(false)} size="small">
              Изменить
            </Action>
          </ActionsBlock>
        )}
      </div>

      {/* Поля */}
      <div className="p-1">
        {table.fields.length === 0 ? (
          <div className="text-xs text-gray-400 italic text-center py-2">
            Нет полей
          </div>
        ) : (
          table.fields.map((field, index) => (
            <div 
              key={field.position || index} 
              className="flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-gray-50 rounded transition-colors"
            >
              <div className="w-4 flex-shrink-0">
                {field.isPrimaryKey && (
                  <KeyRound size={12} className="text-amber-500" />
                )}
                {field.isForeignKey && (
                  <Link size={12} className="text-blue-500" />
                )}
              </div>
              
              <span className="flex-1 text-gray-700 truncate">
                {field.name}
              </span>
              
              <span className="text-gray-400 text-[10px] font-mono">
                {field.type}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Подвал с количеством полей (опционально) */}
      {table.fields.length > 0 && (
        <div className="px-2 py-1 border-t text-[10px] text-gray-400 flex justify-between">
          <span>{table.fields.length} полей</span>
          {/* {table.fields.some(f => f.isPrimaryKey) && (
            <span className="text-amber-500">PK</span>
          )} */}
        </div>
      )}
    </div>
  )
} 