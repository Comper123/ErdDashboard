import { ERDEditorProps } from "@/types/erd/erdeditor";

export default function ERDEditor({
  isGridOpen
} : ERDEditorProps){
  const cellSize = 40;
  const cellBorderColor = "#80808020";

  const gridStyle = {
    backgroundImage: `
      linear-gradient(to right, ${cellBorderColor} 1px, transparent 1px),
      linear-gradient(to bottom, ${cellBorderColor} 1px, transparent 1px)
    `,
    backgroundSize: `${cellSize}px ${cellSize}px`
  };

  return (
    <div className="w-screen h-[88vh] max-w-[100vw] overflow-scroll relative">
      <div style={isGridOpen ? gridStyle : {}} className={`
        absolute w-[3200px] h-[1800px] top-0 left-0 z-10 -mt-px`}>

      </div>
    </div>
  )
}