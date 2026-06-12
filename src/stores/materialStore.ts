import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Material } from '@/types/material';
import {
  listMaterials as apiListMaterials,
  addMaterial as apiAddMaterial,
  updateMaterial as apiUpdateMaterial,
  deleteMaterial as apiDeleteMaterial,
} from '@/services/storage/material';
import { retrieveByTokenizedKeywords } from '@/services/nlp/materialMatcher';
import type { MatchResult } from '@/services/nlp/materialMatcher';

export const useMaterialStore = defineStore('material', () => {
  // ========== State ==========
  const materials = ref<Material[]>([]);
  const loading = ref(false);
  const searchQuery = ref('');
  /** 用户手动选中的素材 ID */
  const manuallySelectedId = ref<string | null>(null);
  /** 自动匹配到的素材 ID 列表 */
  const autoMatchedIds = ref<string[]>([]);
  /** 最近一次检索时的上下文文本 */
  const lastContextText = ref('');

  // ========== Getters ==========
  /** 按搜索词过滤 */
  const filteredMaterials = computed(() => {
    if (!searchQuery.value) return materials.value;
    const q = searchQuery.value.toLowerCase();
    return materials.value.filter(
      m =>
        m.name.toLowerCase().includes(q) ||
        m.content.toLowerCase().includes(q) ||
        m.naturalCondition?.toLowerCase().includes(q)
    );
  });

  /** 当前手动选中的素材对象 */
  const activeMaterial = computed(() => {
    if (!manuallySelectedId.value) return null;
    return materials.value.find(m => m.id === manuallySelectedId.value) ?? null;
  });

  // ========== Actions ==========
  async function loadMaterials() {
    loading.value = true;
    try {
      materials.value = await apiListMaterials();
    } finally {
      loading.value = false;
    }
  }

  async function addMaterial(data: Omit<Material, 'id' | 'createdAt'>): Promise<Material> {
    const material = await apiAddMaterial(data);
    await loadMaterials();
    return material;
  }

  async function updateMaterial(id: string, data: Partial<Material>): Promise<void> {
    await apiUpdateMaterial(id, data);
    await loadMaterials();
  }

  async function deleteMaterial(id: string): Promise<void> {
    await apiDeleteMaterial(id);
    if (manuallySelectedId.value === id) {
      manuallySelectedId.value = null;
    }
    await loadMaterials();
  }

  /** 手动切换选中素材 */
  function toggleManualSelect(id: string | null) {
    manuallySelectedId.value =
      manuallySelectedId.value === id ? null : id;
  }

  /** 关键词检索（两层策略：jieba 分词增强 → 简单 includes 兜底） */
  function retrieveByKeywords(text: string): Material[] {
    if (!text.trim()) return [];
    const lowerText = text.toLowerCase();
    return materials.value.filter(m => {
      // 自然语言条件：所有关键词都匹配才算命中
      if (m.naturalCondition) {
        const keywords = m.naturalCondition.split(/[,，\s]+/).filter(Boolean);
        if (keywords.every(kw => lowerText.includes(kw.toLowerCase()))) return true;
      }
      // 结构化标签：任一匹配即可
      if (m.structuredTags) {
        const tagValues = Object.values(m.structuredTags).flat().filter(Boolean) as string[];
        if (tagValues.some(tag => lowerText.includes(tag.toLowerCase()))) return true;
      }
      return false;
    });
  }

  /**
   * 基于 jieba 分词增强的自动检索（异步）
   * 用于编辑器选区变化或生成前的精确匹配
   */
  async function retrieveAuto(contextText: string): Promise<void> {
    if (!contextText.trim()) {
      autoMatchedIds.value = [];
      lastContextText.value = '';
      return;
    }

    lastContextText.value = contextText;
    const results: MatchResult[] = await retrieveByTokenizedKeywords(
      contextText,
      materials.value
    );
    autoMatchedIds.value = results
      .filter(r => r.score > 0 && r.material.id !== manuallySelectedId.value)
      .map(r => r.material.id);
  }

  /** 清除自动匹配结果 */
  function clearAutoMatched() {
    autoMatchedIds.value = [];
    lastContextText.value = '';
  }

  /** 是否有活跃的自动或手动素材 */
  const hasActiveMaterial = computed(() =>
    manuallySelectedId.value !== null || autoMatchedIds.value.length > 0
  );

  return {
    // state
    materials,
    loading,
    searchQuery,
    manuallySelectedId,
    autoMatchedIds,
    lastContextText,
    // getters
    filteredMaterials,
    activeMaterial,
    hasActiveMaterial,
    // actions
    loadMaterials,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    toggleManualSelect,
    retrieveByKeywords,
    retrieveAuto,
    clearAutoMatched,
  };
});
