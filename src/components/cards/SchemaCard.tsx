import { dateToString } from "@/lib/utils/date";
import { Schema } from "@/types/schemas";
import { SquarePen, ClockPlus } from "lucide-react";
import ActionsBlock from "@/components/ui/actions/ActionsBlock";
import Action from "@/components/ui/actions/Action";


interface SchemaProps {
  schema: Schema
}


export default function SchemaCard({ schema } : SchemaProps){

  return (
    <div className="border rounded-lg p-4 min-h-40 flex flex-col">
      <div className="flex justify-between">
        <div>
          <h3 className="font-semibold text-lg">{schema.name}</h3>
          <p className="text-gray-600 text-sm">{schema.description}</p>
        </div>
        <ActionsBlock>
          <Action>Удалить</Action>
          <Action>Изменить</Action>
        </ActionsBlock>
      </div>
      <div className="mt-auto flex gap-4   justify-end">
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