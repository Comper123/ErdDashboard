// src/hooks/useERD.ts
import { useState, useCallback } from 'react';
import { Table, Relationship, TableField } from '@/types/erd';

interface UseERDReturn {
  // Состояния
  tables: Table[];
  relationships: Relationship[];
  
  // Управление таблицами
  addTable: (name: string, position?: { x: number; y: number }) => Table;
  updateTable: (tableId: string, updates: Partial<Table>) => void;
  deleteTable: (tableId: string) => void;
  moveTable: (tableId: string, position: { x: number; y: number }) => void;
  
  // Управление полями
  addField: (tableId: string, field: Omit<TableField, 'id'>) => TableField;
  updateField: (tableId: string, fieldId: string, updates: Partial<TableField>) => void;
  deleteField: (tableId: string, fieldId: string) => void;
  reorderFields: (tableId: string, fieldIds: string[]) => void;
  
  // Управление связями
  addRelationship: (
    fromTableId: string,
    toTableId: string,
    type: 'one-to-one' | 'one-to-many' | 'many-to-many',
    fromFieldId?: string | null,
    toFieldId?: string | null
  ) => Relationship;
  updateRelationship: (relationshipId: string, updates: Partial<Relationship>) => void;
  deleteRelationship: (relationshipId: string) => void;
  
  // Экспорт/Импорт
  exportData: () => { tables: Table[]; relationships: Relationship[] };
  importData: (data: { tables: Table[]; relationships: Relationship[] }) => void;
  
