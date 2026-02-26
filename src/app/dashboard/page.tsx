'use client';

import { useAuth } from '@/hooks/useAuth';
import { useSchemas } from '@/hooks/useSchemas';
import Header from '@/components/Header';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { schemas, isLoading: schemasLoading, error, createSchema, updateSchema, deleteSchema } = useSchemas();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header></Header>
    </div>
  );
}