import { Schema } from "@/types/schemas";

interface SchemaProps {
  schema: Schema
}


export default function SchemaCard({ schema } : SchemaProps){
  return (
    <div className="border rounded-lg p-4 min-h-40">
      <p>{schema.name}</p>
    </div>
  )
}