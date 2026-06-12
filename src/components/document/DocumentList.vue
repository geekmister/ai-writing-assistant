<template>
  <div class="document-list">
    <div class="list-header">
      <span class="title">文档</span>
      <n-button size="tiny" text @click="$emit('create')">
        新建
      </n-button>
    </div>
    <div class="empty-state" v-if="documents.length === 0">
      <p class="hint">暂无文档</p>
    </div>
    <div v-else class="list-body">
      <div
        v-for="doc in documents"
        :key="doc.id"
        class="doc-item"
        :class="{ active: doc.id === activeDocumentId }"
        @click="$emit('open', doc.id)"
      >
        <span class="doc-title truncate">{{ doc.title }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  documents: DocumentSummary[];
  activeDocumentId?: string | null;
}>();

defineEmits<{
  create: [];
  open: [id: string];
  delete: [id: string];
  rename: [id: string, title: string];
}>();

interface DocumentSummary {
  id: string;
  title: string;
  updatedAt: number;
  wordCount?: number;
}
</script>

<style scoped>
.document-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}
.title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.list-body {
  padding: 4px 0;
}
.doc-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.15s;
}
.doc-item:hover {
  background: var(--hover-color);
}
.doc-item.active {
  background: rgba(126, 200, 160, 0.1);
  border-right: 2px solid var(--accent-color);
}
.doc-title {
  font-size: 14px;
  color: var(--text-primary);
}
</style>
