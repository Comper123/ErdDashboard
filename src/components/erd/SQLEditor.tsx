import { SQLEditorProps } from "@/types/erd/sqleditor";
import { X } from "lucide-react";


export default function SQLEditor({
  isOpen,
  onClose
} : SQLEditorProps){

  if (!isOpen) {
    return null;
  }

  return (
    <div className="absolute z-20 right-0 top-0 border-l w-80 max-h-[88vh] min-h-[88vh] h-[88vh] p-6 overflow-y-auto bg-white">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">SQL Редактор</h2>
        <div onClick={onClose} className="cursor-pointer duration-300 bg-gray-100 hover:bg-gray-200 p-2 rounded-full">
          <X className="h-5 w-5"/>
        </div>
      </div>
    </div>
  )
}