'use client';

import SchemaCard from '@/components/cards/SchemaCard';
import Header from '@/components/Header';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/hooks/useAuth';
import { Schema } from '@/types/schemas';
import { Plus } from "lucide-react"
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  // Состояния
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Данные
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const { user, accessToken } = useAuth();

  useEffect(() => {
    async function fetchSchemas() {
        try {
          const response = await fetch('/api/schemas', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });
          if (!response.ok) {
            throw new Error('Ошибка загрузки схем');
          }
        const data = await response.json();
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
  }

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal}>
        <p>Привет</p>
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