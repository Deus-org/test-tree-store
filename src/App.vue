<template>
  <div id="app">
    <TreeTable :store="store" />
  </div>
</template>

<script setup lang="ts">
import TreeTable from './components/TreeTable.vue';
import { TreeStore } from './store/TreeStore';
import { Item } from './types';

const items: Item[] = [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: '91064cee', parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },
  { id: 4, parent: '91064cee', label: 'Айтем 4' },
  { id: 5, parent: '91064cee', label: 'Айтем 5' },
  { id: 6, parent: '91064cee', label: 'Айтем 6' },
  { id: 7, parent: 4, label: 'Айтем 7' },
  { id: 8, parent: 4, label: 'Айтем 8' }
];

const store = new TreeStore(items);
</script>
