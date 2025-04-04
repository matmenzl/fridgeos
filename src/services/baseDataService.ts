
import { BaseItem, SupabaseTable, DataMappers } from './types/dataServiceTypes';
import { LocalStorageService } from './storage/localStorageService';
import { SupabaseService } from './storage/supabaseService';

export class BaseDataService<T extends BaseItem, DbItem> {
  private tableName: SupabaseTable;
  private localStorageService: LocalStorageService<T>;
  private supabaseService: SupabaseService<T, DbItem>;
  private mappers: DataMappers<T, DbItem>;

  constructor(
    tableName: SupabaseTable, 
    localStorageKey: string,
    mapFromDb: (dbItem: any) => T,
    mapToDb: (item: T) => Omit<DbItem, 'id'>
  ) {
    this.tableName = tableName;
    this.localStorageService = new LocalStorageService<T>(localStorageKey);
    this.supabaseService = new SupabaseService<T, DbItem>(tableName);
    this.mappers = { mapFromDb, mapToDb };
  }

  /**
   * Get items from localStorage (protected method for internal use)
   */
  protected getFromLocalStorage(): T[] {
    return this.localStorageService.getItems();
  }

  /**
   * Get all items, with fallback to localStorage if Supabase fails
   */
  async getAll(): Promise<T[]> {
    try {
      const data = await this.supabaseService.getAll();
      
      if (!data) {
        return this.getFromLocalStorage();
      }
      
      return data.map(this.mappers.mapFromDb);
    } catch (error) {
      console.error(`Error fetching data from ${this.tableName}:`, error);
      return this.getFromLocalStorage();
    }
  }

  /**
   * Create a new item
   */
  async create(itemData: Omit<T, 'id'>): Promise<T> {
    // Create a temporary item with a unique ID
    const uniqueId = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 10);
    const newItem = { ...itemData, id: uniqueId } as T;
    
    try {
      // Map to database format and insert into Supabase
      const dataForDb = this.mappers.mapToDb(newItem);
      
      const { data, error } = await this.supabaseService.create(dataForDb);
      
      if (error) {
        console.error(`Error creating item in ${this.tableName}:`, error);
        // Fallback: Save to localStorage
        this.localStorageService.addItem(newItem);
      } else if (data) {
        // Use the Supabase-generated UUID
        newItem.id = data.id;
      }
    } catch (error) {
      console.error(`Error creating item in ${this.tableName}:`, error);
      // Fallback: Save to localStorage
      this.localStorageService.addItem(newItem);
    }
    
    return newItem;
  }

  /**
   * Update an existing item
   */
  async update(id: string, updateData: Partial<Omit<T, 'id'>>): Promise<T | null> {
    try {
      // Create the update object with timestamp
      const updateObj = { ...updateData, timestamp: Date.now() };
      
      const { data, error } = await this.supabaseService.update(id, updateObj);
      
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
        
        return this.localStorageService.updateItem(id, updatedItem);
      }
      
      if (!data) {
        return null;
      }
      
      return this.mappers.mapFromDb(data);
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
      
      return this.localStorageService.updateItem(id, updatedItem);
    }
  }

  /**
   * Delete an item
   */
  async delete(id: string): Promise<void> {
    console.log(`Attempting to delete item with ID: ${id} from ${this.tableName}`);
    
    try {
      const { error } = await this.supabaseService.delete(id);
      
      if (error) {
        console.error(`Error deleting item from ${this.tableName}:`, error);
        // Fallback: Delete from localStorage
        this.localStorageService.removeItem(id);
      } else {
        console.log(`Item with ID ${id} successfully deleted from ${this.tableName}.`);
      }
    } catch (error) {
      console.error(`Error deleting item from ${this.tableName}:`, error);
      // Fallback: Delete from localStorage
      this.localStorageService.removeItem(id);
    }
  }

  /**
   * Migrate items to Supabase
   */
  async migrateToSupabase(items: T[]): Promise<boolean> {
    if (items.length === 0) {
      console.log(`No local items to migrate to ${this.tableName}.`);
      return true;
    }
    
    try {
      // Prepare items for Supabase by mapping each one
      const dbItems = items.map(item => this.mappers.mapToDb(item));
      
      const { error } = await this.supabaseService.migrateItems(dbItems);
      
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
