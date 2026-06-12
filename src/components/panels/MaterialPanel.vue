<template>
  <div class="material-panel">
    <!-- 自动检索开关指示 -->
    <n-space align="center" :size="4" style="margin-bottom: 4px;">
      <n-tag
        :type="configStore.config.autoRetrieveMaterial ? 'success' : 'default'"
        size="tiny"
        :bordered="false"
      >
        {{ configStore.config.autoRetrieveMaterial ? '自动检索已开启' : '自动检索已关闭' }}
      </n-tag>
      <n-button
        v-if="store.autoMatchedIds.length > 0"
        text
        size="tiny"
        @click="store.clearAutoMatched()"
        style="font-size: 11px"
      >
        清除匹配
      </n-button>
    </n-space>

    <!-- 顶部：搜索 + 新建 -->
    <n-space vertical :size="6">
      <n-input
        v-model:value="store.searchQuery"
        placeholder="搜索素材..."
        clearable
        size="small"
      >
        <template #prefix><AppIcon name="search" :size="14" /></template>
      </n-input>
      <n-button dashed block size="small" @click="openEditor()">
        <template #icon><AppIcon name="add" :size="14" /></template>
        新建素材
      </n-button>
    </n-space>

    <n-divider style="margin: 6px 0" />

    <!-- 自动匹配提示 -->
    <n-alert
      v-if="configStore.config.autoRetrieveMaterial && store.autoMatchedIds.length > 0"
      type="success"
      :bordered="false"
      closable
      @close="store.clearAutoMatched()"
      style="margin-bottom: 4px"
    >
      <template #header>
        自动匹配到 {{ store.autoMatchedIds.length }} 个素材
      </template>
      <n-text depth="3" style="font-size: 12px">
        这些素材将在 AI 生成时自动注入提示词
      </n-text>
    </n-alert>

    <!-- 素材列表 -->
    <n-scrollbar style="max-height: calc(100vh - 380px)" trigger="none">
      <!-- Loading -->
      <LoadingSpinner v-if="store.loading" :visible="true" size="small" text="加载中…" />

      <!-- 空状态 -->
      <div v-else-if="store.filteredMaterials.length === 0" class="empty-state">
        <AppIcon name="bookmark" :size="24" color="var(--text-disabled)" />
        <p>暂无素材</p>
        <p class="hint">点击「新建素材」创建或「导入」JSON 文件</p>
      </div>

      <!-- 素材条目列表 -->
      <n-list v-else :show-divider="false">
        <n-list-item
          v-for="m in store.filteredMaterials"
          :key="m.id"
          class="material-item"
          :class="{
            selected: store.manuallySelectedId === m.id,
            'auto-matched': store.autoMatchedIds.includes(m.id) && store.manuallySelectedId !== m.id,
          }"
        >
          <template #prefix>
            <n-checkbox
              :checked="store.manuallySelectedId === m.id"
              @update:checked="store.toggleManualSelect(m.id)"
              size="small"
            />
          </template>

          <n-thing :title="m.name" title-extra>
            <template #header-extra>
              <n-space :size="4">
                <!-- 自动匹配标签 -->
                <n-tag
                  v-if="store.autoMatchedIds.includes(m.id) && store.manuallySelectedId !== m.id"
                  size="tiny"
                  :bordered="false"
                  type="success"
                >
                  匹配
                </n-tag>
                <!-- 手动选中标签 -->
                <n-tag
                  v-if="store.manuallySelectedId === m.id"
                  size="tiny"
                  :bordered="false"
                  type="info"
                >
                  已选
                </n-tag>
              </n-space>
            </template>
            <template #description>
              <n-text depth="3" class="content-preview">{{ truncate(m.content, 80) }}</n-text>
            </template>
            <template #footer>
              <n-space :size="4" wrap>
                <n-tag
                  v-for="tag in getTagList(m)"
                  :key="tag"
                  size="tiny"
                  :bordered="false"
                  :type="getTagType(tag, m)"
                >
                  {{ tag }}
                </n-tag>
              </n-space>
            </template>
          </n-thing>

          <template #suffix>
            <n-button text size="tiny" @click="openEditor(m)" style="padding: 2px">
              <template #icon><AppIcon name="create" :size="14" /></template>
            </n-button>
            <n-button text size="tiny" @click="handleDelete(m)" style="padding: 2px">
              <template #icon><AppIcon name="trash" :size="14" /></template>
            </n-button>
          </template>
        </n-list-item>
      </n-list>
    </n-scrollbar>

    <!-- 已选素材指示 -->
    <div v-if="store.hasActiveMaterial" class="selected-badge">
      <n-text depth="3" style="font-size: 12px">
        <template v-if="store.activeMaterial">
          已选素材：<n-tag size="tiny" :bordered="false" type="info">{{ store.activeMaterial.name }}</n-tag>
        </template>
        <template v-else-if="store.autoMatchedIds.length > 0">
          已匹配 {{ store.autoMatchedIds.length }} 个素材（自动注入）
        </template>
      </n-text>
    </div>

    <!-- 底部操作栏 -->
    <n-divider style="margin: 4px 0" />
    <n-space justify="space-between">
      <n-button size="tiny" quaternary @click="handleImport">
        <template #icon><AppIcon name="upload" :size="12" /></template>
        导入
      </n-button>
      <n-button size="tiny" quaternary @click="handleExport">
        <template #icon><AppIcon name="download" :size="12" /></template>
        导出
      </n-button>
    </n-space>

    <!-- 编辑弹窗 -->
    <MaterialEditDialog
      v-model:show="dialogVisible"
      :material="editingMaterial"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  NSpace, NInput, NButton, NDivider, NScrollbar, NList,
  NListItem, NCheckbox, NThing, NText, NTag, NAlert, useMessage,
} from 'naive-ui';
import AppIcon from '@/components/common/AppIcon.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import MaterialEditDialog from './MaterialEditDialog.vue';
import { useMaterialStore } from '@/stores/materialStore';
import { useConfigStore } from '@/stores/configStore';
import type { Material } from '@/types/material';
import { exportAllData, downloadJSON, importFromJSON } from '@/utils/exportImport';

