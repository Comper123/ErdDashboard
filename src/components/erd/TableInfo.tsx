import { TableInfoProps } from "@/types/erd/tableinfo";
import { X } from "lucide-react";

export default function TableInfo({
  isOpen,
  onClose
}: TableInfoProps) {

  if (!isOpen) {
    return null;
  }

  return (
    <div className="absolute left-0 top-0 border-r w-80 max-h-[88vh] min-h-[88vh]  h-[88vh] p-6 bg-white z-20">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Свойства таблиц</h2>
        <div onClick={onClose} className="cursor-pointer duration-300 bg-gray-100 hover:bg-gray-200 p-2 w-max rounded-full">
          <X className="h-5 w-5"/>
        </div>
      </div>
    </div>
  )
}