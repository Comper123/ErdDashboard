import { dateToString } from "@/lib/utils/date";
import { Schema } from "@/types/schemas";
import { SquarePen, ClockPlus, Pencil, Trash } from "lucide-react";
import ActionsBlock from "@/components/ui/actions/ActionsBlock";
import Action from "@/components/ui/actions/Action";
import { useRef, useState } from "react";
import { useRouter } from "next/router";


interface SchemaCardProps {
  schema: Schema,
  onDelete: () => void;
  onEdit: () => void;
}

interface EditSchema {
  name?: string;
  description?: string;
}


export default function SchemaCard({ 
  schema,
  onDelete,
  onEdit
} : SchemaCardProps){
  // const [editSchema, setEditSchema] = useState<EditSchema>({name: schema.name, description: schema.description || ''});
  // const [isEditName, setIsEditName] = useState<boolean>(false);
  // const [isEditDescription, setIsEditDescription] = useState<boolean>(false);
  // const nameRef = useRef<HTMLInputElement>(null);
  // const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const [isOpenActions, setIsOpenActions] = useState<boolean>(false);

  return (
    <a className="border rounded-lg p-4 min-h-40 flex flex-col duration-300 hover:-translate-y-1 cursor-pointer"
      href={`/dashboard/schemas/${schema.id}`}>
      <div className="flex justify-between">
        {/* Изменяемые поля (попытка) */}
        {/* <div className="w-full mr-2">
          <div className="w-full">
            {!isEditName ? (
              <h3 className="font-semibold text-lg" 
                onClick={() => setIsEditName(true)}>{schema.name}</h3>
            ) : (
              <input type="text" className="bg-transparent w-full font-semibold text-lg" 
                value={editSchema.name} 
                onChange={(e) => setEditSchema({...editSchema, name: e.target.value})}
                ref={nameRef}/>
            )}
          </div>
          <div className="w-full h-full">
            {!isEditDescription ? (
              <p className="text-gray-600 text-sm"
                onClick={() => {
                  setIsEditDescription(true);
                  descriptionRef.current?.focus()
                }}>{schema.description}</p>
            ) : (
              <textarea className="bg-transparent w-full text-gray-600 text-sm resize-none overflow-hidden" 
                value={editSchema.description} 
                onChange={(e) => setEditSchema({...editSchema, description: e.target.value})}
                ref={descriptionRef}/>
            )}
          </div>
        </div> */}
        <div>
          <h3 className="font-semibold text-lg">{schema.name}</h3>
          <p className="text-gray-600 text-sm">{schema.description}</p>
        </div>
        <ActionsBlock className="min-w-[200px]" isOpen={isOpenActions} setIsOpen={setIsOpenActions}>
          <Action onClick={() => onDelete()} afterClick={() => setIsOpenActions(false)}><Trash className="h-4"/>Удалить</Action>
          <Action onClick={() => onEdit()} afterClick={() => setIsOpenActions(false)}><Pencil className="h-4"/>Изменить</Action>
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
    </a>
  )
}