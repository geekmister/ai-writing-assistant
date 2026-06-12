<template>
  <div class="right-panel">
    <n-tabs v-model:value="activeTab" type="segment" size="small">
      <n-tab-pane name="generation" tab="生成">
        <GenerationPanel />
      </n-tab-pane>
      <n-tab-pane name="material" tab="素材">
        <MaterialPanel />
      </n-tab-pane>
      <n-tab-pane name="style" tab="风格">
        <StylePanel />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import GenerationPanel from './GenerationPanel.vue';
import MaterialPanel from './MaterialPanel.vue';
import StylePanel from './StylePanel.vue';

const activeTab = ref('generation');
</script>

<style scoped>
.right-panel {
  padding: 12px;
  color: var(--text-primary);
}
</style>
