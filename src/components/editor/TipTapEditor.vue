<template>
  <div class="tip-tap-editor">
    <!-- 固定工具栏 -->
    <div class="editor-toolbar" v-if="editor">
      <n-space :size="2" align="center" wrap>
        <!-- 历史操作 -->
        <n-button-group size="tiny">
          <n-button
            :disabled="!editor.can().chain().focus().undo().run()"
            @click="editor.chain().focus().undo().run()"
            quaternary
          >
            <template #icon><AppIcon name="arrow-back" :size="14" /></template>
          </n-button>
          <n-button
            :disabled="!editor.can().chain().focus().redo().run()"
            @click="editor.chain().focus().redo().run()"
            quaternary
          >
            <template #icon><AppIcon name="arrow-forward" :size="14" /></template>
          </n-button>
        </n-button-group>

        <n-divider vertical />

        <!-- 文字格式 -->
        <n-button
          :type="editor.isActive('bold') ? 'primary' : 'default'"
          size="tiny"
          @click="editor.chain().focus().toggleBold().run()"
          quaternary
        >
          <b>B</b>
        </n-button>
        <n-button
          :type="editor.isActive('italic') ? 'primary' : 'default'"
          size="tiny"
          @click="editor.chain().focus().toggleItalic().run()"
          quaternary
        >
          <i>I</i>
        </n-button>
        <n-button
          :type="editor.isActive('strike') ? 'primary' : 'default'"
          size="tiny"
          @click="editor.chain().focus().toggleStrike().run()"
          quaternary
        >
          <s>S</s>
        </n-button>

        <n-divider vertical />

        <!-- 标题下拉 -->
        <n-dropdown :options="headingOptions" @select="setHeading" size="small">
          <n-button size="tiny" quaternary>
            {{ currentHeadingLabel }}
            <template #suffix><AppIcon name="chevron-down" :size="10" /></template>
          </n-button>
        </n-dropdown>

        <n-divider vertical />

        <!-- 列表 -->
        <n-button
          :type="editor.isActive('bulletList') ? 'primary' : 'default'"
          size="tiny"
          @click="editor.chain().focus().toggleBulletList().run()"
          quaternary
        >
          无序列表
        </n-button>
        <n-button
          :type="editor.isActive('orderedList') ? 'primary' : 'default'"
          size="tiny"
          @click="editor.chain().focus().toggleOrderedList().run()"
          quaternary
        >
          有序列表
        </n-button>

        <n-divider vertical />

        <!-- 引用 & 分割线 -->
        <n-button
          :type="editor.isActive('blockquote') ? 'primary' : 'default'"
          size="tiny"
          @click="editor.chain().focus().toggleBlockquote().run()"
          quaternary
        >
          引用
        </n-button>
        <n-button
          size="tiny"
          @click="editor.chain().focus().setHorizontalRule().run()"
          quaternary
        >
          分割线
        </n-button>

        <!-- 右侧占位，字数统计在右下 -->
      </n-space>
    </div>

    <!-- 编辑器内容区 -->
    <n-scrollbar class="editor-scroll">
      <FloatingToolbar
        v-if="editor"
        :editor="editor"
        :loading="generationStore.loading"
        @rewrite="handleAIRewrite"
        @shorten="handleAIShorten"
        @expand="handleAIExpand"
        @change-tone="handleAITone"
        @change-person="handleAIPerson"
        @change-structure="handleAIStructure"
      />
      <editor-content :editor="editor" class="editor-content" />
    </n-scrollbar>

    <!-- 底部信息栏 -->
    <div class="editor-footer" v-if="editor">
      <n-space :size="16" align="center">
        <n-text depth="3" style="font-size: 12px">
          字数：{{ charCount }}
        </n-text>
        <n-text depth="3" style="font-size: 12px">
          段落：{{ paragraphCount }}
        </n-text>
      </n-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import type { Editor } from '@tiptap/vue-3';
import {
  NSpace, NButton, NButtonGroup, NDivider, NDropdown, NScrollbar, NText, NIcon,
} from 'naive-ui';
import { sanitizeHTML } from '@/utils/dompurify';
import { debounce } from '@/utils/debounce';
import type { SelectionPayload, SelectionContext, PersonType } from '@/types/editor';
import AppIcon from '@/components/common/AppIcon.vue';
import FloatingToolbar from './FloatingToolbar.vue';
import { useGenerationStore } from '@/stores/generationStore';

