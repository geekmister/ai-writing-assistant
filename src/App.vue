<script setup lang="ts">
import { NConfigProvider, NGlobalStyle, NMessageProvider, NDialogProvider, darkTheme } from 'naive-ui';
import { zhCN, dateZhCN } from 'naive-ui';
import { computed } from 'vue';
import { useThemeStore } from '@/stores/themeStore';

const themeStore = useThemeStore();

const themeOverrides = computed(() => themeStore.themeOverrides);
const isDark = computed(() => themeStore.currentTheme === 'dark');
</script>

<template>
  <n-config-provider
    :theme="isDark ? darkTheme : null"
    :theme-overrides="themeOverrides"
    :locale="zhCN"
    :date-locale="dateZhCN"
  >
    <n-global-style />
    <n-message-provider>
      <n-dialog-provider>
        <router-view />
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans SC', sans-serif;
}
</style>
