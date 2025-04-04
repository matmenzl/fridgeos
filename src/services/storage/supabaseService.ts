
import { supabase } from '../../integrations/supabase/client';
import { SupabaseTable } from '../types/dataServiceTypes';

/**
 * Service for handling Supabase operations
 */
export class SupabaseService<T, DbItem> {
  private tableName: SupabaseTable;
  
  constructor(tableName: SupabaseTable) {
    this.tableName = tableName;
  }

  /**
   * Get all items from Supabase
   */
  async getAll(): Promise<any[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error(`Error fetching data from ${this.tableName}:`, error);
      return [];
    }
    
    return data || [];
  }

  /**
   * Create a new item in Supabase
   */
  async create(item: Omit<DbItem, 'id'>): Promise<{ data: any, error: any }> {
    return supabase
      .from(this.tableName)
      .insert([item as any])
      .select('id')
      .single();
  }

  /**
   * Update an item in Supabase
   */
  async update(id: string, updateData: any): Promise<{ data: any, error: any }> {
    return supabase
      .from(this.tableName)
      .update(updateData as any)
      .eq('id', id)
      .select()
      .single();
  }

  /**
   * Delete an item from Supabase
   */
  async delete(id: string): Promise<{ error: any }> {
    return supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
  }

  /**
   * Migrate multiple items to Supabase
   */
  async migrateItems(items: any[]): Promise<{ error: any }> {
    if (items.length === 0) return { error: null };
    
    return supabase
      .from(this.tableName)
      .insert(items as any[]);
  }
}
