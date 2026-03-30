import { Item } from '../types';

export class TreeStore {
  private itemsMap: Map<string | number, Item> = new Map();
  private childrenMap: Map<string | number, Set<string | number>> = new Map();

  constructor(items: Item[]) {
    this.buildMaps(items);
  }

  private buildMaps(items: Item[]): void {
    this.itemsMap.clear();
    this.childrenMap.clear();

    for (const item of items) {
      this.itemsMap.set(item.id, item);
    }
    for (const item of items) {
      const parent = item.parent;
      if (parent != null) {
        let set = this.childrenMap.get(parent);
        if (!set) {
          set = new Set();
          this.childrenMap.set(parent, set);
        }
        set.add(item.id);
      }
    }
  }

  getAll(): Item[] {
    return Array.from(this.itemsMap.values());
  }

  getItem(id: string | number): Item | undefined {
    return this.itemsMap.get(id);
  }

  getChildren(id: string | number): Item[] {
    const childIds = this.childrenMap.get(id);
    if (!childIds) return [];
    const result: Item[] = [];
    for (const childId of childIds) {
      const child = this.itemsMap.get(childId);
      if (child) result.push(child);
    }
    return result;
  }

  getAllChildren(id: string | number): Item[] {
    const childIds = this.childrenMap.get(id);
    if (!childIds) return [];
    const result: Item[] = [];
    const stack: (string | number)[] = [];
    for (const childId of childIds) {
      stack.push(childId);
    }
    while (stack.length) {
      const currentId = stack.pop()!;
      const current = this.itemsMap.get(currentId);
      if (current) {
        result.push(current);
        const grandchildren = this.childrenMap.get(currentId);
        if (grandchildren) {
          for (const gId of grandchildren) {
            stack.push(gId);
          }
        }
      }
    }
    return result;
  }

  getAllParents(id: string | number): Item[] {
    const result: Item[] = [];
    let currentId: string | number | null | undefined = id;
    while (currentId != null) {
      const item = this.itemsMap.get(currentId);
      if (!item) break;
      result.push(item);
      currentId = item.parent;
    }
    return result;
  }

  addItem(item: Item): void {
    if (this.itemsMap.has(item.id)) {
      throw new Error(`Item with id ${item.id} already exists`);
    }
    if (item.parent != null && !this.itemsMap.has(item.parent)) {
      throw new Error(`Parent with id ${item.parent} does not exist`);
    }
    this.itemsMap.set(item.id, item);
    if (item.parent != null) {
      let set = this.childrenMap.get(item.parent);
      if (!set) {
        set = new Set();
        this.childrenMap.set(item.parent, set);
      }
      set.add(item.id);
    }
  }

  removeItem(id: string | number): void {
    const descendants = this.getAllChildren(id);
    const toRemove = [id, ...descendants.map(d => d.id)];
    const item = this.itemsMap.get(id);
    if (item?.parent != null) {
      const parentSet = this.childrenMap.get(item.parent);
      if (parentSet) {
        parentSet.delete(id);
        if (parentSet.size === 0) {
          this.childrenMap.delete(item.parent);
        }
      }
    }
    for (const removeId of toRemove) {
      this.childrenMap.delete(removeId);
      this.itemsMap.delete(removeId);
    }
  }

  updateItem(updatedItem: Item): void {
    const existing = this.itemsMap.get(updatedItem.id);
    if (!existing) {
      throw new Error(`Item with id ${updatedItem.id} not found`);
    }
    if (existing.parent !== updatedItem.parent) {
      if (existing.parent != null) {
        const oldParentSet = this.childrenMap.get(existing.parent);
        if (oldParentSet) {
          oldParentSet.delete(updatedItem.id);
          if (oldParentSet.size === 0) {
            this.childrenMap.delete(existing.parent);
          }
        }
      }
      if (updatedItem.parent != null) {
        if (!this.itemsMap.has(updatedItem.parent)) {
          throw new Error(`Parent with id ${updatedItem.parent} does not exist`);
        }
        let newParentSet = this.childrenMap.get(updatedItem.parent);
        if (!newParentSet) {
          newParentSet = new Set();
          this.childrenMap.set(updatedItem.parent, newParentSet);
        }
        newParentSet.add(updatedItem.id);
      }
    }
    this.itemsMap.set(updatedItem.id, updatedItem);
  }
}