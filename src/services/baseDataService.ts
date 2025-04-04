
import { supabase } from '../integrations/supabase/client';

export interface BaseItem {
  id: string;
  timestamp: number;
}

export class BaseDataService<T extends BaseItem, DbItem> {
  private tableName: string;
  private localStorageKey: string;
  private mapFromDb: (dbItem: any) => T;
  private mapToDb: (item: T) => Omit<DbItem, 'id'>;

  constructor(
    tableName: string, 
    localStorageKey: string,
    mapFromDb: (dbItem: any) => T,
    mapToDb: (item: T) => Omit<DbItem, 'id'>
  ) {
    this.tableName = tableName;
    this.localStorageKey = localStorageKey;
    this.mapFromDb = mapFromDb;
    this.mapToDb = mapToDb;
  }

  protected getFromLocalStorage(): T[] {
    const itemsJson = localStorage.getItem(this.localStorageKey);
    return itemsJson ? JSON.parse(itemsJson) : [];
  }

  async getAll(): Promise<T[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) {
        console.error(`Error fetching data from ${this.tableName}:`, error);
        return this.getFromLocalStorage();
      }
      
      if (!data) {
        return this.getFromLocalStorage();
      }
      
      return data.map(this.mapFromDb);
    } catch (error) {
      console.error(`Error fetching data from ${this.tableName}:`, error);
      return this.getFromLocalStorage();
    }
  }

  async create(itemData: Omit<T, 'id'>): Promise<T> {
    // Create a temporary item with a unique ID
    const uniqueId = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 10);
    const newItem = { ...itemData, id: uniqueId } as T;
    
    try {
      // Map to database format and insert into Supabase
      const dataForDb = this.mapToDb(newItem);
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([dataForDb])
        .select('id')
        .single();
      
      if (error) {
        console.error(`Error creating item in ${this.tableName}:`, error);
        // Fallback: Save to localStorage
        const items = this.getFromLocalStorage();
        items.push(newItem);
        localStorage.setItem(this.localStorageKey, JSON.stringify(items));
      } else if (data) {
        // Use the Supabase-generated UUID
        newItem.id = data.id;
      }
    } catch (error) {
      console.error(`Error creating item in ${this.tableName}:`, error);
      // Fallback: Save to localStorage
      const items = this.getFromLocalStorage();
      items.push(newItem);
      localStorage.setItem(this.localStorageKey, JSON.stringify(items));
    }
    
    return newItem;
  }

  async update(id: string, updateData: Partial<Omit<T, 'id'>>): Promise<T | null> {
    try {
      // Create the update object with timestamp
      const updateObj = { ...updateData, timestamp: Date.now() };
      
      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateObj)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error(`Error updating item in ${this.tableName}:`, error);
        // Fallback: Update in localStorage
        const items = this.getFromLocalStorage();
        const itemIndex = items.findIndex(item => item.id === id);
        
        if (itemIndex === -1) {
          console.error(`Item with ID ${id} not found`);
          return null;
        }
        
        const updatedItem = {
          ...items[itemIndex],
          ...updateData,
          timestamp: Date.now()
        } as T;
        
        items[itemIndex] = updatedItem;
        localStorage.setItem(this.localStorageKey, JSON.stringify(items));
        
        return updatedItem;
      }
      
      if (!data) {
        return null;
      }
      
      return this.mapFromDb(data);
    } catch (error) {
      console.error(`Error updating item in ${this.tableName}:`, error);
      // Fallback: Update in localStorage
      const items = this.getFromLocalStorage();
      const itemIndex = items.findIndex(item => item.id === id);
      
      if (itemIndex === -1) {
        console.error(`Item with ID ${id} not found`);
        return null;
      }
      
      const updatedItem = {
        ...items[itemIndex],
        ...updateData,
        timestamp: Date.now()
      } as T;
      
      items[itemIndex] = updatedItem;
      localStorage.setItem(this.localStorageKey, JSON.stringify(items));
      
      return updatedItem;
    }
  }

  async delete(id: string): Promise<void> {
    console.log(`Attempting to delete item with ID: ${id} from ${this.tableName}`);
    
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Error deleting item from ${this.tableName}:`, error);
        // Fallback: Delete from localStorage
        const items = this.getFromLocalStorage();
        const updatedItems = items.filter(item => item.id !== id);
        localStorage.setItem(this.localStorageKey, JSON.stringify(updatedItems));
      } else {
        console.log(`Item with ID ${id} successfully deleted from ${this.tableName}.`);
      }
    } catch (error) {
      console.error(`Error deleting item from ${this.tableName}:`, error);
      // Fallback: Delete from localStorage
      const items = this.getFromLocalStorage();
      const updatedItems = items.filter(item => item.id !== id);
      localStorage.setItem(this.localStorageKey, JSON.stringify(updatedItems));
    }
  }

  async migrateToSupabase(items: T[]): Promise<boolean> {
    if (items.length === 0) {
      console.log(`No local items to migrate to ${this.tableName}.`);
      return true;
    }
    
    try {
      // Prepare items for Supabase
      const itemsForSupabase = items.map(item => this.mapToDb(item));
      
      // Insert items in Supabase
      const { error } = await supabase
        .from(this.tableName)
        .insert(itemsForSupabase);
      
      if (error) {
        console.error(`Error migrating items to ${this.tableName}:`, error);
        return false;
      }
      
      console.log(`${items.length} items successfully migrated to ${this.tableName}.`);
      return true;
    } catch (error) {
      console.error(`Error migrating items to ${this.tableName}:`, error);
      return false;
    }
  }
}
