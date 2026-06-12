<template>
  <div class="tip-tap-editor">
    <div class="editor-toolbar">
      <slot name="toolbar" />
    </div>
    <div class="editor-content" contenteditable>
      <p>开始创作…</p>
    </div>
  </div>
</template>

<style scoped>
.tip-tap-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.editor-toolbar {
  padding: 8px 16px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
.editor-content {
  flex: 1;
  padding: 24px 32px;
  font-size: 16px;
  line-height: 1.8;
  outline: none;
  color: var(--text-primary);
}
</style>
