<template>
  <div class="right-panel">
    <n-tabs v-model:value="activeTab" type="segment" size="small">
      <n-tab-pane name="generation" tab="生成">
        <GenerationPanel @replace="handleReplace" />
      </n-tab-pane>
      <n-tab-pane name="material" tab="素材">
        <MaterialPanel />
      </n-tab-pane>
      <n-tab-pane name="style" tab="风格">
        <StylePanel :document-content="documentContent" />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { NTabs, NTabPane } from 'naive-ui';
import GenerationPanel from './GenerationPanel.vue';
import MaterialPanel from './MaterialPanel.vue';
import StylePanel from './StylePanel.vue';

const props = withDefaults(defineProps<{
  /** 当前文档内容（用于风格智能推荐） */
  documentContent?: string;
}>(), {
  documentContent: '',
});

const activeTab = ref('generation');
const emit = defineEmits<{
  replace: [content: string];
}>();

function handleReplace(content: string) {
  emit('replace', content);
}

/** 由 EditorView 调用，生成时自动切到生成标签 */
function switchToGeneration() {
  activeTab.value = 'generation';
}

defineExpose({ switchToGeneration });
</script>

<style scoped>
.right-panel {
  padding: 12px;
  color: var(--text-primary);
}
</style>
