// src/hooks/useSchemas.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface Schema {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  tablesCount: number;
}

export interface SchemaDetails extends Schema {
  tables: Array<{
    id: string;
    name: string;
    positionX: string;
    positionY: string;
    config: any;
    fields: Array<{
      id: string;
      name: string;
      type: string;
      isPrimaryKey: boolean;
      isNullable: boolean;
      isUnique: boolean;
      defaultValue: string | null;
    }>;
  }>;
  relationships: Array<{
    id: string;
    fromTableId: string;
    fromFieldId: string | null;
    toTableId: string;
    toFieldId: string | null;
    type: string;
    config: any;
  }>;
}

export function useSchemas() {
  const { accessToken } = useAuth();
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchemas = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/schemas', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch schemas');
      }

      const data = await response.json();
      setSchemas(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  const createSchema = useCallback(async (name: string, description?: string) => {
    if (!accessToken) throw new Error('Not authenticated');

    const response = await fetch('/api/schemas', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, description }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to create schema');
    }

    const newSchema = await response.json();
    setSchemas(prev => [newSchema, ...prev]);
    return newSchema;
  }, [accessToken]);

  const updateSchema = useCallback(async (id: string, data: { name?: string; description?: string }) => {
    if (!accessToken) throw new Error('Not authenticated');

    const response = await fetch(`/api/schemas/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update schema');
    }

    const updatedSchema = await response.json();
    setSchemas(prev => prev.map(s => s.id === id ? updatedSchema : s));
    return updatedSchema;
  }, [accessToken]);

  const deleteSchema = useCallback(async (id: string) => {
    if (!accessToken) throw new Error('Not authenticated');

    const response = await fetch(`/api/schemas/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete schema');
    }

    setSchemas(prev => prev.filter(s => s.id !== id));
  }, [accessToken]);

  const getSchemaDetails = useCallback(async (id: string): Promise<SchemaDetails> => {
    if (!accessToken) throw new Error('Not authenticated');

    const response = await fetch(`/api/schemas/${id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to fetch schema details');
    }

    return response.json();
  }, [accessToken]);

  useEffect(() => {
    fetchSchemas();
  }, [fetchSchemas]);

  return {
    schemas,
    isLoading,
    error,
    fetchSchemas,
    createSchema,
    updateSchema,
    deleteSchema,
    getSchemaDetails,
  };
}