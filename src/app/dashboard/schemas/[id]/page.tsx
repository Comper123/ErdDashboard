// src/app/dashboard/schemas/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSchemas, SchemaDetails } from '@/hooks/useSchemas';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SchemaPage({ params }: { params: { id: string } }) {
  const { user, isLoading: authLoading } = useAuth();
  const { getSchemaDetails } = useSchemas();
  const router = useRouter();
  
  const [schema, setSchema] = useState<SchemaDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      loadSchema();
    }
  }, [user, params.id]);

  const loadSchema = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSchemaDetails(params.id);
      setSchema(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
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
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Schema not found</p>
          <Link
            href="/dashboard"
            className="text-indigo-600 hover:text-indigo-800"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/dashboard"
                className="text-sm text-indigo-600 hover:text-indigo-800 mb-2 inline-block"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{schema.name}</h1>
              {schema.description && (
                <p className="mt-1 text-gray-600">{schema.description}</p>
              )}
            </div>
            <button
              onClick={() => router.push(`/dashboard/schemas/${schema.id}/edit`)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Edit Schema
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center py-12">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
              />
            </svg>
            <h2 className="mt-4 text-lg font-medium text-gray-900">ERD Editor Coming Soon</h2>
            <p className="mt-2 text-gray-600">
              The visual ERD editor is under construction. You'll be able to design your database schema here.
            </p>
            
            {/* Temporary stats display */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Tables</p>
                <p className="text-2xl font-bold text-indigo-600">{schema.tables.length}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Fields</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {schema.tables.reduce((acc, table) => acc + table.fields.length, 0)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Relationships</p>
                <p className="text-2xl font-bold text-indigo-600">{schema.relationships.length}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}