import { TableComponentProps } from "@/types/erd/erdeditor";
import { useCallback, useEffect, useRef, useState } from "react";
import ActionsBlock from "../ui/actions/ActionsBlock";
import Action from "../ui/actions/Action";
import { TableProperties } from "lucide-react";

export default function Table({ 
  scale,
  table,
  openDeleteTableModal
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
    console.log(e.clientX, position.x)
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

  return (
    <div className={`rounded-xl absolute bg-white border-2 ${isFocused ? 'border-indigo-600' : ''}`}
      style={{
        transform: `scale(${scale})`,
        minWidth: '200px',
        minHeight: '300px',
        left: position.x * scale,
        top: position.y * scale,
        transformOrigin: 'top left'
      }}
      onMouseDown={handleMouseDownTable}
      onMouseUp={() => handleMouseUpTable}>
      {/* Шапка таблицы */}
      <div className="px-4  h-12 flex items-center justify-between border-b-2" onMouseEnter={() => setIsActionBtn(true)} onMouseLeave={() => {if(!isActionsOpen) setIsActionBtn(false)}}>
        <p className="text-gray-600 font-semibold flex gap-1 items-center">
          <TableProperties size={16}/>
          {table.name}
        </p>
        {isActionBtn && (
          <ActionsBlock isOpen={isActionsOpen} setIsOpen={setIsActionsOpen}>
            <Action onClick={() => openDeleteTableModal(table.id)} afterClick={() => setIsActionsOpen(false)}>Удалить</Action>
            <Action onClick={() => {}} afterClick={() => setIsActionsOpen(false)}>Изменить</Action>
          </ActionsBlock>
        )}
      </div>
      {/* <hr className=""/> */}
      {/* Поля таблицы */}
      <div className="flex gap-1 p-2 flex-col">
        {table.fields.map(field => (
          <div key={field.position}>
            <div className="w-3">

            </div>
            <p>{field.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
} 