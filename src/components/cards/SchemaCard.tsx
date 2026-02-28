import { dateToString } from "@/lib/utils/date";
import { Schema } from "@/types/schemas";
import { SquarePen, ClockPlus } from "lucide-react"


interface SchemaProps {
  schema: Schema
}


export default function SchemaCard({ schema } : SchemaProps){

  return (
    <div className="border rounded-lg p-4 min-h-40 flex flex-col">
      <h3 className="font-semibold text-lg">{schema.name}</h3>
      <p className="text-gray-600 text-sm">{schema.description}</p>
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