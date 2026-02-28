'use client';

import SchemaCard from '@/components/cards/SchemaCard';
import Header from '@/components/Header';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/form/Input';
import Button from '@/components/ui/form/Button';
import { useAuth } from '@/hooks/useAuth';
import { Schema } from '@/types/schemas';
import { Plus } from "lucide-react"
import { useEffect, useState } from 'react';


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

  // Данные
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const { user, accessToken } = useAuth();
  const [createdSchema, setCreatedSchema] = useState<CreatedSchema>({name: '', description: '', id: '1'})

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal} title='Создание новой схемы данных' size='sm'>
        <form action="" method='POST' className='py-6 flex flex-col gap-4' onSubmit={handleCreateSchema}>
          <Input type='text' label='Название' value={createdSchema.name} required
            onChange={(e) => setCreatedSchema({...createdSchema, name: e.target.value})}/>
          <Input multiline label='Описание схемы данных' value={createdSchema.description} required
            onChange={(e) => setCreatedSchema({...createdSchema, description: e.target.value})}/>
          <Button size='full'>Создать</Button>
        </form>
      </Modal>

      <Header></Header>
      <section className='px-[10%] pt-10'>
        <h2 className='font-semibold text-lg'>Ваши схемы данных:</h2>
        <article className=' grid grid-cols-3 pt-4 gap-5'>
          <div className='border rounded-lg p-4 min-h-40 flex flex-col items-center justify-center cursor-pointer hover:-translate-y-1 duration-300'
          onClick={openCreateModal}>
            <Plus className='text-gray-600'/>
            <p className='text-gray-600 font-medium'>Создать новую схему</p>
          </div>
          {schemas.map((schema) => (
            <SchemaCard schema={schema} key={schema.id}></SchemaCard>
          ))}
        </article>
      </section>
      
    </div>
  );
}