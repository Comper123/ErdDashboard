'use client';

import SchemaCard from '@/components/cards/SchemaCard';
import Header from '@/components/Header';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/form/Input';
import Button from '@/components/ui/form/Button';
import { useAuth } from '@/hooks/useAuth';
import { Schema } from '@/types/schemas';
import { Plus, Search, X, Trash } from "lucide-react"
import { useEffect, useState } from 'react';
import EmptySearch from "@/components/EmptySearch"


interface CreatedSchema{
  name: string;
  description: string;
  createdTime?: Date;
  updateTime?: Date;
  id: string;
}


export default function DashboardPage() {
  // Состояния
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Данные
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [searchSchemas, setSearchSchemas] = useState<Schema[]>([]);
  const { user, accessToken } = useAuth();
  const [createdSchema, setCreatedSchema] = useState<CreatedSchema>({name: '', description: '', id: '1'})
  const [searchText, setSearchText] = useState<string>('');
  const [editedSchema, setEditedSchema] = useState<CreatedSchema>({name: '', description: '', id: '1'})

  const [deletedSchemaName, setDeletedSchemaName] = useState<string>('');
  const [deletedSchemaId, setDeletedSchemaId] = useState<string>('');

  const [editedSchemaName, setEditedSchemaName] = useState<string>('');
  const [editedSchemaId, setEditedSchemaId] = useState<string>('');

  useEffect(() => {
    setSearchSchemas(schemas.filter((schema) => schema.name.startsWith(searchText)));
  }, [schemas, searchText])

  useEffect(() => {
    async function fetchSchemas() {
        try {
          const response = await fetch('/api/schemas', {
            headers: {
              'authorization': `Bearer ${accessToken}`,
            },
          });
          if (!response.ok) {
            throw new Error('Ошибка загрузки схем');
          }
        const data = await response.json();
        setSchemas(data);
        setSearchSchemas(data);
        console.log('Загруженные схемы:', data);
      } catch (error) {
        console.error('Ошибка при загрузке схем:', error);
      }
    }

    if (user && accessToken) {
      fetchSchemas();
    }
  }, [user, accessToken])

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreatedSchema({name: '', description: '', id: '1'});
  }

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  }

  // Обработчик создания схемы
  const handleCreateSchema = async (e: React.SubmitEvent) => {
    e.preventDefault();
    try {
      // Отправляем запрос на сервер
      const response = await fetch(`/api/schemas`, {
        method: "POST",
        body: JSON.stringify({
          name: createdSchema.name,
          description: createdSchema.description
        }),
        headers: {
          'authorization': 'Bearer ' + accessToken
        }
      });
      if (response.ok) {
        // В случае успешно выполненного запроса на сервере создаем без перезагрузки новую схему
        const newSchema = await response.json();
        setSchemas(prevSchemas => [newSchema, ...prevSchemas]);
        closeCreateModal();
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleDeleteSchema = async() => {
    try {
      const response = await fetch(`/api/schemas/${deletedSchemaId}`, {
        method: "DELETE",
        headers: {
          'authorization': 'Bearer ' + accessToken
        }
      });
      if (response.ok){
        setSchemas(prev => prev.filter(schema => schema.id !== deletedSchemaId)); 
        setIsDeleteModalOpen(false);
      } else {
        console.log("Ошибка удаления схемы");
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  const handleEditSchema = async(e: React.SubmitEvent) => {
    e.preventDefault();
    try {
      console.log(editedSchema);
      const response = await fetch(`/api/schemas/${editedSchemaId}`, {
        method: "PUT",
        headers: {
          'authorization': 'Bearer ' + accessToken
        },
        body: JSON.stringify({
          name: editedSchema.name,
          description: editedSchema.description
        })
      });
      if (response.ok) {
        const editedSchema = await response.json();
        console.log(editedSchema);
        setSchemas(schemas => {
          return schemas.map(schema => 
            schema.id === editedSchemaId ? 
              {...schema, 
                name: editedSchema.name, 
                description: editedSchema.description, 
                updatedAt: editedSchema.updatedAt} 
            : schema)
        });
        setIsEditModalOpen(false);
      } else {  
        console.log("Ошибка измнения схемы");
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-[99vw]">
      <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal} title='Создание новой схемы данных' size='sm'>
        <form action="" method='POST' className='py-6 flex flex-col gap-4' onSubmit={handleCreateSchema}>
          <Input type='text' label='Название' value={createdSchema.name} required
            onChange={(e) => setCreatedSchema({...createdSchema, name: e.target.value})}/>
          <Input multiline label='Описание схемы данных' value={createdSchema.description} required
            onChange={(e) => setCreatedSchema({...createdSchema, description: e.target.value})}/>
          <Button size='full'>Создать</Button>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title='Удаление схемы данных' size='sm'>
        <p className='mt-1 mb-4 text-gray-600'>Вы действительно хотите удалить схему: <b className='text-black bg-gray-200 px-2 pb-1 rounded-md'>{deletedSchemaName}</b></p>
        <div className='rounded-lg bg-red-50 border border-red-200 flex gap-4 p-4 mb-6'> 
          <div className="flex-shrink-0">
            <div className='bg-red-100 rounded-full p-3'>
              <Trash className='w-6 h-6 text-red-600' />
            </div>
          </div>
          
          <div className="space-y-1 text-sm">
            <p className="font-medium text-red-800">Безвозвратное удаление</p>
            <p className='text-red-600'>Вы не сможете восстановить эту схему данных.</p>
            <p className='text-red-600'>Она будет удалена безвозвратно.</p>
            <p className='text-red-600 font-medium'>Вы уверены?</p>
          </div>
        </div>
        <div className='grid grid-cols-2 gap-2'>
          <Button size='full' color='gray' type='button' onClick={() => setIsDeleteModalOpen(false)}>Отмена</Button>
          <Button size='full' color='red' onClick={() => handleDeleteSchema()}>Удалить</Button>
        </div>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title='Изменение схемы данных' size='sm'>
        <p className='mt-1 text-gray-600'>Изменение схемы: <b className='text-black bg-gray-200 px-2 pb-1 rounded-md'>{editedSchemaName}</b></p>
        <form action="" method='POST' className='py-6 flex flex-col gap-4' onSubmit={(e) => handleEditSchema(e)}>
          <Input type='text' label='Название' value={editedSchema.name} required
            onChange={(e) => setEditedSchema({...editedSchema, name: e.target.value})}/>
          <Input multiline label='Описание схемы данных' value={editedSchema.description} required
            onChange={(e) => setEditedSchema({...editedSchema, description: e.target.value})}/>
          <div className='grid grid-cols-2 gap-2'>
          <Button size='full' color='gray' type='button' onClick={() => setIsEditModalOpen(false)}>Отмена</Button>
          <Button size='full' color='red'>Изменить</Button>
        </div>
        </form>
      </Modal>

      <Header></Header>
      <section className='px-[10%] pt-10 pb-20'>
        <h2 className='font-bold text-2xl'>Ваши схемы данных:</h2>
        <div className='mt-2 mb-1 flex gap-2 w-1/3 items-center'>
          <div className='relative w-full'> 
            <Search className='absolute top-2 left-2 h-5 text-gray-400'/>
            <input type="text" className='h-9 rounded-[14px] w-full pl-9 text-sm focus:shadow-lg border focus:border-indigo-500 outline-none transition-all'
              onChange={(e) => setSearchText(e.target.value)} value={searchText} placeholder='Введите название схемы:'/>
            {searchText.length !== 0 && (
            <div className='absolute top-1 h-7 w-7 right-2 rounded-full flex items-center justify-center cursor-pointer duration-300 hover:bg-slate-300/20'
              onClick={() => setSearchText('')}>
              <X className='h-5 text-gray-400'/>
            </div>
          )}
          </div>
        </div>
        {searchText.length !== 0 && searchSchemas.length === 0 && (
          <EmptySearch />
        )}
        <article className=' grid grid-cols-3 pt-4 gap-5'>
          {searchText.length === 0 && (
            <div className='border rounded-lg p-4 min-h-40 flex flex-col items-center justify-center cursor-pointer hover:-translate-y-1 duration-300'
            onClick={openCreateModal}>
              <Plus className='text-gray-600'/>
              <p className='text-gray-600 font-medium'>Создать новую схему</p>
            </div>
          )}
          {searchSchemas.map((schema) => (
            <SchemaCard schema={schema} key={schema.id} 
              onDelete={() => {
                setDeletedSchemaId(schema.id);
                setDeletedSchemaName(schema.name);
                setIsDeleteModalOpen(true);
              }}
              onEdit={() => {
                setEditedSchemaId(schema.id);
                setEditedSchemaName(schema.name);
                setEditedSchema({name: schema.name, description: schema.description || '', id: schema.id});
                setIsEditModalOpen(true);
              }}
              />
          ))}
        </article>
      </section>
      
    </div>
  );
}