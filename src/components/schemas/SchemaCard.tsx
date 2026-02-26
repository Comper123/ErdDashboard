// src/components/schemas/SchemaCard.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Schema } from '@/hooks/useSchemas';

interface SchemaCardProps {
  schema: Schema;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, data: { name?: string; description?: string }) => Promise<void>;
}

export default function SchemaCard({ schema, onDelete, onUpdate }: SchemaCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(schema.name);
  const [editDescription, setEditDescription] = useState(schema.description || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(schema.id);
    } catch (error) {
      console.error('Error deleting schema:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdate(schema.id, {
        name: editName,
        description: editDescription,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating schema:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      {isEditing ? (
        // Режим редактирования
        <form onSubmit={handleUpdate} className="p-4">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded mb-2 text-lg font-semibold"
            placeholder="Schema name"
            autoFocus
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded mb-3 text-sm"
            placeholder="Description"
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </form>
      ) : showDeleteConfirm ? (
        // Подтверждение удаления
        <div className="p-4">
          <p className="text-sm text-gray-700 mb-3">
            Are you sure you want to delete "{schema.name}"?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      ) : (
        // Обычный режим
        <>
          <Link href={`/dashboard/schemas/${schema.id}`}>
            <div className="p-4 cursor-pointer">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{schema.name}</h3>
              {schema.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{schema.description}</p>
              )}
              <div className="flex items-center text-xs text-gray-500">
                <span className="mr-3">{schema.tablesCount} tables</span>
                <span>Updated {formatDate(schema.updatedAt)}</span>
              </div>
            </div>
          </Link>
          
          <div className="border-t border-gray-100 px-4 py-2 flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs text-gray-600 hover:text-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}