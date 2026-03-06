export const filedTypes =  [
  'int', 'bigint', 'smallint', 'serial',
  'decimal', 'float', 'double',
  'varchar', 'text', 'char',
  'boolean',
  'date', 'timestamp', 'time', 'interval',
  'uuid',
  'json', 'blob', 'jsonb',
  'array', 'enum'
]
export type FieldType = typeof filedTypes[number];

export const relationType = ['one-to-one', 'one-to-many', 'many-to-one', 'many-to-many']
export type RelationType = typeof relationType[number];

export interface Field {
    name: string;
    position: number;
    type: FieldType;
    isNullable: boolean;
    isPrimaryKey: boolean;
    isUnique: boolean;
    defaultValue: string;
    isForeignKey: boolean;
    relationType: RelationType;
    foreignTable: string;
    foreignField: string;
}

export interface Table {
    name: string;
    fields: Field[]
}

export interface TableComponentProps {
    table: Table;
    scale: number;
}

export interface ERDEditorProps {
    isGridOpen: boolean;
    scale: number;
    zoomIn: () => void;
    zoomOut: () => void;
    openCreateTableModal: () => void;
    tables: Table[]
}