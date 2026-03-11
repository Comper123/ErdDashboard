'use client';


import { useAuth } from "@/hooks/useAuthSession";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowUp, Database, Download, Grid, Info, Map, Maximize, Plus, Save, Trash, Upload, ZoomIn, ZoomOut } from "lucide-react";
import Toolbar from "@/components/erd/Toolbar";
import ERDEditor from "@/components/erd/ERDEditor";
import SQLEditor from "@/components/erd/SQLEditor";
import TableInfo from "@/components/erd/TableInfo";
import EmptyUser from "@/components/EmptyUser";
import { SessionKeepAlive } from "@/components/SessionKeepAlive";
import { filedTypes, relationType, Table } from "@/types/erd/erdeditor";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/form/Input";
import { Field } from "@/types/erd/erdeditor";
import Button from "@/components/ui/form/Button";
import Select from "@/components/ui/form/Select";
import Switch from "@/components/ui/form/Swith";


export default function SchemaPage(){
  const { id } = useParams();
  const schemaId = id.toString();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [schema, setSchema] = useState<{
    id: string;
    name: string;
    description: string;
  } | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const emptyTable = {
    name: '',
    id: '',
    isFocused: true,
    position: {x: 0, y: 0},
    fields: [{name: '', position: 1, isNullable: false, type: '', isPrimaryKey: false, isUnique: false, defaultValue: '', isForeignKey: false, relationType: '', foreignTable: '', foreignField: ''}]
  };
  const [createTable, setCreateTable] = useState<Table>(emptyTable);
  const [createTableErrors, setCreateTableErrors] = useState({});

  // Состояние загрузки схемы
  const [isLoadingSchema, setIsLoadingSchema] = useState<boolean>(false);
  // Состояние открытия SQL редактора
  const [isSqlEditorOpen, setIsSqlEditorOpen] = useState<boolean>(false);
  // Состояние открытия информации о схеме
  const [isTableInfoOpen, setIsTableInfoOpen] = useState<boolean>(false);
  // Состояние грид сетки схемы
  const [isGridOpen, setIsGridOpen] = useState<boolean>(true);
  // Масштаб холста
  const [scale, setScale] = useState<number>(1.0);
  // Состояние открытия модального окна создания таблицы
  const [isOpenModalCreateTable, setIsOpenModalCreateTable] = useState<boolean>(false);
  // Состояние отправки данных на сервер
  const [isDataSending, setIsDataSending] = useState<boolean>(false);

  // Состояние открытия модального окна удаления таблицы
  const [isOpenModalDeleteTable, setIsOpenModalDeleteTable] = useState<boolean>(false);
  // Id удаляемой таблицы
  const [deletedTableId, setDeletedTableId] = useState<string>('');
  const [deletedTableName, setDeletedTableName] = useState<string>('');
  // Подтверждение удаляемой таблицы
  const [confirmTableName, setConfirmTableName] = useState<string>('');

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
          });
          setTables(data.tables);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoadingSchema(false);
      }
    }

    fetchSchemaDetail();
  }, [])

  // Функция приближения холста
  const zoomIn = () => {
    if (scale < 3) {
      setScale(prev => prev + 0.25);
    }
  }

  // Функция отдаления холста
  const zoomOut = () => {
    if (scale > 0.5) {
      setScale(prev => prev - 0.25);
    }
  }

  // Функция валидация создания таблицы
  const validateCreateTable = () => {
    if (tables.map(table => table.name).includes(createTable.name)){
      setCreateTableErrors(prev => ({...prev, name: "Такая таблица уже существует"}))
      throw new Error("Такая таблица уже существует")
    }
  }

  // Функция добавления таблицы
  const addTable = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setTables(prev => ([...prev, createTable]));

    // Отправка создаваемой таблицы на сервер
    try {
      setIsDataSending(true);
      validateCreateTable();
      const response  = await fetch(`/api/schemas/${id}/detail/table`, {
        method: "POST",
        body: JSON.stringify({table: createTable})
      })
      if (response.ok) {
        setIsOpenModalCreateTable(false);
        setCreateTable(emptyTable);
        
      } else {
        // SetError ?
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsDataSending(false);
    }
  }

  // Функция добавления пустого поля
  const addEmptyField = () => {
    const newPosition = createTable.fields.length;
    const newField = {
      name: '',
      position: newPosition + 1,
      isNullable: false,
      type: '',
      isPrimaryKey: false,
      isUnique: false,
      defaultValue: '',
      isForeignKey: false,
      relationType: '',
      foreignTable: '',
      foreignField: ''
    }
    setCreateTable(prev => ({...prev, fields: [...prev.fields, newField]}));
  }

  const setFieldValue = (fieldPos: number, property: keyof Field, value: any) => {
    setCreateTable(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.position === fieldPos ? { ...field, [property]: value } : field
      )
    }));
    if (property === 'isForeignKey') {

    }
  };

  const removeFieldByPosition = (fieldPos: number) => {
    setCreateTable(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.position !== fieldPos).map((f, index) => ({...f, position: index + 1}))
    }));
  }

  const replaceFields = (firstFieldPos: number, secondFieldPos: number) => {
    const firstField = createTable.fields.find(f => f.position === firstFieldPos);
    const secondField = createTable.fields.find(f => f.position === secondFieldPos);
    if (firstField && secondField) {
      setCreateTable(prev => ({
        ...prev,
        fields: prev.fields.map(field => {
          if (field.position === firstFieldPos) {
            return {...secondField, position: firstFieldPos}
          } else if (field.position === secondFieldPos) {
            return {...firstField, position: secondFieldPos}
          } else {
            return field
          }
        })
      }))
    }
  }

  const openDeleteModal = useCallback((tableId: string) => {
    setDeletedTableId(tableId);
    const tableName = tables.find(t => t.id == tableId)?.name || '';
    setDeletedTableName(tableName);
    setIsOpenModalDeleteTable(true);
    console.log(tableId);
  }, [])

  const handleDeleteTable = async () => {
    
  }

  if (!user && !authLoading){
    return <EmptyUser />;
  }

  return (
    <div className="h-screen w-screen max-h-screen">
      {/* Компонент поднятия сессии пользователя */}
      <SessionKeepAlive/>
      <Modal 
        isOpen={isOpenModalDeleteTable} 
        onClose={() => setIsOpenModalDeleteTable(false)}
        title={`Удаление таблицы`}
        size="sm">
        <div>
          <p>Вы действительно хотите удалить таблицу <span className="text-black bg-gray-200 px-2 pb-1 rounded-md font-medium">{deletedTableName}</span></p>
           <div className='rounded-lg bg-red-50 border border-red-200 flex gap-4 p-4 mb-6 mt-4'> 
              <div className="flex-shrink-0">
                <div className='bg-red-100 rounded-full p-3'>
                  <Trash className='w-6 h-6 text-red-600' />
                </div>
              </div>
              
              <div className="space-y-1 text-sm">
                <p className="font-medium text-red-800">Безвозвратное удаление</p>
                <p className='text-red-600'>Вы не сможете восстановить эту таблицу.</p>
                <p className='text-red-600'>Она будет удалена безвозвратно.</p>
                <p className='text-red-600 font-medium'>Вы уверены?</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-gray-400 text-sm font-medium">Для подтверждения удаления введите имя удаляемой таблицы</p>
              <Input type="text" value={confirmTableName} onChange={(e) => setConfirmTableName(e.target.value)} className="mt-2 mb-6" placeholder={deletedTableName}/>
            </div>
            <div className='grid grid-cols-2 gap-2'>
              <Button size='full' color='gray' type='button' onClick={() => setIsOpenModalDeleteTable(false)}>Отмена</Button>
              <Button size='full' color='red' onClick={() => handleDeleteTable()}>Удалить</Button>
            </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isOpenModalCreateTable} 
        onClose={() => setIsOpenModalCreateTable(false)}
        size="xl"
        title="Создание таблицы">
        <div className="mt-3">
          <form action="" onSubmit={(e) => addTable(e)}>
            <div className="w-1/3">
              <Input type="text" label="Название" placeholder="Например: users" value={createTable.name} 
                onChange={(e) => setCreateTable(table => ({...table, name: e.target.value}))}
                isError={createTableErrors?.name ? true : false}/>
            </div>
            {/* Заголовок полей */}
            <div className="flex items-center justify-between mb-3 mt-5">
              <p className="text-gray-700 font-medium">Поля таблицы</p>
              <button
                type="button"
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                onClick={() => addEmptyField()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Добавить поле
              </button>
            </div>
            {/* Шапка таблицы */}
            <div className="flex items-center w-full mb-2 text-gray-600 font-semibold text-sm">
              <p className="my-auto pr-4">#</p>
              <div className="grid grid-cols-24 gap-3 w-full">
                <p className="col-span-3">Название</p>
                <p className="col-span-3">Тип данных</p>
                <p className="">PK</p>
                <p className="">NULL</p>
                <p className="">Uniq</p>
                <p className="col-span-2">Default</p>
                <p className="">FK</p>
                <p className="col-span-3">Relationship</p>
                <p className="col-span-3">ForeignTable</p>
                <p className="col-span-3">ForeignField</p>
                <p className="col-span-3">Действия</p>
              </div>
            </div>
             <div className="overflow-y-auto max-h-[50vh] h-[50vh] pt-2 -mt-1 flex flex-col gap-3 -mr-[8px] custom-scrollbar no-scrollbar-compensation">
              {/* Поля таблицы */}
              {createTable.fields.map((field, index) => (
                <div className="flex items-center w-full" key={index}>
                  <p className="my-auto text-gray-600 font-semibold text-sm pr-4">{index + 1}</p>
                  <div className="grid grid-cols-24 gap-3 w-full">
                    {/* Название поля */}
                    <div className="col-span-3">
                      <Input type="text" placeholder="fieldname" inputSize="small" value={field.name} onChange={(e) => setFieldValue(index + 1, 'name', e.target.value)}/>
                    </div>
                    <div className="col-span-3 h-full flex items-center">
                      <Select label="" options={filedTypes} inputSize='small' value={field.type} onChange={(e) => setFieldValue(index + 1, 'type', e.target.value)}/>
                    </div>
                    <div>
                      <Switch label="" value={field.isPrimaryKey} onChange={() => setFieldValue(index + 1, 'isPrimaryKey', !field.isPrimaryKey)}></Switch>
                    </div>
                    <div>
                      <Switch label="" value={field.isNullable} onChange={() => setFieldValue(index + 1, 'isNullable', !field.isNullable)}></Switch>
                    </div>
                    <div>
                      <Switch label="" value={field.isUnique} onChange={() => setFieldValue(index + 1, 'isUnique', !field.isUnique)}></Switch>
                    </div>
                    <div className="col-span-2">
                      <Input type="text" label="" placeholder="value" inputSize="small" value={field.defaultValue} onChange={(e) => setFieldValue(index + 1, 'defaultValue', e.target.value)}/>
                    </div>
                    <div>
                      <Switch label="" value={field.isForeignKey} onChange={() => setFieldValue(index + 1, 'isForeignKey', !field.isForeignKey)}></Switch>
                    </div>
                    <div className="col-span-3">
                      <Select label="" options={relationType} disabled={!field.isForeignKey} inputSize='small' value={field.relationType} onChange={(e) => setFieldValue(index + 1, 'relationType', e.target.value)}/>
                    </div>
                    <div className="col-span-3">
                      <Select label="" options={filedTypes} disabled={!field.isForeignKey} inputSize='small' value={field.type} onChange={(e) => setFieldValue(index + 1, 'type', e.target.value)}/>
                    </div>
                    <div className="col-span-3">
                      <Select label="" options={filedTypes} disabled={!field.isForeignKey} inputSize='small' value={field.type} onChange={(e) => setFieldValue(index + 1, 'type', e.target.value)}/>
                    </div>
                    {/* Кнопки управления полем */}
                    <div className="flex items-center w-full gap-1 col-span-3">
                      <div className="p-2 rounded hover:bg-red-500/20 duration-300 cursor-pointer"
                        onClick={() => removeFieldByPosition(index + 1)}>
                        <Trash size={18} className="text-red-500"/>
                      </div>
                      {index !== createTable.fields.length - 1 ? (
                        <div className="p-2 rounded hover:bg-green-500/20 duration-300 cursor-pointer"
                          onClick={() => replaceFields(index + 1, index + 2)}>
                          <ArrowDown size={18} className="text-green-500"/>
                        </div>
                      ) : (
                        <div className="p-2"><ArrowDown size={18} color="white"/></div>
                      )}
                      {index !== 0 ? (
                        <div className="p-2 rounded hover:bg-indigo-500/20 duration-300 cursor-pointer"
                          onClick={() => replaceFields(index + 1, index)}>
                          <ArrowUp size={18} className="text-indigo-500"/>
                        </div>
                      ) : (
                        <div></div>
                      )}
                    </div>
                 </div>
               </div>
              ))}
            </div>
            <div className="mt-6 flex justify-between">
              <p className="text-sm text-gray-600">Полей в таблице {createTable.name}: {createTable.fields.length}</p>
              <Button type="submit" >Добавить</Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Шапка схемы */}
      <div className="px-[10%] py-4 bg-gray-50 border h-[12vh] flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-2xl flex items-center gap-2 -ml-8"><Database/>{schema?.name}</h2>
          <p className="text-gray-400 text-sm">{schema?.description}</p>
        </div>
        <div>
          <a href="/dashboard" className="bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 px-6 py-2 rounded-lg flex items-center gap-2"><ArrowLeft className="h-4"/>Мои схемы</a>
        </div>
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
            <Toolbar.Button 
              icon={<Plus size={20}/>} 
              onClick={() => setIsOpenModalCreateTable(true)}/>
          </Toolbar.Group>
          
          <Toolbar.Divider />

          <Toolbar.Group>
            {/* Приближение зума */}
            <Toolbar.Button 
              icon={<ZoomIn size={20}/>}
              onClick={() => zoomIn()}/>
            {/* Отдаление зума */}
            <Toolbar.Button 
              icon={<ZoomOut size={20}/>}
              onClick={() => zoomOut()}/>
            {/* Вернуть исходный размер */}
            <Toolbar.Button 
              icon={<Maximize size={20}/>}
              onClick={() => setScale(1)}/>
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
          isGridOpen={isGridOpen}
          scale={scale}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          openDeleteTableModal={openDeleteModal}
          tables={tables}>

        </ERDEditor>
        <SQLEditor
          isOpen={isSqlEditorOpen} 
          onClose={() => setIsSqlEditorOpen(false)}>

        </SQLEditor>
      </section>
    </div>
  )
}