const props = withDefaults(defineProps<{
  documentId?: string | null;
  readonly?: boolean;
  placeholder?: string;
  content?: string;
}>(), {
  documentId: null,
  readonly: false,
  placeholder: '开始创作…',
  content: '',
});

const generationStore = useGenerationStore();
const emit = defineEmits<{
  'update:content': [html: string];
  'selection-change': [payload: SelectionPayload];
  ready: [editor: Editor];
  'title-change': [title: string];
  // AI 操作事件 — 携带选区上下文供父组件直接调用 generationStore
  'ai-rewrite': [ctx: SelectionContext];
  'ai-shorten': [ctx: SelectionContext];
  'ai-expand': [ctx: SelectionContext];
  'ai-change-tone': [ctx: SelectionContext, tone: string];
  'ai-change-person': [ctx: SelectionContext, from: PersonType, to: PersonType];
  'ai-change-structure': [ctx: SelectionContext, type: string];
}>();

// ========== Editor 实例 ==========
const editor = useEditor({
  content: props.content || '',
  editable: !props.readonly,
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4] },
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
    CharacterCount,
  ],
  editorProps: {
    attributes: {
      class: 'prose-editor',
    },
  },
  onUpdate: ({ editor: ed }) => {
    const html = ed.getHTML();
    const clean = sanitizeHTML(html);
    if (clean !== html) {
      // 如果 DOMPurify 清理了内容，同步回编辑器
      // 避免递归，只在必要时设置
    }
    isDirty.value = html !== lastSavedContent.value;
    emit('update:content', clean);
    debouncedSave();
  },
  onSelectionUpdate: ({ editor: ed }) => {
    const { from, to } = ed.state.selection;
    const text = ed.state.doc.textBetween(from, to);
    emit('selection-change', {
      selectedText: text,
      isCollapsed: ed.state.selection.empty,
      from,
      to,
    });
  },
  onCreate: ({ editor: ed }) => {
    emit('ready', ed);
  },
});

// ========== 统计数据 ==========
const charCount = computed(() => {
  if (!editor.value) return 0;
  return editor.value.storage.characterCount?.characters?.() ?? 0;
});

const paragraphCount = computed(() => {
  if (!editor.value) return 0;
  let count = 0;
  editor.value.state.doc.descendants((node) => {
    if (node.type.name === 'paragraph') count++;
    return true;
  });
  return count;
});

// ========== 标题下拉 ==========
const headingOptions = [
  { label: '正文', key: '0' },
  { label: '标题 1', key: '1' },
  { label: '标题 2', key: '2' },
  { label: '标题 3', key: '3' },
  { label: '标题 4', key: '4' },
];

const currentHeadingLabel = computed(() => {
  if (!editor.value) return '正文';
  for (let i = 1; i <= 4; i++) {
    if (editor.value.isActive('heading', { level: i })) return `标题 ${i}`;
  }
  return '正文';
});

function setHeading(key: string) {
  if (!editor.value) return;
  const level = parseInt(key);
  if (level === 0) {
    editor.value.chain().focus().setParagraph().run();
  } else {
    editor.value.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 }).run();
  }
}

// ========== 脏状态追踪 ==========
const isDirty = ref(false);
const lastSavedContent = ref(props.content);

function markClean() {
  if (editor.value) {
    lastSavedContent.value = editor.value.getHTML();
    isDirty.value = false;
  }
}

const debouncedSave = debounce(() => {
  // 后续任务会通过 editorStore 自动持久化
}, 2000);

// ========== 暴露方法 ==========
function getSelectedText(): string {
  if (!editor.value) return '';
  const { from, to } = editor.value.state.selection;
  return editor.value.state.doc.textBetween(from, to);
}

