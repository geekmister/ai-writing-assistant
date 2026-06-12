import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { darkThemeOverrides, lightThemeOverrides } from '@/config/theme';

const THEME_LOCAL_KEY = 'ai_writing_theme';

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<'light' | 'dark'>('dark');

  const themeOverrides = computed(() =>
    currentTheme.value === 'light' ? lightThemeOverrides : darkThemeOverrides
  );

  /** 从 localStorage 加载缓存的主题偏好 */
  function loadFromLocal(): 'light' | 'dark' | null {
    try {
      const val = localStorage.getItem(THEME_LOCAL_KEY);
      if (val === 'light' || val === 'dark') return val;
      return null;
    } catch { return null; }
  }

  /** 写入 localStorage */
  function persistToLocal(theme: 'light' | 'dark') {
    try { localStorage.setItem(THEME_LOCAL_KEY, theme); } catch {}
  }

  /** 初始化：优先 localStorage，再尝试从 configStore 同步 */
  async function initTheme() {
    const local = loadFromLocal();
    if (local) {
      currentTheme.value = local;
      return;
    }
    // 尝试从 configStore 同步
    try {
      const { useConfigStore } = await import('@/stores/configStore');
      const cfg = useConfigStore();
      if (cfg.config.theme === 'light' || cfg.config.theme === 'dark') {
        currentTheme.value = cfg.config.theme;
        persistToLocal(cfg.config.theme);
      }
    } catch {}
  }

  function setTheme(theme: 'light' | 'dark') {
    currentTheme.value = theme;
    persistToLocal(theme);
    // 同步到 configStore（异步）
    import('@/stores/configStore').then(({ useConfigStore }) => {
      useConfigStore().updateConfig({ theme }).catch(() => {});
    });
  }

  function toggleTheme() {
    setTheme(currentTheme.value === 'light' ? 'dark' : 'light');
  }

  return {
    currentTheme,
    themeOverrides,
    setTheme,
    toggleTheme,
    initTheme,
  };
});
