import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { callOpenAI } from '@/services/ai/openai';
import { buildMessages } from '@/services/ai/contextBuilder';
import type { BuildPromptParams } from '@/services/ai/contextBuilder';
import { useConfigStore } from '@/stores/configStore';
import { useStyleStore } from '@/stores/styleStore';
import { useMaterialStore } from '@/stores/materialStore';
import type { GenerationRequest } from '@/types/generation';

export const useGenerationStore = defineStore('generation', () => {
  // ========== State ==========
  const loading = ref(false);
  const versions = ref<string[]>([]);
  const selectedVersionIndex = ref(0);
  const error = ref<string | null>(null);
  const lastRequest = ref<GenerationRequest | null>(null);

  // 上下文信息（用于展示）
  const activeStyleName = ref('');
  const activeMaterialNames = ref<string[]>([]);

  // ========== Getters ==========
  const hasResults = computed(() => versions.value.length > 0);
  const selectedVersion = computed(
    () => versions.value[selectedVersionIndex.value] ?? ''
  );

  // AbortController
  let abortController: AbortController | null = null;

  // ========== Actions ==========
  async function generate(request: GenerationRequest): Promise<void> {
    // 取消上一个未完成的请求
    if (abortController) abortController.abort();
    abortController = new AbortController();

    loading.value = true;
    error.value = null;
    versions.value = [];
    selectedVersionIndex.value = 0;

    try {
      // 1. 构建 prompt（system + user 消息）
      const promptParams: BuildPromptParams = {
        selectedText: request.selectedText,
        beforeText: request.beforeText,
        afterText: request.afterText,
        instructionKey: request.instructionKey,
        instructionParams: request.instructionParams,
      };
      // 2. 记录当前上下文信息（用于右侧面板展示）
      const styleStore = useStyleStore();
      const materialStore = useMaterialStore();
      activeStyleName.value = styleStore.currentStyle?.name ?? '默认风格';
      activeMaterialNames.value = [
        materialStore.activeMaterial?.name,
        ...materialStore
          .retrieveByKeywords(
            `${request.beforeText} ${request.selectedText} ${request.afterText}`
          )
          .map(m => m.name),
      ].filter(Boolean) as string[];

      // 3. 调用 API
      const config = useConfigStore().config;
      const rawVersions = await callOpenAI(
        messages,
        config,
        abortController.signal
      );

      versions.value = rawVersions;
      lastRequest.value = request;
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      error.value = (err as Error).message;
    } finally {
      loading.value = false;
      abortController = null;
    }
  }

  function selectVersion(index: number) {
    if (index >= 0 && index < versions.value.length) {
      selectedVersionIndex.value = index;
    }
  }

  function regenerate() {
    if (lastRequest.value) {
      return generate(lastRequest.value);
    }
  }

  function reset() {
    versions.value = [];
    selectedVersionIndex.value = 0;
    error.value = null;
    lastRequest.value = null;
  }

  return {
    loading,
    versions,
    selectedVersionIndex,
    error,
    hasResults,
    selectedVersion,
    activeStyleName,
    activeMaterialNames,
    generate,
    selectVersion,
    regenerate,
    reset,
  };
});
