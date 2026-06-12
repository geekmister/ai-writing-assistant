<template>
  <bubble-menu
    :editor="editor"
    :tippy-options="{
      duration: 150,
      placement: 'top',
      maxWidth: 580,
    }"
    class="floating-toolbar"
  >
    <n-space :size="2" align="center" class="toolbar-inner">
      <!-- 重写 -->
      <n-button size="tiny" quaternary @click="handleAction('rewrite')" class="action-btn" :disabled="loading">
        <template #icon><AppIcon name="sparkles" :size="13" /></template>
        重写
      </n-button>

      <n-divider vertical :style="{ margin: '0 2px' }" />

      <!-- 缩写 -->
      <n-button size="tiny" quaternary @click="handleAction('shorten')" class="action-btn" :disabled="loading">
        缩写
      </n-button>

      <!-- 扩写 -->
      <n-button size="tiny" quaternary @click="handleAction('expand')" class="action-btn" :disabled="loading">
        扩写
      </n-button>

      <!-- 改语气 -->
      <n-dropdown trigger="click" :options="toneOptions" @select="handleToneSelect" size="small">
        <n-button size="tiny" quaternary class="action-btn" :disabled="loading">
          改语气
          <template #suffix><AppIcon name="chevron-down" :size="10" /></template>
        </n-button>
      </n-dropdown>

      <!-- 改人称（智能禁用） -->
      <n-dropdown trigger="click" :options="smartPersonOptions" @select="handlePersonSelect" size="small">
        <n-button size="tiny" quaternary class="action-btn" :disabled="loading || smartPersonDisabled">
          改人称
          <template #suffix><AppIcon name="chevron-down" :size="10" /></template>
        </n-button>
      </n-dropdown>

      <!-- 改句式 -->
      <n-dropdown trigger="click" :options="structureOptions" @select="handleStructureSelect" size="small">
        <n-button size="tiny" quaternary class="action-btn" :disabled="loading">
          改句式
          <template #suffix><AppIcon name="chevron-down" :size="10" /></template>
        </n-button>
      </n-dropdown>
    </n-space>
  </bubble-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { BubbleMenu } from '@tiptap/vue-3';
import type { Editor } from '@tiptap/vue-3';
import { NSpace, NButton, NDivider, NDropdown } from 'naive-ui';
import AppIcon from '@/components/common/AppIcon.vue';
import type { ToneType, PersonType } from '@/types/editor';

const props = defineProps<{
  editor: Editor;
  /** 是否正在 AI 生成中 */
  loading?: boolean;
}>();

const emit = defineEmits<{
  rewrite: [];
  shorten: [];
  expand: [];
  'change-tone': [tone: ToneType];
  'change-person': [from: PersonType, to: PersonType];
  'change-structure': [type: 'split' | 'merge'];
}>();

// ========== 语气下拉（8 种全支持） ==========
const toneOptions = [
  { label: '正式', key: 'formal' },
  { label: '口语', key: 'informal' },
  { label: '幽默', key: 'humorous' },
  { label: '严肃', key: 'serious' },
  { label: '温柔', key: 'gentle' },
  { label: '霸道/强势', key: 'dominant' },
  { label: '自卑/舔狗', key: 'lickdog' },
  { label: '高冷/绿茶', key: 'green_tea' },
];

// ========== 句式下拉 ==========
const structureOptions = [
  { label: '长句拆短句', key: 'split' },
  { label: '短句合并长句', key: 'merge' },
];

// ========== 人称智能检测 ==========
/** 检测选中文本的人称 */
function detectPerson(text: string): 'first' | 'third' | 'mixed' | 'none' {
  const firstCount = (text.match(/[我我们咱咱们自己]/g) || []).length;
  const thirdCount = (text.match(/[他她它他们她们它们]/g) || []).length;
  if (firstCount > thirdCount * 1.5) return 'first';
  if (thirdCount > firstCount * 1.5) return 'third';
  if (firstCount > 0 || thirdCount > 0) return 'mixed';
  return 'none';
}

/** 当前选中文本的人称 */
const currentPerson = computed(() => {
  const { from, to } = props.editor.state.selection;
  const text = props.editor.state.doc.textBetween(from, to);
  return detectPerson(text);
});

/** 智能人称选项（禁用不合理的转换方向） */
const smartPersonOptions = computed(() => {
  const detected = currentPerson.value;
  return [
    {
      label: '第一 → 第三人称',
      key: 'first-to-third',
      disabled: detected !== 'first',
    },
    {
      label: '第三 → 第一人称',
      key: 'third-to-first',
      disabled: detected !== 'third',
    },
  ];
});

/** 当无法检测出明确人称时，整个改人称按钮禁用 */
const smartPersonDisabled = computed(() => {
  return currentPerson.value === 'mixed' || currentPerson.value === 'none';
});

// ========== 操作处理 ==========
function handleAction(type: string) {
  switch (type) {
    case 'rewrite': emit('rewrite'); break;
    case 'shorten': emit('shorten'); break;
    case 'expand':  emit('expand');  break;
  }
}

function handleToneSelect(key: string) {
  emit('change-tone', key as ToneType);
}

function handlePersonSelect(key: string) {
  if (key === 'first-to-third') {
    emit('change-person', 'first', 'third');
  } else {
    emit('change-person', 'third', 'first');
  }
}

function handleStructureSelect(key: string) {
  emit('change-structure', key as 'split' | 'merge');
}
</script>

<style scoped>
.floating-toolbar {
  background: var(--toolbar-bg, #1e293b);
  border: 1px solid var(--border-color, #334155);
  border-radius: 8px;
  padding: 4px 6px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  z-index: 100;
}

.toolbar-inner {
  flex-wrap: nowrap;
}

:deep(.action-btn) {
  font-size: 12px;
  padding: 0 6px;
  height: 26px;
  color: var(--text-primary, #e2e8f0);
  transition: color 0.15s, background 0.15s;
}
:deep(.action-btn:hover) {
  color: var(--accent-color, #7ec8a0);
  background: rgba(126, 200, 160, 0.1);
}
:deep(.action-btn:disabled) {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
