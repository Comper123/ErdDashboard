// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSchemas } from '@/hooks/useSchemas';
import { useRouter } from 'next/navigation';
import SchemaCard from '@/components/schemas/SchemaCard';
import CreateSchemaModal from '@/components/schemas/CreateSchemaModal';
import EmptyState from '@/components/schemas/EmptyState';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { schemas, isLoading: schemasLoading, error, createSchema, updateSchema, deleteSchema } = useSchemas();
  const router = useRouter();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const filteredSchemas = schemas.filter(schema =>
    schema.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (schema.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Schemas</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your database schemas and ERD models
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              New Schema
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search bar */}
        {schemas.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search schemas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Loading state */}
        {schemasLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading your schemas...</p>
          </div>
        )}

        {/* Empty state */}
        {!schemasLoading && schemas.length === 0 && !error && (
          <EmptyState onCreateClick={() => setIsCreateModalOpen(true)} />
        )}

        {/* Schemas grid */}
        {!schemasLoading && schemas.length > 0 && (
          <>
            {filteredSchemas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No schemas match your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSchemas.map((schema) => (
                  <SchemaCard
                    key={schema.id}
                    schema={schema}
                    onDelete={deleteSchema}
                    onUpdate={updateSchema}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Create schema modal */}
      <CreateSchemaModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={createSchema}
      />
    </div>
  );
}