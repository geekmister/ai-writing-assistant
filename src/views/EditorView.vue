<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMessage } from 'naive-ui';
import TipTapEditor from '@/components/editor/TipTapEditor.vue';
import RightPanel from '@/components/panels/RightPanel.vue';
import DocumentList from '@/components/document/DocumentList.vue';
import AppHeader from '@/components/common/AppHeader.vue';
import { useGenerationStore } from '@/stores/generationStore';
import { useEditorStore } from '@/stores/editorStore';
import { useConfigStore } from '@/stores/configStore';
import type { SelectionContext } from '@/types/editor';
import {
  toneToInstructionKey,
  personToInstructionKey,
  structureToInstructionKey,
} from '@/types/generation';

const emit = defineEmits<{
  'open-settings': [];
}>();

const message = useMessage();
const generationStore = useGenerationStore();
const editorStore = useEditorStore();
const configStore = useConfigStore();

const editorRef = ref<InstanceType<typeof TipTapEditor> | null>(null);
const rightPanelRef = ref<InstanceType<typeof RightPanel> | null>(null);

/** 当前编辑器纯文本内容（剥离 HTML 标签，用于风格智能推荐） */
const editorPlainText = computed(() => {
  const html = editorStore.activeDocument?.content ?? '';
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
});

onMounted(() => {
  editorStore.loadDocuments();
  configStore.loadConfig();
});

// ========== AI 操作处理 ==========
async function handleAIRequest(ctx: SelectionContext, instructionKey: string, instructionParams?: Record<string, string>) {
  if (!ctx.selectedText.trim()) {
    message.warning('请先选中需要改写的文本');
    return;
  }

  if (!configStore.config.openaiApiKey) {
    message.warning('请先在设置中配置 OpenAI API Key');
    return;
  }

  // 切到右侧面板「生成」标签
  rightPanelRef.value?.switchToGeneration();

  await generationStore.generate({
    instructionKey,
    instructionParams,
    selectedText: ctx.selectedText,
    beforeText: ctx.beforeText,
    afterText: ctx.afterText,
  });
}

// 改写
function handleRewrite(ctx: SelectionContext) {
  handleAIRequest(ctx, 'rewrite');
}

// 缩写
function handleShorten(ctx: SelectionContext) {
  handleAIRequest(ctx, 'shorten');
}

// 扩写
function handleExpand(ctx: SelectionContext) {
  handleAIRequest(ctx, 'expand');
}

// 改变语气
function handleTone(ctx: SelectionContext, tone: string) {
  handleAIRequest(ctx, toneToInstructionKey(tone));
}

// 改变人称
function handlePerson(ctx: SelectionContext, from: string, to: string) {
  handleAIRequest(ctx, personToInstructionKey(from, to));
}

// 改变句式
function handleStructure(ctx: SelectionContext, type: string) {
  handleAIRequest(ctx, structureToInstructionKey(type));
}

// ========== 替换原文 ==========
function handleReplace(htmlContent: string) {
  editorRef.value?.replaceSelection(htmlContent);
  message.success('已替换原文');
  generationStore.reset();
}
</script>

<template>
  <div class="editor-layout">
    <AppHeader @open-settings="emit('open-settings')" />
    <div class="main-area">
      <DocumentList
        class="sidebar"
        :documents="editorStore.documents"
        :active-document-id="editorStore.activeDocumentId"
        @create="editorStore.newDocument"
        @open="editorStore.openDocument"
      />
      <TipTapEditor
        ref="editorRef"
        class="editor-area"
        :content="editorStore.activeDocument?.content ?? ''"
        @ai-rewrite="handleRewrite"
        @ai-shorten="handleShorten"
        @ai-expand="handleExpand"
        @ai-change-tone="handleTone"
        @ai-change-person="handlePerson"
        @ai-change-structure="handleStructure"
        @ready="editorStore.setEditor"
      />
      <RightPanel
        ref="rightPanelRef"
        class="right-panel"
        :document-content="editorPlainText"
        @replace="handleReplace"
      />
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
