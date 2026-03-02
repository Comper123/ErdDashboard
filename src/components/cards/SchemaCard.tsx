import { dateToString } from "@/lib/utils/date";
import { Schema } from "@/types/schemas";
import { SquarePen, ClockPlus, Pencil, Trash } from "lucide-react";
import ActionsBlock from "@/components/ui/actions/ActionsBlock";
import Action from "@/components/ui/actions/Action";


interface SchemaCardProps {
  schema: Schema,
  onDelete: () => void;
}


export default function SchemaCard({ 
  schema,
  onDelete 
} : SchemaCardProps){

  return (
    <div className="border rounded-lg p-4 min-h-40 flex flex-col duration-300 hover:-translate-y-1 cursor-pointer">
      <div className="flex justify-between">
        <div>
          <h3 className="font-semibold text-lg">{schema.name}</h3>
          <p className="text-gray-600 text-sm">{schema.description}</p>
        </div>
        <ActionsBlock className="min-w-[200px]">
          <Action onClick={() => onDelete()}><Trash className="h-4"/>Удалить</Action>
          {/* <Action><Pencil className="h-4"/>Изменить</Action> */}
        </ActionsBlock>
      </div>
      <div className="mt-auto flex gap-4 justify-end">
        <div className="text-gray-400 text-xs font-semibold flex">
          <ClockPlus className="h-4" />
          <p>{dateToString(schema.createdAt)}</p>
        </div>
        <div className="text-gray-400 text-xs font-semibold flex">
          <SquarePen className="h-4" />
          <p>{dateToString(schema.updatedAt)}</p>
        </div>
      </div>
    </div>
  )
}