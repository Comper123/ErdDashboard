import { TableComponentProps } from "@/types/erd/erdeditor";
import { useCallback, useEffect, useRef, useState } from "react";
import ActionsBlock from "../ui/actions/ActionsBlock";
import Action from "../ui/actions/Action";
import { TableProperties } from "lucide-react";

export default function Table({ 
  scale,
  table,
  deleteModalOpen
} : TableComponentProps){
  const [isFocused, setIsFocused] = useState<boolean>(table.isFocused);
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
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });

  }, [position, isActionsOpen])

  const handleMouseMoveTable = useCallback((e: MouseEvent) => {
    if (!isMoving) return;
    e.preventDefault();
    
    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };
    
    setPosition(newPosition);
    
    // Вызываем колбэк для обновления позиции в родителе
    // if (onPositionChange) {
    //   onPositionChange(table.id, newPosition);
    // }
  }, [isMoving, dragStart]);

  const handleMouseUpTable = useCallback((e: MouseEvent) => {
    e.preventDefault();
    setIsMoving(false);
    setIsFocused(false);
  }, []);

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
        left: position.x,
        top: position.y,
        transformOrigin: 'top left'
      }}
      onMouseDown={handleMouseDownTable}
      onMouseUp={handleMouseUpTable}>
      {/* Шапка таблицы */}
      <div className="px-4  h-12 flex items-center justify-between border-b-2" onMouseEnter={() => setIsActionBtn(true)} onMouseLeave={() => {if(!isActionsOpen) setIsActionBtn(false)}}>
        <p className="text-gray-600 font-semibold flex gap-1 items-center">
          <TableProperties size={16}/>
          {table.name}
        </p>
        {isActionBtn && (
          <ActionsBlock isOpen={isActionsOpen} setIsOpen={setIsActionsOpen}>
            <Action onClick={() => deleteTable()} afterClick={() => {}}>Удалить</Action>
            <Action onClick={() => {}} afterClick={() => {}}>Изменить</Action>
          </ActionsBlock>
        )}
      </div>
      {/* <hr className=""/> */}
      {/* Поля таблицы */}
      <div className="flex gap-1 p-2 flex-col">
        {table.fields.map(field => (
          <div key={field.position}>
            <p>{field.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
} 