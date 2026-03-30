<template>
  <div class="tree-table">
    <ag-grid-vue
      class="ag-theme-alpine"
      :columnDefs="columnDefs"
      :rowData="rowData"
      :treeData="true"
      :groupDefaultExpanded="GROUP_DEFAULT_EXPANDED"
      :getDataPath="getDataPath"
      :getRowId="getRowId"
      :rowBuffer="ROW_BUFFER"
      :debounceVerticalScrollbar="true"
      :suppressRowHoverHighlight="true"
      :groupDisplayType="'custom'"
      @row-clicked="onRowClicked"
      style="height: 500px; width: 100%;"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import 'ag-grid-enterprise';
// @ts-ignore – отсутствуют декларации для CSS (можно добавить vite-env.d.ts)
import 'ag-grid-community/styles/ag-grid.css';
// @ts-ignore
import 'ag-grid-community/styles/ag-theme-alpine.css';
import type { TreeStore } from '../store/TreeStore';
import type { Item } from '../types';

const props = defineProps<{
  store: TreeStore;
}>();

const ROW_BUFFER = 30;
const GROUP_DEFAULT_EXPANDED = -1;

type ItemWithMeta = Item & {
  path: (string | number)[];
  hasChildren: boolean;
};

const rowData = ref<ItemWithMeta[]>([]);

const getRowId = (params: { data: Item }) => String(params.data.id);

const updateRowData = () => {
  const items = props.store.getAll();
  const idToItem = new Map(items.map(i => [i.id, i]));

  const data: ItemWithMeta[] = items.map(item => {
    const path: (string | number)[] = [];
    let cur: Item | undefined = item;
    while (cur?.parent != null) {
      path.unshift(cur.parent);
      cur = idToItem.get(cur.parent);
    }
    path.push(item.id);
    const hasChildren = props.store.getChildren(item.id).length > 0;
    return { ...item, path, hasChildren };
  });
  rowData.value = data;
};

onMounted(() => {
  updateRowData();
});

watch(() => props.store.getAll(), () => {
  updateRowData();
}, { deep: false });

const getDataPath = (data: ItemWithMeta) => data.path;

const onRowClicked = (event: any) => {
  const node = event.node;
  if (node.group) {
    node.setExpanded(!node.expanded);
  }
};

const columnDefs = computed(() => [
  {
    headerName: '№ п/п',
    valueGetter: (params: any) => params.node.rowIndex + 1,
    width: 80,
    sortable: false,
    filter: false,
    suppressSizeToFit: true,
    cellClass: 'bold-number',
  },
  {
    headerName: 'Категория',
    valueGetter: (params: any) => (params.data.hasChildren ? 'Группа' : 'Элемент'),
    width: 120,
    sortable: false,
    filter: false,
    suppressSizeToFit: true,
    cellClassRules: {
      'bold-text': (params: any) => params.data.hasChildren,
    },
  },
  {
    headerName: 'Наименование',
    field: 'label',
    cellRenderer: 'agGroupCellRenderer',
    cellRendererParams: {
      suppressCount: true,
    },
    flex: 1,
    cellClassRules: {
      'bold-text': (params: any) => params.data.hasChildren,
    },
  },
]);
</script>

<style scoped>
:deep(.bold-number) {
  font-weight: bold;
}
:deep(.bold-text) {
  font-weight: bold;
}
</style>