function getSelectionContext(charsBefore = 200, charsAfter = 200): SelectionContext {
  if (!editor.value) {
    return { selectedText: '', beforeText: '', afterText: '', from: 0, to: 0 };
  }
  const { from, to } = editor.value.state.selection;
  const doc = editor.value.state.doc;
  const beforeStart = Math.max(0, from - charsBefore);
  const afterEnd = Math.min(doc.content.size, to + charsAfter);
  return {
    selectedText: doc.textBetween(from, to),
    beforeText: doc.textBetween(beforeStart, from),
    afterText: doc.textBetween(to, afterEnd),
    from,
    to,
  };
}

function replaceSelection(html: string) {
  editor.value?.chain().focus().deleteSelection().insertContent(html).run();
}

function focus() {
  editor.value?.commands.focus();
}

// ========== AI 操作处理 ==========
/** 从悬浮工具栏获取上下文并向上转发 */
function getCtx() {
  return getSelectionContext(200, 200);
}

function handleAIRewrite() {
  const ctx = getCtx();
  if (!ctx.selectedText) return;
  emit('ai-rewrite', ctx);
}

function handleAIShorten() {
  const ctx = getCtx();
  if (!ctx.selectedText) return;
  emit('ai-shorten', ctx);
}

function handleAIExpand() {
  const ctx = getCtx();
  if (!ctx.selectedText) return;
  emit('ai-expand', ctx);
}

function handleAITone(tone: string) {
  const ctx = getCtx();
  if (!ctx.selectedText) return;
  emit('ai-change-tone', ctx, tone);
}

function handleAIPerson(from: PersonType, to: PersonType) {
  const ctx = getCtx();
  if (!ctx.selectedText) return;
  emit('ai-change-person', ctx, from, to);
}

function handleAIStructure(type: string) {
  const ctx = getCtx();
  if (!ctx.selectedText) return;
  emit('ai-change-structure', ctx, type);
}

defineExpose({
  getEditor: () => editor.value,
  getSelectedText,
  getSelectionContext,
  replaceSelection,
  focus,
  markClean,
  isDirty,
});

// ========== 生命周期 ==========
watch(() => props.content, (newContent) => {
  if (editor.value && newContent !== editor.value.getHTML()) {
    editor.value.commands.setContent(newContent || '');
  }
});

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<style scoped>
.tip-tap-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--editor-bg);
}

.editor-toolbar {
  padding: 6px 16px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  background: var(--sidebar-bg);
  min-height: 40px;
}

.editor-scroll {
  flex: 1;
}

.editor-content {
  padding: 24px 32px;
  outline: none;
  min-height: 400px;
}

.editor-footer {
  padding: 4px 16px;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background: var(--sidebar-bg);
}
</style>

<style>
/* 全局编辑器内容样式 —— 非 scoped 以便作用于 TipTap 生成的 DOM */
.prose-editor {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-primary);
  outline: none;
}

.prose-editor p {
  margin: 0.5em 0;
}

.prose-editor h1 {
  font-size: 1.75em;
  font-weight: 700;
  margin: 0.8em 0 0.4em;
  line-height: 1.3;
  color: var(--text-primary);
}

.prose-editor h2 {
  font-size: 1.5em;
  font-weight: 600;
  margin: 0.7em 0 0.3em;
  line-height: 1.35;
  color: var(--text-primary);
}

.prose-editor h3 {
  font-size: 1.25em;
  font-weight: 600;
  margin: 0.6em 0 0.3em;
  line-height: 1.4;
}

.prose-editor h4 {
  font-size: 1.1em;
  font-weight: 600;
  margin: 0.5em 0 0.2em;
  line-height: 1.4;
}

.prose-editor ul,
.prose-editor ol {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.prose-editor li {
  margin: 0.25em 0;
}

.prose-editor blockquote {
  border-left: 3px solid var(--accent-color);
  padding-left: 16px;
  margin: 0.8em 0;
  color: var(--text-secondary);
  font-style: italic;
}

.prose-editor hr {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: 1.5em 0;
}

/* 占位符样式 */
.prose-editor p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: var(--text-disabled);
  float: left;
  height: 0;
  pointer-events: none;
}

/* 选中文本高亮 */
.prose-editor ::selection {
  background: rgba(126, 200, 160, 0.3);
}

/* 编辑器中粗体/斜体在工具栏激活态的视觉反馈 */
.ProseMirror-gapcursor {
  display: none;
}
</style>
