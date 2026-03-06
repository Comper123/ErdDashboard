export interface Field {
    name: string;
    position: number;
    isNull: boolean;
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

export const filedTypes =  [
  'int', 'bigint', 'smallint',
  'decimal', 'float', 'double',
  'varchar', 'text', 'char',
  'boolean',
  'date', 'timestamp', 'time', 'interval',
  'uuid',
  'json', 'blob', 'jsonb',
  'array', 'enum'
]