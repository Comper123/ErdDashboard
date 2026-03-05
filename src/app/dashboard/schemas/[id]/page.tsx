'use client';


import { useAuth } from "@/hooks/useAuthSession";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Database, Download, Grid, Info, Map, Maximize, Plus, Save, Upload, ZoomIn, ZoomOut } from "lucide-react";
import Toolbar from "@/components/erd/Toolbar";
import ERDEditor from "@/components/erd/ERDEditor";
import SQLEditor from "@/components/erd/SQLEditor";
import TableInfo from "@/components/erd/TableInfo";
import EmptyUser from "@/components/EmptyUser";
import { SessionKeepAlive } from "@/components/SessionKeepAlive";


export default function SchemaPage(){
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [schema, setSchema] = useState<{
    id: string;
    name: string;
    description: string;
  } | null>(null);

  // Состояние загрузки схемы
  const [isLoadingSchema, setIsLoadingSchema] = useState<boolean>(false);

  // Состояние открытия SQL редактора
  const [isSqlEditorOpen, setIsSqlEditorOpen] = useState<boolean>(false);
  // Состояние открытия информации о схеме
  const [isTableInfoOpen, setIsTableInfoOpen] = useState<boolean>(false);
  // Состояние грид сетки схемы
  const [isGridOpen, setIsGridOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchSchemaDetail = async () => {
      try {
        setIsLoadingSchema(true);
        const response = await fetch(`/api/schemas/${id}/detail`);
        const data = await response.json();

        if (response.ok){
          setSchema({
            id: data.id,
            name: data.name,
            description: data.description
          })
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoadingSchema(false);
      }
    }

    fetchSchemaDetail();
  }, [])

  if (!user && !authLoading){
    return <EmptyUser />;
  }

  return (
    <div className="h-screen w-screen max-h-screen">
      {/* Компонент поднятия сессии пользователя */}
      <SessionKeepAlive/>

      {/* Шапка схемы */}
      <div className="px-[10%] py-4 bg-gray-50 border h-[12vh]">
        <h2 className="font-semibold text-2xl flex items-center gap-2 -ml-8"><Database/>{schema?.name}</h2>
        <p className="text-gray-400 text-sm">{schema?.description}</p>
      </div>

      {/* Редактор схемы */}
      <section className="relative h-[88vh]">
        <TableInfo 
          isOpen={isTableInfoOpen} 
          onClose={() => setIsTableInfoOpen(false)}>

        </TableInfo>
        <Toolbar>
          <Toolbar.Group>
            {/* Добавление новой таблицы */}
            <Toolbar.Button icon={<Plus size={20}/>} />
          </Toolbar.Group>
          
          <Toolbar.Divider />

          <Toolbar.Group>
            {/* Приближение зума */}
            <Toolbar.Button icon={<ZoomIn size={20}/>}/>
            {/* Отдаление зума */}
            <Toolbar.Button icon={<ZoomOut size={20}/>}/>
            {/* Вернуть исходный размер */}
            <Toolbar.Button icon={<Maximize size={20}/>}/>
            {/* Отображение сетки */}
            <Toolbar.Button icon={<Grid size={20}/>}
              active={isGridOpen}
              onClick={() => setIsGridOpen(prev => !prev)}/>
            {/* Отображение миникарты */}
            <Toolbar.Button icon={<Map size={20}/>}/>
          </Toolbar.Group>

          <Toolbar.Divider />

          <Toolbar.Group>
            {/* Меню SQL */}
            <Toolbar.Button 
              active={isSqlEditorOpen} 
              onClick={() => setIsSqlEditorOpen(prev => !prev)}>
                SQL
            </Toolbar.Button>

            {/* Меню свойства таблицы */}
            <Toolbar.Button 
              icon={<Info size={20}/>} 
              onClick={() => setIsTableInfoOpen(prev => !prev)}
              active={isTableInfoOpen}/>
          </Toolbar.Group>

          <Toolbar.Divider />

          <Toolbar.Group>
            {/* Сохранение */}
            <Toolbar.Button icon={<Save size={20}/>}/>
            {/* Экспорт */}
            <Toolbar.Button icon={<Upload size={20}/>}/>
            {/* Импорт */}
            <Toolbar.Button icon={<Download size={20}/>}/>
          </Toolbar.Group>
        </Toolbar>
        
        <ERDEditor
          isGridOpen={isGridOpen}>

        </ERDEditor>
        <SQLEditor
          isOpen={isSqlEditorOpen} 
          onClose={() => setIsSqlEditorOpen(false)}>

        </SQLEditor>
      </section>
    </div>
  )
}