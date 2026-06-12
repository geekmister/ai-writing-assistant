import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Style } from '@/types/style';
import {
  listStyles as apiListStyles,
  addStyle as apiAddStyle,
  updateStyle as apiUpdateStyle,
  deleteStyle as apiDeleteStyle,
  setDefaultStyle as apiSetDefaultStyle,
} from '@/services/storage/style';
import { callOpenAI } from '@/services/ai/openai';
import type { AppConfig } from '@/types/config';

export const useStyleStore = defineStore('style', () => {
  // ========== State ==========
  const styles = ref<Style[]>([]);
  const loading = ref(false);
  /** 当前选中的风格 ID（用于 AI 生成） */
  const currentStyleId = ref<string | null>(null);

  /** 智能推荐状态 */
  const recommendLoading = ref(false);
  const recommendedStyleId = ref<string | null>(null);
  const recommendError = ref<string | null>(null);

  // ========== Getters ==========
  const currentStyle = computed(() =>
    styles.value.find(s => s.id === currentStyleId.value) ?? null
  );

  const defaultStyle = computed(() =>
    styles.value.find(s => s.isDefault) ?? null
  );

  /** 风格选择器选项 */
  const styleOptions = computed(() =>
    styles.value.map(s => ({
      label: `${s.name}${s.isDefault ? ' (默认)' : ''}`,
      value: s.id,
    }))
  );

  /** 被推荐的风格对象 */
  const recommendedStyle = computed(() =>
    styles.value.find(s => s.id === recommendedStyleId.value) ?? null
  );

  // ========== Actions ==========
  async function loadStyles() {
    loading.value = true;
    try {
      styles.value = await apiListStyles();
      // 初始化时自动选中默认风格
      if (!currentStyleId.value && defaultStyle.value) {
        currentStyleId.value = defaultStyle.value.id;
      }
    } finally {
      loading.value = false;
    }
  }

  async function addStyle(data: Omit<Style, 'id' | 'createdAt'>): Promise<Style> {
    const style = await apiAddStyle(data);
    await loadStyles();
    return style;
  }

  async function updateStyle(id: string, data: Partial<Style>): Promise<void> {
    await apiUpdateStyle(id, data);
    await loadStyles();
  }

  async function deleteStyle(id: string): Promise<void> {
    await apiDeleteStyle(id);
    if (currentStyleId.value === id) {
      currentStyleId.value = null;
    }
    await loadStyles();
  }

  async function setDefaultStyle(id: string): Promise<void> {
    await apiSetDefaultStyle(id);
    await loadStyles();
  }

  /** 切换当前使用风格 */
  function selectStyle(id: string | null) {
    currentStyleId.value = id;
  }

  /** 获取实际用于 AI 提示词的风格描述文本 */
  function getEffectiveStyleDescription(styleId?: string | null): string {
    const targetId = styleId ?? currentStyleId.value;
    const style = styles.value.find(s => s.id === targetId);
    if (style) return style.description;
    if (defaultStyle.value) return defaultStyle.value.description;
    return '无特定风格';
  }

  /** 清除推荐结果 */
  function clearRecommendation() {
    recommendedStyleId.value = null;
    recommendError.value = null;
  }

  /**
   * AI 智能推荐风格
   * 基于当前文档前 500 字符，从风格库中推荐最匹配的风格
   * @param documentContent 文档内容（纯文本，自动取前 500 字符）
   * @param config API 配置
   */
  async function recommendStyle(
    documentContent: string,
    config: AppConfig
  ): Promise<void> {
    if (!config.openaiApiKey) {
      recommendError.value = '请先配置 OpenAI API Key';
      return;
    }

    if (styles.value.length === 0) {
      recommendError.value = '风格库为空，请先创建风格';
      return;
    }

    const snippet = documentContent
      .replace(/<[^>]+>/g, '')  // 去除 HTML 标签
      .substring(0, 500);

    if (!snippet.trim()) {
      recommendError.value = '文档内容为空，无法推荐';
      return;
    }

    const styleListText = styles.value
      .map(s => `- ${s.name}：${s.description}`)
      .join('\n');

    const prompt = `根据以下文档片段，从用户风格库中推荐最匹配的风格。

文档片段：
${snippet}

用户风格库：
${styleListText}

请只返回最匹配的风格名称（精确匹配上面的名称），不要加任何解释。如果都不匹配，返回"无"。`;

    recommendLoading.value = true;
    recommendError.value = null;
    recommendedStyleId.value = null;

    try {
      const messages = [{ role: 'user' as const, content: prompt }];
      const results = await callOpenAI(messages, {
        ...config,
        generation: { temperature: 0.3, maxTokens: 50, n: 1 },
      });

      const name = results[0]?.trim() ?? '';
      const matched = styles.value.find(s => s.name === name);

      if (matched) {
        recommendedStyleId.value = matched.id;
      } else {
        recommendError.value = '未匹配到合适的风格';
      }
    } catch (err) {
      recommendError.value = (err as Error).message;
    } finally {
      recommendLoading.value = false;
    }
  }

  return {
    // state
    styles,
    loading,
    currentStyleId,
    recommendLoading,
    recommendedStyleId,
    recommendError,
    // getters
    currentStyle,
    defaultStyle,
    styleOptions,
    recommendedStyle,
    // actions
    loadStyles,
    addStyle,
    updateStyle,
    deleteStyle,
    setDefaultStyle,
    selectStyle,
    getEffectiveStyleDescription,
    recommendStyle,
    clearRecommendation,
  };
});
