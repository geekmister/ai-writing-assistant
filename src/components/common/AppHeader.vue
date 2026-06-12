<template>
  <div class="app-header">
    <span class="logo">✍ AI 写作助手</span>
    <div class="header-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 16px;
  border-bottom: 1px solid var(--border-color);
  background: var(--sidebar-bg);
  flex-shrink: 0;
}
.logo {
  font-size: 15px;
  font-weight: 600;
  color: var(--accent-color);
  letter-spacing: 0.5px;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
