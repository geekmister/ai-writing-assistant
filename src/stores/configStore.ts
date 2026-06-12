import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import type { AppConfig } from '@/types/config';

const DEFAULT_CONFIG: AppConfig = {
  openaiApiKey: '',
  model: 'gpt-3.5-turbo',
  autoRetrieveMaterial: true,
  defaultStyleId: null,
  theme: 'dark',
  generation: {
    temperature: 0.7,
    maxTokens: 2000,
    n: 2,
  },
};

const CONFIG_LOCAL_KEY = 'ai_writing_config';

export const useConfigStore = defineStore('config', () => {
  const loaded = ref(false);
  const config = reactive<AppConfig>({ ...DEFAULT_CONFIG });

  /** 从 localStorage 加载缓存的配置 */
  function loadFromLocal(): AppConfig | null {
    try {
      const raw = localStorage.getItem(CONFIG_LOCAL_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /** 将当前配置缓存到 localStorage */
  function persistToLocal(cfg: AppConfig) {
    try {
      localStorage.setItem(CONFIG_LOCAL_KEY, JSON.stringify(cfg));
    } catch {
      // localStorage 可能不可用（隐私模式），静默失败
    }
  }

  /** 从 IndexedDB 加载配置，fallback 到 localStorage 缓存 */
  async function loadConfig() {
    if (loaded.value) return;

    // 优先 localStorage 快取
    const local = loadFromLocal();
    if (local) {
      Object.assign(config, local);
      loaded.value = true;
      return;
    }

    // 再从 IndexedDB 加载
    try {
      const { db } = await import('@/services/storage/db');
      const entry = await db.config.get('appConfig');
      if (entry?.value) {
        Object.assign(config, entry.value);
        persistToLocal(entry.value);
      }
    } catch {
      // IndexedDB 不可用时使用默认值
    }

    loaded.value = true;
  }

  /** 更新配置并持久化 */
  async function updateConfig(partial: Partial<AppConfig>) {
    Object.assign(config, partial);
    persistToLocal({ ...config });

    try {
      const { db } = await import('@/services/storage/db');
      await db.config.put({ key: 'appConfig', value: { ...config } });
    } catch {
      // 静默
    }
  }

  return {
    loaded,
    config,
    loadConfig,
    updateConfig,
  };
});
