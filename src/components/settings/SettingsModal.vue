<template>
  <n-modal
    :show="show"
    @update:show="emit('update:show', $event)"
    preset="card"
    title="设置"
    style="width: 600px"
    :mask-closable="false"
    :segmented="true"
  >
    <n-tabs type="line" :value="activeTab" @update:value="activeTab = $event">
      <!-- ===== Tab 1: AI 服务 ===== -->
      <n-tab-pane name="ai" tab="AI 服务">
        <n-form :model="localConfig" label-placement="left" label-width="120" size="small">
          <n-form-item label="OpenAI API Key">
            <n-input
              v-model:value="localConfig.openaiApiKey"
              type="password"
              show-password-on="click"
              placeholder="sk-..."
            />
            <template #feedback>
              <n-text depth="3" style="font-size: 12px">
                Key 仅保存在你的浏览器中，不会上传到任何服务器
              </n-text>
            </template>
          </n-form-item>

          <n-form-item label="模型">
            <n-select
              v-model:value="localConfig.model"
              :options="[
                { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
                { label: 'GPT-4', value: 'gpt-4' },
                { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
              ]"
            />
          </n-form-item>

          <n-form-item label="生成温度">
            <n-slider v-model:value="localConfig.generation.temperature" :min="0" :max="1" :step="0.1" />
            <template #feedback>
              <n-text depth="3" style="font-size: 12px">
                当前：{{ localConfig.generation.temperature.toFixed(1) }}（越低越稳定，越高越有创意）
              </n-text>
            </template>
          </n-form-item>

          <n-form-item label="版本数">
            <n-slider v-model:value="localConfig.generation.n" :min="1" :max="3" :step="1" />
            <template #feedback>
              <n-text depth="3" style="font-size: 12px">
                每次生成 {{ localConfig.generation.n }} 个版本
              </n-text>
            </template>
          </n-form-item>

          <n-form-item label="最大 Token">
            <n-input-number v-model:value="localConfig.generation.maxTokens" :min="100" :max="8000" :step="100" size="small" />
          </n-form-item>
        </n-form>
      </n-tab-pane>

      <!-- ===== Tab 2: 写作偏好 ===== -->
      <n-tab-pane name="writing" tab="写作偏好">
        <n-form label-placement="left" label-width="140" size="small">
          <n-form-item label="界面主题">
            <n-radio-group
              :value="localConfig.theme"
              @update:value="handleThemeChange"
            >
              <n-radio-button value="dark">
                <template #icon><AppIcon name="moon" :size="14" /></template>
                暗色
              </n-radio-button>
              <n-radio-button value="light">
                <template #icon><AppIcon name="sunny" :size="14" /></template>
                亮色
              </n-radio-button>
            </n-radio-group>
          </n-form-item>

          <n-form-item label="自动检索素材">
            <n-switch v-model:value="localConfig.autoRetrieveMaterial" />
            <template #feedback>
              <n-text depth="3" style="font-size: 12px">
                {{ localConfig.autoRetrieveMaterial ? '已开启 — AI 生成时自动匹配素材' : '已关闭 — 仅使用手动选中的素材' }}
              </n-text>
            </template>
          </n-form-item>

          <n-form-item label="默认风格">
            <n-select
              v-model:value="localConfig.defaultStyleId"
              :options="styleOptions"
              clearable
              placeholder="无默认风格"
            />
          </n-form-item>
        </n-form>
      </n-tab-pane>

      <!-- ===== Tab 3: 数据管理 ===== -->
      <n-tab-pane name="data" tab="数据管理">
        <n-space vertical :size="16">
          <n-alert type="info" :bordered="false">
            <template #header>关于数据存储</template>
            所有数据存储在浏览器 IndexedDB 中。更换设备或清除浏览器数据会导致内容丢失。建议定期导出备份。
          </n-alert>

          <n-space vertical :size="8">
            <n-button block @click="handleExportAll" :loading="exporting">
              <template #icon><AppIcon name="download" :size="16" /></template>
              导出所有数据 (JSON)
            </n-button>
            <n-text depth="3" style="font-size: 12px">
              导出文档、素材库、风格库和配置到单个 JSON 文件
            </n-text>
          </n-space>

          <n-space vertical :size="8">
            <n-upload
              accept=".json"
              :show-file-list="false"
              @change="handleImportFile"
              :disabled="importing"
            >
              <n-button block :loading="importing">
                <template #icon><AppIcon name="upload" :size="16" /></template>
                {{ importing ? '导入中…' : '导入数据 (JSON)' }}
              </n-button>
            </n-upload>
            <n-text depth="3" style="font-size: 12px">
              从 JSON 文件恢复数据（将覆盖同 ID 的已有数据）
            </n-text>
          </n-space>

          <n-divider />

          <n-space vertical :size="8">
            <n-popconfirm @positive-click="handleClearAllData">
              <template #trigger>
                <n-button type="error" secondary block>
                  <template #icon><AppIcon name="trash" :size="16" /></template>
                  清除所有本地数据
                </n-button>
              </template>
              确认删除所有文档、素材和风格？<br/>此操作不可恢复！建议先导出备份。
            </n-popconfirm>
          </n-space>
        </n-space>
      </n-tab-pane>
    </n-tabs>

    <template #footer>
      <n-space justify="end">
        <n-button @click="emit('update:show', false)">取消</n-button>
        <n-button type="primary" @click="handleSave" :loading="saving">
          保存设置
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { reactive, ref, watch, onMounted } from 'vue';
import {
  NModal, NTabs, NTabPane, NForm, NFormItem,
  NInput, NInputNumber, NSelect, NSlider, NSwitch,
  NRadioGroup, NRadioButton,
  NSpace, NButton, NText, NDivider, NAlert,
  NPopconfirm, NUpload, useMessage,
} from 'naive-ui';
import AppIcon from '@/components/common/AppIcon.vue';
import { useConfigStore } from '@/stores/configStore';
import { useStyleStore } from '@/stores/styleStore';
import { useThemeStore } from '@/stores/themeStore';
import { exportAllData, downloadJSON, importFromJSON } from '@/utils/exportImport';
import { db } from '@/services/storage/db';

const props = withDefaults(defineProps<{
  show: boolean;
}>(), {
  show: false,
});

const emit = defineEmits<{
  'update:show': [value: boolean];
  saved: [];
}>();

const configStore = useConfigStore();
const styleStore = useStyleStore();
const themeStore = useThemeStore();
const message = useMessage();

const activeTab = ref('ai');
const saving = ref(false);
const exporting = ref(false);
const importing = ref(false);

// 本地编辑副本
const localConfig = reactive({ ...configStore.config });

// 深度复制 generation 对象
localConfig.generation = { ...configStore.config.generation };

const styleOptions = ref<Array<{ label: string; value: string }>>([]);

watch(() => props.show, (val) => {
  if (val) {
    // 打开时同步配置和风格列表
    Object.assign(localConfig, configStore.config);
    localConfig.generation = { ...configStore.config.generation };
    styleStore.loadStyles().then(() => {
      styleOptions.value = styleStore.styleOptions;
    });
  }
});

// ========== 保存 ==========
async function handleSave() {
  saving.value = true;
  try {
    await configStore.updateConfig({ ...localConfig });
    message.success('设置已保存');
    emit('saved');
    emit('update:show', false);
  } catch (err) {
    message.error('保存失败：' + (err as Error).message);
  } finally {
    saving.value = false;
  }
}

// ========== 主题切换（即时生效） ==========
function handleThemeChange(theme: 'light' | 'dark') {
  localConfig.theme = theme;
  themeStore.setTheme(theme);
}

// ========== 导出 ==========
async function handleExportAll() {
  exporting.value = true;
  try {
    const data = await exportAllData();
    downloadJSON(data);
    message.success(`已导出 ${data.documents.length} 篇文档、${data.materials.length} 个素材、${data.styles.length} 个风格`);
  } catch (err) {
    message.error('导出失败：' + (err as Error).message);
  } finally {
    exporting.value = false;
  }
}

// ========== 导入 ==========
async function handleImportFile({ file }: { file: File }) {
  importing.value = true;
  try {
    const text = await file.text();
    await importFromJSON(text);
    message.success('数据已导入');
    // 刷新所有 store
    await Promise.all([
      styleStore.loadStyles(),
      import('@/stores/materialStore').then(m => m.useMaterialStore().loadMaterials()),
      import('@/stores/editorStore').then(m => m.useEditorStore().loadDocuments()),
    ]);
  } catch (err) {
    message.error('导入失败：' + (err as Error).message);
  } finally {
    importing.value = false;
  }
}

// ========== 清除数据 ==========
async function handleClearAllData() {
  try {
    await db.transaction('rw', [db.documents, db.materials, db.styles], async () => {
      await db.documents.clear();
      await db.materials.clear();
      await db.styles.clear();
    });
    await Promise.all([
      styleStore.loadStyles(),
      import('@/stores/materialStore').then(m => m.useMaterialStore().loadMaterials()),
      import('@/stores/editorStore').then(m => m.useEditorStore().loadDocuments()),
    ]);
    message.success('所有本地数据已清除');
  } catch (err) {
    message.error('清除失败：' + (err as Error).message);
  }
}
</script>
