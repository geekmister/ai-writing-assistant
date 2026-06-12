<template>
  <div class="app-header">
    <span class="logo">✍ AI 写作助手</span>
    <div class="header-actions">
      <slot name="actions" />
      <ThemeSwitch />
      <n-button text size="small" @click="emit('open-settings')" style="color: var(--text-secondary)">
        <template #icon><AppIcon name="settings" :size="16" /></template>
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton } from 'naive-ui';
import AppIcon from './AppIcon.vue';
import ThemeSwitch from './ThemeSwitch.vue';

const emit = defineEmits<{
  'open-settings': [];
}>();
</script>

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
