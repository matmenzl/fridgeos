
/**
 * Service for handling localStorage operations
 */
export class LocalStorageService<T> {
  private storageKey: string;

  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  /**
   * Get items from localStorage
   */
  getItems(): T[] {
    const itemsJson = localStorage.getItem(this.storageKey);
    return itemsJson ? JSON.parse(itemsJson) : [];
  }

  /**
   * Save items to localStorage
   */
  saveItems(items: T[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  /**
   * Add a single item to localStorage
   */
  addItem(item: T): void {
    const items = this.getItems();
    items.push(item);
    this.saveItems(items);
  }

  /**
   * Update an item in localStorage
   */
  updateItem(id: string, updatedItem: T): T | null {
    const items = this.getItems();
    const itemIndex = items.findIndex((item: any) => item.id === id);
    
    if (itemIndex === -1) return null;
    
    items[itemIndex] = updatedItem;
    this.saveItems(items);
    return updatedItem;
  }

  /**
   * Remove an item from localStorage
   */
  removeItem(id: string): void {
    const items = this.getItems();
    const updatedItems = items.filter((item: any) => item.id !== id);
    this.saveItems(updatedItems);
  }
}