const store = useMaterialStore();
const configStore = useConfigStore();
const message = useMessage();

const dialogVisible = ref(false);
const editingMaterial = ref<Material | null>(null);

onMounted(() => {
  store.loadMaterials();
});

// ========== CRUD ==========
function openEditor(material?: Material) {
  editingMaterial.value = material ?? null;
  dialogVisible.value = true;
}

async function handleSave(data: Omit<Material, 'id' | 'createdAt'>) {
  try {
    if (editingMaterial.value) {
      // 编辑
      await store.updateMaterial(editingMaterial.value.id, data);
      message.success('素材已更新');
    } else {
      // 新建
      await store.addMaterial(data);
      message.success('素材已创建');
    }
  } catch (err) {
    message.error('保存失败：' + (err as Error).message);
  }
}

async function handleDelete(material: Material) {
  try {
    await store.deleteMaterial(material.id);
    message.success('已删除：' + material.name);
  } catch (err) {
    message.error('删除失败：' + (err as Error).message);
  }
}

// ========== 导入导出 ==========
async function handleExport() {
  try {
    const data = await exportAllData();
    downloadJSON(data);
    message.success('数据已导出');
  } catch (err) {
    message.error('导出失败');
  }
}

function handleImport() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await importFromJSON(text);
      await store.loadMaterials();
      message.success('数据已导入');
    } catch (err) {
      message.error('导入失败：' + (err as Error).message);
    }
  };
  input.click();
}

// ========== 工具函数 ==========
function truncate(text: string, max: number): string {
  return text.length > max ? text.substring(0, max) + '…' : text;
}

const TAG_KEYS = ['role', 'scene', 'emotion'] as const;

function getTagList(m: Material): string[] {
  const tags: string[] = [];
  if (m.naturalCondition) {
    tags.push(...m.naturalCondition.split(/[,，\s]+/).filter(Boolean).slice(0, 3));
  }
  if (m.structuredTags) {
    for (const key of TAG_KEYS) {
      const vals = m.structuredTags[key];
      if (vals) tags.push(...vals);
    }
  }
  return tags.slice(0, 5);
}

function getTagType(tag: string, m: Material): 'default' | 'info' | 'success' | 'warning' | 'error' {
  // role → info, scene → success, emotion → warning
  if (m.structuredTags?.role?.includes(tag)) return 'info';
  if (m.structuredTags?.scene?.includes(tag)) return 'success';
  if (m.structuredTags?.emotion?.includes(tag)) return 'warning';
  return 'default';
}
</script>

<style scoped>
.material-panel {
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 100%;
}

.material-item {
  border-radius: 4px;
  transition: background 0.15s;
  cursor: pointer;
  padding: 4px 0;
}
.material-item:hover {
  background: var(--hover-color);
}
.material-item.selected {
  background: rgba(126, 200, 160, 0.1);
  border-left: 2px solid var(--accent-color);
}
.material-item.auto-matched {
  background: rgba(99, 226, 183, 0.06);
  border-left: 2px solid rgba(99, 226, 183, 0.4);
}

.content-preview {
  font-size: 12px;
  line-height: 1.5;
  display: block;
  margin-top: 2px;
}

.selected-badge {
  padding: 4px 0;
  display: flex;
  align-items: center;
}
</style>

