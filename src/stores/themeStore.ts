import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { darkThemeOverrides, lightThemeOverrides } from '@/config/theme';

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<'light' | 'dark'>('dark');

  const themeOverrides = computed(() =>
    currentTheme.value === 'light' ? lightThemeOverrides : darkThemeOverrides
  );

  function setTheme(theme: 'light' | 'dark') {
    currentTheme.value = theme;
    // 后续任务 16 将同步到 configStore 和 localStorage
  }

  function toggleTheme() {
    setTheme(currentTheme.value === 'light' ? 'dark' : 'light');
  }

  return {
    currentTheme,
    themeOverrides,
    setTheme,
    toggleTheme,
  };
});
