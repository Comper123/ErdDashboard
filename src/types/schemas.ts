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