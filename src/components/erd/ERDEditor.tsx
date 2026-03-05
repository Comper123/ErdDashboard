import { ERDEditorProps } from "@/types/erd/erdeditor";
import { useCallback, useEffect, useRef, useState } from "react";

export default function ERDEditor({
  isGridOpen,
  scale,
  zoomIn,
  zoomOut
} : ERDEditorProps){
  const cellSize = 40;
  const cellBorderColor = "#80808020";
  const width = 3200;
  const height = 1800;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
      const scrollTop = (container.scrollHeight - container.clientHeight) / 2;
      container.scrollTo(scrollLeft, scrollTop);
    }
  }, [scale])

  // Обработчик колесика мыши
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      
      // Определяем направление прокрутки
       if (e.deltaY > 0) {
        zoomOut();
      } else {
        zoomIn();
      }
    }
  }, [zoomIn, zoomOut]);

  // Добавляем обработчик на скролл и ctrl по холсту
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

  return (
    <div className="w-screen h-[88vh] max-w-[100vw] overflow-scroll relative" ref={containerRef}>
      <div 
        style={isGridOpen ? 
          {...gridStyle,
            width: width * scale,
            height: height * scale
          } : {
            width: width * scale,
            height: height * scale
          }} 
        className={`absolute top-0 left-0 z-10 -mt-px `}>

      </div>
    </div>
  )
}