import { ERDEditorProps } from "@/types/erd/erdeditor";
import { useCallback, useEffect, useRef, useState } from "react";
import Table from "./Table";


export default function ERDEditor({
  isGridOpen,
  scale,
  zoomIn,
  zoomOut,
  openDeleteTableModal,
  tables
} : ERDEditorProps){
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const cellSize = 40;
  const cellBorderColor = "#80808020";
  const width = 3200;
  const height = 1800;
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Функция для ограничения смещения (чтобы не уходить за границы)
  const clampOffset = useCallback((newOffset: { x: number; y: number }) => {
    if (!containerRef.current) return newOffset;
    
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const canvasWidth = width * scale;
    const canvasHeight = height * scale;
    
    // Минимальное и максимальное смещение
    const minX = Math.min(0, containerWidth - canvasWidth);
    const maxX = 0;
    const minY = Math.min(0, containerHeight - canvasHeight);
    const maxY = 0;
    
    return {
      x: Math.max(minX, Math.min(maxX, newOffset.x)),
      y: Math.max(minY, Math.min(maxY, newOffset.y))
    };
  }, [scale]);

  // Обработчик начала перетаскивания
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Только левая кнопка мыши
    e.preventDefault();
    
    setIsDragging(true);
    setStartPosition({x: e.clientX, y: e.clientY});
    
    // Меняем курсор
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'grabbing';
    }
  }, []);

  // Обработчик перемещения мыши
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    // Правильный расчет смещения
    const deltaX = startPosition.x - e.clientX;
    const deltaY = startPosition.y - e.clientY;
  
    const newOffset = {
      x: offset.x - deltaX,
      y: offset.y - deltaY
    };

    // Ограничиваем смещение
    const clampedOffset = clampOffset(newOffset);
    setOffset(clampedOffset);
    setStartPosition({x: e.clientX, y: e.clientY});

    // Обновляем позицию контента
    if (canvasRef.current) {
      // Используем transform или scroll контейнера
      canvasRef.current.style.transform = `translate(${clampedOffset.x}px, ${clampedOffset.y}px)`;
    }
  }, [isDragging, startPosition, offset, clampOffset]);

  // Обработчик окончания перетаскивания
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'grab';
    }
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const handleResize = () => {
      const clampedOffset = clampOffset(offset);
      setOffset(clampedOffset);
      if (canvasRef.current) {
        canvasRef.current.style.transform = `translate(${clampedOffset.x}px, ${clampedOffset.y}px)`;
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [offset, clampOffset]);

  // Обработчик колесика мыши
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      
      if (e.deltaY > 0) {
        zoomOut();
      } else {
        zoomIn();
      }
    }
  }, [zoomIn, zoomOut]);

  // Добавляем обработчик на скролл
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  const gridStyle = {
    backgroundImage: `
      linear-gradient(to right, ${cellBorderColor} 1px, transparent 1px),
      linear-gradient(to bottom, ${cellBorderColor} 1px, transparent 1px)
    `,
    backgroundSize: `${cellSize * scale}px ${cellSize * scale}px`
  };

  const baseStyle = {
    width: width * scale,
    height: height * scale,
    transform: `translate(${offset.x}px, ${offset.y}px)`, // Включаем transform
    willChange: 'transform', // Для производительности
    cursor: isDragging ? 'grabbing' : 'grab' //  Добавляем курсор
  };

  return (
    <div className="w-screen h-[88vh] max-w-[100vw] overflow-scroll relative no-scrollbar" ref={containerRef}>
      <div
        ref={canvasRef}
        style={isGridOpen ? {...gridStyle, ...baseStyle} : {...baseStyle}} 
        className={`absolute top-0 left-0 z-10 -mt-px select-none`} // Добавляем select-none
        onMouseDown={handleMouseDown}
        // onClick={!isDragging ? openCreateTableModal : () => {}}
        >
          {tables.map((table) => (
            <Table key={table.name} table={table} scale={scale} openDeleteTableModal={openDeleteTableModal}/>
          ))}
      </div>
    </div>
  );
}