  // Валидация
  validateSchema: () => {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
  
  // Сброс
  reset: (newTables?: Table[], newRelationships?: Relationship[]) => void;
}

export function useERD(
  initialTables: Table[] = [],
  initialRelationships: Relationship[] = []
): UseERDReturn {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [relationships, setRelationships] = useState<Relationship[]>(initialRelationships);

  // ========== Управление таблицами ==========
  
  const addTable = useCallback((name: string, position?: { x: number; y: number }) => {
    const newTable: Table = {
      id: `table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      fields: [],
      position: position || { x: 100, y: 100 },
      width: 240,
      height: 100,
      color: getRandomColor(),
      config: {}
    };
    
    setTables(prev => [...prev, newTable]);
    return newTable;
  }, []);

  const updateTable = useCallback((tableId: string, updates: Partial<Table>) => {
    setTables(prev =>
      prev.map(table =>
        table.id === tableId ? { ...table, ...updates } : table
      )
    );
  }, []);

  const deleteTable = useCallback((tableId: string) => {
    setTables(prev => prev.filter(table => table.id !== tableId));
    // Удаляем все связи, связанные с этой таблицей
    setRelationships(prev => 
      prev.filter(rel => rel.fromTableId !== tableId && rel.toTableId !== tableId)
    );
  }, []);

  const moveTable = useCallback((tableId: string, position: { x: number; y: number }) => {
    setTables(prev =>
      prev.map(table =>
        table.id === tableId ? { ...table, position } : table
      )
    );
  }, []);

  // ========== Управление полями ==========

  const addField = useCallback((tableId: string, field: Omit<TableField, 'id'>) => {
    const newField: TableField = {
      ...field,
      id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: field.position || 0
    };

    setTables(prev =>
      prev.map(table =>
        table.id === tableId
          ? { 
              ...table, 
              fields: [...table.fields, newField],
              height: calculateTableHeight(table.fields.length + 1)
            }
          : table
      )
    );

    return newField;
  }, []);

  const updateField = useCallback((tableId: string, fieldId: string, updates: Partial<TableField>) => {
    setTables(prev =>
      prev.map(table =>
        table.id === tableId
          ? {
              ...table,
              fields: table.fields.map(field =>
                field.id === fieldId ? { ...field, ...updates } : field
              )
            }
          : table
      )
    );
  }, []);

  const deleteField = useCallback((tableId: string, fieldId: string) => {
    setTables(prev =>
      prev.map(table =>
        table.id === tableId
          ? { 
              ...table, 
              fields: table.fields.filter(field => field.id !== fieldId),
              height: calculateTableHeight(table.fields.length - 1)
            }
          : table
      )
    );

    // Удаляем связи, использующие это поле
    setRelationships(prev =>
      prev.filter(rel => rel.fromFieldId !== fieldId && rel.toFieldId !== fieldId)
    );
  }, []);

  const reorderFields = useCallback((tableId: string, fieldIds: string[]) => {
    setTables(prev =>
      prev.map(table => {
        if (table.id !== tableId) return table;

        const fieldMap = new Map(table.fields.map(f => [f.id, f]));
        const reorderedFields = fieldIds
          .map(id => fieldMap.get(id))
          .filter((f): f is TableField => f !== undefined)
          .map((field, index) => ({ ...field, position: index }));

        return {
          ...table,
          fields: reorderedFields
        };
      })
    );
  }, []);

  // ========== Управление связями ==========

  const addRelationship = useCallback((
    fromTableId: string,
    toTableId: string,
    type: 'one-to-one' | 'one-to-many' | 'many-to-many',
    fromFieldId: string | null = null,
    toFieldId: string | null = null
  ) => {
    // Проверяем, не существует ли уже такая связь
    const existing = relationships.find(
      r => r.fromTableId === fromTableId && r.toTableId === toTableId
    );

    if (existing) {
      console.warn('Связь между этими таблицами уже существует');
      return existing;
    }

    const newRelationship: Relationship = {
      id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fromTableId,
      toTableId,
      fromFieldId,
      toFieldId,
      type,
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      config: {
        color: getRelationshipColor(type),
        width: 2,
        style: 'solid',
        showLabel: true
      }
    };

    setRelationships(prev => [...prev, newRelationship]);
    return newRelationship;
  }, [relationships]);

  const updateRelationship = useCallback((relationshipId: string, updates: Partial<Relationship>) => {
    setRelationships(prev =>
      prev.map(rel =>
        rel.id === relationshipId ? { ...rel, ...updates } : rel
      )
    );
  }, []);

  const deleteRelationship = useCallback((relationshipId: string) => {
    setRelationships(prev => prev.filter(rel => rel.id !== relationshipId));
  }, []);

  // ========== Экспорт/Импорт ==========

   const exportData = useCallback(() => {
    return {
      tables: tables.map(table => ({
        ...table,
        // Сохраняем высоту, но можно пересчитать при импорте
        height: table.height || calculateTableHeight(table.fields.length)
      })),
      relationships
    };
  }, [tables, relationships]);

  const importData = useCallback((data: { tables: Table[]; relationships: Relationship[] }) => {
    // Восстанавливаем высоту таблиц
    const tablesWithHeight = data.tables.map(table => ({
      ...table,
      height: calculateTableHeight(table.fields.length)
    }));

    setTables(tablesWithHeight);
    setRelationships(data.relationships);
  }, []);

  // ========== Валидация ==========

  const validateSchema = useCallback(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Проверка таблиц
    tables.forEach(table => {
      if (!table.name.trim()) {
        errors.push(`Таблица имеет пустое название`);
      }

      // Проверка первичных ключей
      const primaryKeys = table.fields.filter(f => f.isPrimaryKey);
      if (primaryKeys.length === 0) {
        warnings.push(`Таблица "${table.name}" не имеет первичного ключа`);
      } else if (primaryKeys.length > 1) {
        warnings.push(`Таблица "${table.name}" имеет составной первичный ключ`);
      }

      // Проверка дубликатов полей
      const fieldNames = new Set();
      table.fields.forEach(field => {
        if (fieldNames.has(field.name)) {
          errors.push(`Таблица "${table.name}" имеет дубликат поля "${field.name}"`);
        }
        fieldNames.add(field.name);
      });
    });

    // Проверка связей
    relationships.forEach(rel => {
      const fromTable = tables.find(t => t.id === rel.fromTableId);
      const toTable = tables.find(t => t.id === rel.toTableId);

      if (!fromTable) {
        errors.push(`Связь ${rel.id} ссылается на несуществующую таблицу`);
      }
      if (!toTable) {
        errors.push(`Связь ${rel.id} ссылается на несуществующую таблицу`);
      }

      if (rel.fromFieldId && fromTable) {
        const field = fromTable.fields.find(f => f.id === rel.fromFieldId);
        if (!field) {
          errors.push(`Связь ссылается на несуществующее поле в таблице "${fromTable.name}"`);
        }
      }

      if (rel.toFieldId && toTable) {
        const field = toTable.fields.find(f => f.id === rel.toFieldId);
        if (!field) {
          errors.push(`Связь ссылается на несуществующее поле в таблице "${toTable.name}"`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [tables, relationships]);

  // ========== Сброс ==========

  const reset = useCallback((newTables?: Table[], newRelationships?: Relationship[]) => {
    if (newTables && newRelationships) {
      setTables(newTables);
      setRelationships(newRelationships);
    } else {
      setTables([]);
      setRelationships([]);
    }
  }, []);

  return {
    // Состояния
    tables,
    relationships,
    
    // Управление таблицами
    addTable,
    updateTable,
    deleteTable,
    moveTable,
    
    // Управление полями
    addField,
    updateField,
    deleteField,
    reorderFields,
    
    // Управление связями
    addRelationship,
    updateRelationship,
    deleteRelationship,
    
    // Экспорт/Импорт
    exportData,
    importData,
    
    // Валидация
    validateSchema,
    
    // Сброс
    reset
  };
}

// ========== Вспомогательные функции ==========

function getRandomColor(): string {
  const colors = [
    '#4f46e5', '#0891b2', '#059669', '#b45309',
    '#c2410c', '#7e22ce', '#be185d', '#1e293b'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getRelationshipColor(type: string): string {
  switch (type) {
    case 'one-to-one': return '#10b981';
    case 'one-to-many': return '#6366f1';
    case 'many-to-many': return '#f59e0b';
    default: return '#6366f1';
  }
}

function calculateTableHeight(fieldCount: number): number {
  // Высота заголовка: 40px
  // Высота поля: 28px
  // Высота подвала: 24px
  // Отступы: 8px
  return 40 + (fieldCount * 28) + 24 + 8;
}

// ========== Дополнительные утилиты ==========


// Хук для синхронизации с сервером
export function useERDWithAPI(schemaId: string, accessToken?: string) {
  const erd = useERD();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFromAPI = useCallback(async () => {
    if (!accessToken || !schemaId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/schemas/${schemaId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки схемы');
      }

      const data = await response.json();
      
      // Преобразуем данные из API в формат таблиц
      const tables: Table[] = data.tables.map((t: any) => ({
        id: t.id,
        name: t.name,
        fields: t.fields || [],
        position: { 
          x: parseFloat(t.positionX) || 100, 
          y: parseFloat(t.positionY) || 100 
        },
        width: 240,
        height: calculateTableHeight(t.fields?.length || 0),
        color: t.config?.color || getRandomColor(),
        config: t.config || {}
      }));

      erd.importData({
        tables,
        relationships: data.relationships || []
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [schemaId, accessToken, erd]);

  const saveToAPI = useCallback(async () => {
    if (!accessToken || !schemaId) return false;

    try {
      setIsLoading(true);
      setError(null);

      const data = erd.exportData();
      
      // Преобразуем для API
      const tablesToSave = data.tables.map(table => ({
        id: table.id,
        name: table.name,
        fields: table.fields,
        positionX: table.position.x,
        positionY: table.position.y,
        config: table.config
      }));

      const response = await fetch(`/api/schemas/${schemaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          tables: tablesToSave,
          relationships: data.relationships
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка сохранения');
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [schemaId, accessToken, erd]);

  return {
    ...erd,
    isLoading,
    error,
    loadFromAPI,
    saveToAPI
  };
}