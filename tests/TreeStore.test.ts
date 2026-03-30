import { describe, it, expect } from 'vitest';
import { TreeStore } from '../src/store/TreeStore';
import { Item } from '../src/types';

const items: Item[] = [
  { id: 1, parent: null, label: 'Item 1' },
  { id: '91064cee', parent: 1, label: 'Item 2' },
  { id: 3, parent: 1, label: 'Item 3' },
  { id: 4, parent: '91064cee', label: 'Item 4' },
  { id: 5, parent: '91064cee', label: 'Item 5' },
  { id: 6, parent: '91064cee', label: 'Item 6' },
  { id: 7, parent: 4, label: 'Item 7' },
  { id: 8, parent: 4, label: 'Item 8' },
];

describe('TreeStore', () => {
  it('getAll returns all items', () => {
    const store = new TreeStore(items);
    expect(store.getAll()).toHaveLength(8);
  });

  it('getItem returns correct item', () => {
    const store = new TreeStore(items);
    expect(store.getItem(1)).toEqual(items[0]);
    expect(store.getItem('91064cee')).toEqual(items[1]);
    expect(store.getItem(99)).toBeUndefined();
  });

  it('getChildren returns direct children', () => {
    const store = new TreeStore(items);
    expect(store.getChildren(1)).toHaveLength(2);
    expect(store.getChildren('91064cee')).toHaveLength(3);
    expect(store.getChildren(4)).toHaveLength(2);
    expect(store.getChildren(7)).toHaveLength(0);
  });

  it('getAllChildren returns all descendants', () => {
    const store = new TreeStore(items);
    const childrenOf1 = store.getAllChildren(1);
    expect(childrenOf1).toHaveLength(7);
    const childrenOf91064cee = store.getAllChildren('91064cee');
    expect(childrenOf91064cee).toHaveLength(5);
    const childrenOf4 = store.getAllChildren(4);
    expect(childrenOf4).toHaveLength(2);
  });

  it('getAllParents returns path from item to root', () => {
    const store = new TreeStore(items);
    const parentsOf7 = store.getAllParents(7);
    expect(parentsOf7.map(i => i.id)).toEqual([7, 4, '91064cee', 1]);
    const parentsOf4 = store.getAllParents(4);
    expect(parentsOf4.map(i => i.id)).toEqual([4, '91064cee', 1]);
    const parentsOf1 = store.getAllParents(1);
    expect(parentsOf1.map(i => i.id)).toEqual([1]);
  });

  it('addItem adds new item', () => {
    const store = new TreeStore(items);
    const newItem = { id: 9, parent: 1, label: 'New Item' };
    store.addItem(newItem);
    expect(store.getItem(9)).toEqual(newItem);
    expect(store.getChildren(1)).toContainEqual(newItem);
  });

  it('removeItem removes item and descendants', () => {
    const store = new TreeStore(items);
    store.removeItem('91064cee');
    expect(store.getItem('91064cee')).toBeUndefined();
    expect(store.getItem(4)).toBeUndefined();
    expect(store.getItem(5)).toBeUndefined();
    expect(store.getItem(6)).toBeUndefined();
    expect(store.getItem(7)).toBeUndefined();
    expect(store.getItem(8)).toBeUndefined();
    expect(store.getItem(1)).toBeDefined();
    expect(store.getChildren(1)).toHaveLength(1);
  });

  it('updateItem updates fields and parent', () => {
    const store = new TreeStore(items);
    const updated = { id: 4, parent: 1, label: 'Updated Item 4' };
    store.updateItem(updated);
    expect(store.getItem(4)).toEqual(updated);
    expect(store.getChildren('91064cee')).toHaveLength(2);
    expect(store.getChildren(1)).toContainEqual(updated);
  });
});
