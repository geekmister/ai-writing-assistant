<template>
  <div class="generation-panel">
    <!-- Loading 状态 -->
    <div v-if="store.loading" class="loading-area">
      <LoadingSpinner :visible="true" size="medium" text="AI 正在生成…" />
      <n-text depth="3" style="font-size: 12px; margin-top: 4px; display: block;">
        使用「{{ store.activeStyleName }}」风格生成 {{ configStore.config.generation.n }} 个版本
      </n-text>
    </div>

    <!-- 错误状态 -->
    <n-alert
      v-else-if="store.error"
      type="error"
      :bordered="false"
      closable
      @close="store.reset()"
    >
      <template #header>生成失败</template>
      {{ store.error }}
      <template #footer>
        <n-button size="tiny" @click="store.regenerate()" style="margin-top: 4px;">
          <template #icon><AppIcon name="refresh" :size="12" /></template>
          重试
        </n-button>
      </template>
    </n-alert>

    <!-- 结果展示 -->
    <template v-else-if="store.hasResults">
      <!-- 版本标签页 -->
      <n-tabs
        :value="store.selectedVersionIndex"
        type="segment"
        size="small"
        @update:value="store.selectVersion"
      >
        <n-tab-pane
          v-for="(_, idx) in store.versions"
          :key="idx"
          :name="idx"
          :tab="`版本 ${idx + 1}`"
        >
          <n-scrollbar style="max-height: 260px" trigger="none">
            <div class="version-content" v-html="renderedVersion(idx)" />
          </n-scrollbar>
        </n-tab-pane>
      </n-tabs>

      <!-- 版本操作 -->
      <n-space :size="8" justify="end" class="version-actions">
        <n-button
          size="small"
          @click="store.regenerate()"
          :loading="store.loading"
          secondary
        >
          <template #icon><AppIcon name="refresh" :size="13" /></template>
          重新生成
        </n-button>
        <n-button
          type="primary"
          size="small"
          @click="handleReplace"
        >
          <template #icon><AppIcon name="swap" :size="13" /></template>
          替换原文
        </n-button>
      </n-space>

      <!-- 上下文信息 -->
      <n-divider style="margin: 8px 0" />
      <n-space vertical :size="2">
        <n-text depth="3" style="font-size: 12px">
          风格：{{ store.activeStyleName }}
        </n-text>
        <n-text
          v-if="store.activeMaterialNames.length > 0"
          depth="3"
          style="font-size: 12px"
        >
          素材：{{ store.activeMaterialNames.join('、') }}
        </n-text>
      </n-space>
    </template>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <AppIcon name="sparkles" :size="28" color="var(--text-disabled)" />
      <p>选中文本后点击「重写」开始</p>
      <p class="hint">或使用悬浮工具栏的其他微调功能</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  NSpace, NButton, NScrollbar, NText, NDivider,
  NTabs, NTabPane, NAlert,
} from 'naive-ui';
import AppIcon from '@/components/common/AppIcon.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useGenerationStore } from '@/stores/generationStore';
import { useConfigStore } from '@/stores/configStore';

const store = useGenerationStore();
const configStore = useConfigStore();

const emit = defineEmits<{
  replace: [content: string];
}>();

function handleReplace() {
  if (store.selectedVersion) {
    emit('replace', store.selectedVersion);
  }
}

/** 渲染版本内容（换行 → <br>，其他转义由 DOMPurify 处理过） */
function renderedVersion(idx: number): string {
  const text = store.versions[idx] ?? '';
  return text
    .split('\n')
    .map(line => line.trim() ? `<p>${escapeHtml(line)}</p>` : '<br>')
    .join('');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
</script>

<style scoped>
.generation-panel {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 80px;
}

.loading-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
}

.version-content {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-primary);
  padding: 8px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  min-height: 60px;
}

.version-content p {
  margin: 0.3em 0;
}

.version-actions {
  margin-top: 8px;
}
</style>

