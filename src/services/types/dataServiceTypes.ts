
import { Database } from '../../integrations/supabase/types';

// Base interface for items with common properties
export interface BaseItem {
  id: string;
  timestamp: number;
}

// Define a type-safe Supabase table name
export type SupabaseTable = keyof Database['public']['Tables'];

// Interface for database mapper functions
export interface DataMappers<T extends BaseItem, DbItem> {
  mapFromDb: (dbItem: any) => T;
  mapToDb: (item: T) => Omit<DbItem, 'id'>;
}
