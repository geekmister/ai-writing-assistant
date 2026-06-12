<template>
  <n-button
    text
    size="small"
    @click="themeStore.toggleTheme()"
    :title="themeStore.currentTheme === 'dark' ? '切换到亮色主题' : '切换到暗色主题'"
    style="color: var(--text-secondary)"
  >
    <template #icon>
      <AppIcon :name="themeStore.currentTheme === 'dark' ? 'sunny' : 'moon'" :size="16" />
    </template>
  </n-button>
</template>

<script setup lang="ts">
import { NButton } from 'naive-ui';
import AppIcon from './AppIcon.vue';
import { useThemeStore } from '@/stores/themeStore';

const themeStore = useThemeStore();
</script>
