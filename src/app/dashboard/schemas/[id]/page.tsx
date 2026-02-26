// src/app/dashboard/schemas/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSchemas, SchemaDetails } from '@/hooks/useSchemas';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ERDEditor from '@/components/erd/ERDEditor';
import { TableData, RelationshipData } from '@/components/erd/ERDEditor';

export default function SchemaPage() {
  const { user, isLoading: authLoading, accessToken } = useAuth();
  const { getSchemaDetails, updateSchema } = useSchemas();
  const router = useRouter();
  const params = useParams();
  const schemaId = params?.id as string;

  const [schema, setSchema] = useState<SchemaDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user && schemaId) {
      loadSchema();
    }
  }, [user, schemaId]);

  const loadSchema = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSchemaDetails(schemaId);
      setSchema(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (tables: TableData[], relationships: RelationshipData[]) => {
    if (!accessToken || !schema) return;
    
    try {
      setIsSaving(true);
      
      // Сохраняем через API
      const response = await fetch(`/api/schemas/${schemaId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: schema.name,
          description: schema.description,
          tables,
          relationships,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при сохранении');
      }

      // Обновляем локальное состояние
      setSchema(prev => prev ? {
        ...prev,
        tables,
        relationships,
      } : null);

      alert('Схема успешно сохранена!');
    } catch (err: any) {
      alert(`Ошибка: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/dashboard"
            className="text-indigo-600 hover:text-indigo-800"
          >
            ← Вернуться к списку схем
          </Link>
        </div>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Схема не найдена</p>
          <Link
            href="/dashboard"
            className="text-indigo-600 hover:text-indigo-800"
          >
            ← Вернуться к списку схем
          </Link>
        </div>
      </div>
    );
  }

  // Преобразуем данные для редактора
  const initialTables: TableData[] = schema.tables.map(table => ({
    id: table.id,
    name: table.name,
    fields: table.fields,
    positionX: parseFloat(table.positionX) || 100,
    positionY: parseFloat(table.positionY) || 100,
    config: table.config || {},
  }));

  const initialRelationships: RelationshipData[] = schema.relationships.map(rel => ({
    id: rel.id,
    fromTableId: rel.fromTableId,
    fromFieldId: rel.fromFieldId,
    toTableId: rel.toTableId,
    toFieldId: rel.toFieldId,
    type: rel.type as any,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Назад
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{schema.name}</h1>
                {schema.description && (
                  <p className="text-sm text-gray-600">{schema.description}</p>
                )}
              </div>
            </div>
            
            {/* Индикатор сохранения */}
            {isSaving && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                Сохранение...
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Основной контент - ERD Editor */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ERDEditor
          schemaId={schemaId}
          initialTables={initialTables}
          initialRelationships={initialRelationships}
          onSave={handleSave}
        />
        
        {/* Подсказки */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-indigo-500 rounded-full"></div>
            <span>Перетаскивайте таблицы для изменения позиции</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-indigo-500 rounded-full"></div>
            <span>Соединяйте поля таблиц для создания связей</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-indigo-500 rounded-full"></div>
            <span>Кликайте на таблицу для редактирования полей</span>
          </div>
        </div>
      </main>
    </div>
  );
}