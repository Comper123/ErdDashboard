import { TableComponentProps } from "@/types/erd/erdeditor";

export default function Table({ 
  scale 
} : TableComponentProps){
  return (
    <div className={`bg-slate-500 w-48 h-96 absolute`} style={{transform: `scale(${scale})`}}>

    </div>
  )
} 