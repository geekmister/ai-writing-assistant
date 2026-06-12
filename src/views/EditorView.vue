<script setup lang="ts">
import TipTapEditor from '@/components/editor/TipTapEditor.vue';
import RightPanel from '@/components/panels/RightPanel.vue';
import DocumentList from '@/components/document/DocumentList.vue';
import AppHeader from '@/components/common/AppHeader.vue';
</script>

<template>
  <div class="editor-layout">
    <AppHeader />
    <div class="main-area">
      <DocumentList class="sidebar" />
      <TipTapEditor class="editor-area" />
      <RightPanel class="right-panel" />
    </div>
  </div>
</template>

<style scoped>
.editor-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--app-bg);
  color: var(--text-primary);
}
.main-area {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.sidebar {
  width: 240px;
  border-right: 1px solid var(--border-color);
  background: var(--sidebar-bg);
  overflow-y: auto;
  flex-shrink: 0;
}
.editor-area {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.right-panel {
  width: 360px;
  border-left: 1px solid var(--border-color);
  background: var(--panel-bg);
  overflow-y: auto;
  flex-shrink: 0;
  transition: width 0.2s;
}
</style>
