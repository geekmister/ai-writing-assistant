<template>
  <div class="style-panel">
    <!-- 当前使用风格指示 -->
    <n-alert
      v-if="store.currentStyle"
      type="info"
      :bordered="false"
      closable
      class="current-style-badge"
    >
      <template #header>
        当前风格：<n-tag size="small" :bordered="false" type="info">{{ store.currentStyle.name }}</n-tag>
      </template>
      <n-text depth="3" style="font-size: 12px">{{ truncate(store.currentStyle.description, 100) }}</n-text>
    </n-alert>
    <n-alert
      v-else
      type="warning"
      :bordered="false"
      class="current-style-badge"
    >
      未选择风格，AI 将使用通用风格生成
    </n-alert>

    <n-divider style="margin: 8px 0" />

    <!-- 风格选择器 -->
    <n-select
      :value="store.currentStyleId"
      :options="store.styleOptions"
      placeholder="选择写作风格..."
      clearable
      size="small"
      @update:value="store.selectStyle"
    />

    <!-- ====== 智能推荐区 ====== -->
    <n-space :size="6" style="margin-top: 6px">
      <n-button
        size="tiny"
        secondary
        :loading="store.recommendLoading"
        :disabled="!documentContent"
        @click="handleRecommend"
      >
        <template #icon><AppIcon name="sparkles" :size="12" /></template>
        AI 智能推荐
      </n-button>
      <n-button
        v-if="store.recommendedStyleId"
        size="tiny"
        quaternary
        @click="handleApplyRecommend"
      >
        应用推荐
      </n-button>
      <n-button
        v-if="store.recommendError || store.recommendedStyleId"
        size="tiny"
        quaternary
        @click="store.clearRecommendation()"
      >
        清除
      </n-button>
    </n-space>

    <!-- 推荐结果 -->
    <n-alert
      v-if="store.recommendedStyle"
      type="success"
      :bordered="false"
      closable
      @close="store.clearRecommendation()"
      style="margin-top: 4px"
    >
      <template #header>
        推荐风格：<n-tag size="small" :bordered="false" type="success" style="cursor: pointer" @click="handleApplyRecommend">{{ store.recommendedStyle.name }}</n-tag>
      </template>
      <n-text depth="3" style="font-size: 12px">{{ truncate(store.recommendedStyle.description, 80) }}</n-text>
    </n-alert>
    <n-alert
      v-else-if="store.recommendError"
      type="warning"
      :bordered="false"
      closable
      @close="store.clearRecommendation()"
      style="margin-top: 4px"
    >
      {{ store.recommendError }}
    </n-alert>

    <n-divider style="margin: 8px 0" />

    <!-- ====== 范文上传与分析区 ====== -->
    <n-collapse>
      <n-collapse-item title="📄 上传范文提取风格" name="extract">
        <n-space vertical :size="8">
          <n-upload
            accept=".txt"
            :show-file-list="false"
            @change="handleUploadText"
            :disabled="uploadLoading"
          >
            <n-button dashed size="small" block :loading="uploadLoading">
              <template #icon><AppIcon name="upload" :size="14" /></template>
              {{ uploadLoading ? '分析中…' : '上传 .txt 范文' }}
            </n-button>
          </n-upload>

          <!-- 快速填入按钮 -->
          <n-button
            size="tiny"
            quaternary
            @click="handlePasteSample"
            :disabled="uploadLoading"
          >
            <template #icon><AppIcon name="create" :size="12" /></template>
            粘贴示例文本
          </n-button>

          <!-- 分析结果 -->
          <n-alert v-if="analysisResult" type="success" :bordered="false" closable @close="analysisResult = null">
            <template #header>本地 NLP 分析结果</template>
            <n-space vertical :size="4" style="margin-top: 4px">
              <n-text style="font-size: 12px">
                {{ analysisResult.autoDescription }}
              </n-text>
              <n-space :size="8" wrap>
                <n-tag size="tiny" :bordered="false">
                  句数 {{ analysisResult.sentenceCount }}
                </n-tag>
                <n-tag size="tiny" :bordered="false">
                  平均句长 {{ analysisResult.avgSentenceLength }} 字
                </n-tag>
                <n-tag size="tiny" :bordered="false">
                  词数 {{ analysisResult.wordCount }}
                </n-tag>
                <n-tag size="tiny" :bordered="false">
                  第一人称 {{ Math.round(analysisResult.firstPersonRatio * 100) }}%
                </n-tag>
                <n-tag
                  v-if="analysisResult.topTones.length > 0"
                  size="tiny"
                  :bordered="false"
                  type="warning"
                >
                  语气：{{ analysisResult.topTones.join('、') }}
                </n-tag>
              </n-space>
            </n-space>
            <template #footer>
              <n-space :size="8">
                <n-button size="tiny" @click="saveExtractedStyle('auto-extracted')">
                  <template #icon><AppIcon name="save" :size="12" /></template>
                  保存为基础风格
                </n-button>
                <n-button
                  size="tiny"
                  secondary
                  @click="handleAIRefine"
                  :loading="aiRefineLoading"
                >
                  <template #icon><AppIcon name="sparkles" :size="12" /></template>
                  AI 深化分析
                </n-button>
              </n-space>
            </template>
          </n-alert>

          <!-- AI 深化结果 -->
          <n-alert
            v-if="aiRefinedDesc"
            type="info"
            :bordered="false"
            closable
            @close="aiRefinedDesc = null"
          >
            <template #header>AI 深化风格描述</template>
            <n-text style="font-size: 12px">{{ aiRefinedDesc }}</n-text>
            <template #footer>
              <n-button size="tiny" @click="saveExtractedStyle('ai-refined')">
                <template #icon><AppIcon name="save" :size="12" /></template>
                保存为 AI 深化风格
              </n-button>
            </template>
          </n-alert>
        </n-space>
      </n-collapse-item>
    </n-collapse>

    <n-divider style="margin: 6px 0" />

    <!-- ====== 风格列表 ====== -->
    <LoadingSpinner v-if="store.loading" :visible="true" size="small" text="加载中…" />

    <div v-else-if="store.styles.length === 0" class="empty-state">
      <AppIcon name="brush" :size="24" color="var(--text-disabled)" />
      <p>暂无写作风格</p>
      <p class="hint">点击「新建风格」手动创建，或上传范文自动提取</p>
    </div>

    <n-list v-else :show-divider="false" class="style-list">
      <n-list-item
        v-for="style in store.styles"
        :key="style.id"
        class="style-item"
        :class="{ active: style.id === store.currentStyleId }"
      >
        <template #prefix>
          <n-radio
            :checked="style.isDefault"
            @update:checked="handleSetDefault(style.id)"
            size="small"
          />
        </template>

        <n-thing :title="style.name" title-extra>
          <template #description>
            <n-text depth="3" style="font-size: 12px; display: block; line-height: 1.5;">
              {{ truncate(style.description, 120) }}
            </n-text>
            <n-space :size="4" style="margin-top: 4px">
              <n-tag size="tiny" :bordered="false" :type="sourceTagType(style.source)">
                {{ sourceLabel(style.source) }}
              </n-tag>
              <n-tag v-if="style.isDefault" size="tiny" :bordered="false" type="success">
                默认
              </n-tag>
            </n-space>
            <!-- NLP 统计标签 -->
            <n-space v-if="style.stats" :size="4" style="margin-top: 2px">
              <n-tag v-if="style.stats.avgSentenceLength" size="tiny" :bordered="false">
                句均 {{ style.stats.avgSentenceLength }} 字
              </n-tag>
              <n-tag v-if="style.stats.firstPersonRatio" size="tiny" :bordered="false">
                人称比 {{ Math.round(style.stats.firstPersonRatio * 100) }}%
              </n-tag>
              <n-tag v-if="style.stats.toneKeywords?.length" size="tiny" :bordered="false" type="warning">
                {{ style.stats.toneKeywords.join('、') }}
              </n-tag>
            </n-space>
          </template>
        </n-thing>

        <template #suffix>
          <n-button text size="tiny" @click="openEditor(style)" style="padding: 2px">
            <template #icon><AppIcon name="create" :size="14" /></template>
          </n-button>
          <n-button text size="tiny" @click="handleDelete(style)" style="padding: 2px">
            <template #icon><AppIcon name="trash" :size="14" /></template>
          </n-button>
        </template>
      </n-list-item>
    </n-list>

    <n-divider style="margin: 6px 0" />

    <!-- 新建按钮 -->
    <n-space vertical :size="8">
      <n-button dashed block size="small" @click="openEditor()">
        <template #icon><AppIcon name="add" :size="14" /></template>
        新建风格
      </n-button>
    </n-space>

    <!-- 编辑弹窗 -->
    <StyleEditDialog
      v-model:show="dialogVisible"
      :style="editingStyle"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  NSpace, NButton, NDivider, NSelect, NAlert,
  NList, NListItem, NRadio, NThing, NText, NTag,
  NCollapse, NCollapseItem, NUpload, useMessage,
} from 'naive-ui';
import AppIcon from '@/components/common/AppIcon.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import StyleEditDialog from './StyleEditDialog.vue';
import { useStyleStore } from '@/stores/styleStore';
import type { Style } from '@/types/style';
import { analyzeChineseStyle } from '@/services/nlp/styleAnalyzer';
import type { ChineseStyleStats } from '@/services/nlp/styleAnalyzer';
import { refineStyleWithAI } from '@/services/nlp/styleRefiner';
import { useConfigStore } from '@/stores/configStore';

const store = useStyleStore();
const configStore = useConfigStore();
const message = useMessage();

const props = withDefaults(defineProps<{
  /** 当前文档内容（用于智能推荐） */
  documentContent?: string;
}>(), {
  documentContent: '',
});

const dialogVisible = ref(false);
const editingStyle = ref<Style | null>(null);

// ========== 范文分析状态 ==========
const uploadLoading = ref(false);
const analysisText = ref('');
const analysisResult = ref<ChineseStyleStats | null>(null);
const aiRefineLoading = ref(false);
const aiRefinedDesc = ref('');

const sampleText = `我站在窗前，望着远处的天空。天是灰蓝色的，像一颗被打碎的心。我对自己说，没关系，一切都会好起来的。可是风一吹，眼泪就掉下来了。

我不知道她会不会回我的消息。手机屏幕亮了又暗，暗了又亮。我打了三行字，又删掉。最后只发了两个字：晚安。然后抱着手机，等了一整夜。

有时候觉得自己像个傻子，明明知道答案，还是忍不住要去问。明明知道会受伤，还是要把心掏出来捧到对方面前。可能这就是爱吧。爱就是犯贱，爱就是明知会输还要赌上一切。`;

onMounted(() => {
  store.loadStyles();
});

// ========== 范文上传 & 分析 ==========
async function handleUploadText({ file }: { file: File }) {
  try {
    uploadLoading.value = true;
    const text = await file.text();
    analysisText.value = text;
    analysisResult.value = await analyzeChineseStyle(text);
    message.success('范文分析完成');
  } catch (err) {
    message.error('分析失败：' + (err as Error).message);
  } finally {
    uploadLoading.value = false;
  }
}

function handlePasteSample() {
  analysisText.value = sampleText;
  analyzeChineseStyle(sampleText).then(stats => {
    analysisResult.value = stats;
    message.success('示例文本分析完成');
  });
}

async function handleAIRefine() {
  if (!analysisText.value || !analysisResult.value) {
    message.warning('请先上传范文并完成本地分析');
    return;
  }
  if (!configStore.config.openaiApiKey) {
    message.warning('请先在设置中配置 OpenAI API Key');
    return;
  }
  aiRefineLoading.value = true;
  try {
    aiRefinedDesc.value = await refineStyleWithAI(analysisText.value, analysisResult.value);
    message.success('AI 深化分析完成');
  } catch (err) {
    message.error('AI 深化失败：' + (err as Error).message);
  } finally {
    aiRefineLoading.value = false;
  }
}

async function saveExtractedStyle(source: 'auto-extracted' | 'ai-refined') {
  if (!analysisResult.value) return;

  const description = source === 'ai-refined' && aiRefinedDesc.value
    ? aiRefinedDesc.value
    : analysisResult.value.autoDescription;

  try {
    await store.addStyle({
      name: '范文风格 - ' + new Date().toLocaleDateString(),
      description,
      source,
      isDefault: false,
      stats: {
        avgSentenceLength: analysisResult.value.avgSentenceLength,
        firstPersonRatio: analysisResult.value.firstPersonRatio,
        toneKeywords: analysisResult.value.topTones,
      },
    });
    message.success('风格已保存');
  } catch (err) {
    message.error('保存失败：' + (err as Error).message);
  }
}

// ========== CRUD ==========
function openEditor(style?: Style) {
  editingStyle.value = style ?? null;
  dialogVisible.value = true;
}

async function handleSave(data: Omit<Style, 'id' | 'createdAt'>) {
  try {
    if (editingStyle.value) {
      await store.updateStyle(editingStyle.value.id, data);
      message.success('风格已更新');
    } else {
      const created = await store.addStyle(data);
      if (data.isDefault) store.selectStyle(created.id);
      message.success('风格已创建');
    }
  } catch (err) {
    message.error('保存失败：' + (err as Error).message);
  }
}

async function handleDelete(style: Style) {
  try {
    await store.deleteStyle(style.id);
    message.success('已删除：' + style.name);
  } catch (err) {
    message.error('删除失败：' + (err as Error).message);
  }
}

async function handleSetDefault(id: string) {
  await store.setDefaultStyle(id);
  message.success('默认风格已更新');
}

// ========== 智能推荐 ==========
async function handleRecommend() {
  if (!props.documentContent) {
    message.warning('文档内容为空，无法推荐');
    return;
  }
  await store.recommendStyle(props.documentContent, configStore.config);
  if (store.recommendedStyle) {
    message.success(`推荐风格：${store.recommendedStyle.name}`);
  } else if (store.recommendError) {
    message.warning(store.recommendError);
  }
}

function handleApplyRecommend() {
  if (store.recommendedStyleId) {
    store.selectStyle(store.recommendedStyleId);
    message.success(`已应用风格：${store.recommendedStyle?.name}`);
  }
}

// ========== 工具 ==========
function truncate(text: string, max: number): string {
  return text.length > max ? text.substring(0, max) + '…' : text;
}

function sourceLabel(source: string): string {
  if (source === 'manual') return '手动创建';
  if (source === 'auto-extracted') return '自动提取';
  if (source === 'ai-refined') return 'AI 深化';
  return source;
}

function sourceTagType(source: string): 'default' | 'success' | 'info' {
  if (source === 'manual') return 'default';
  if (source === 'auto-extracted') return 'success';
  if (source === 'ai-refined') return 'info';
  return 'default';
}
</script>

<style scoped>
.style-panel {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.current-style-badge {
  margin-bottom: 4px;
}

.style-list {
  max-height: calc(100vh - 480px);
  overflow-y: auto;
}

.style-item {
  border-radius: 4px;
  transition: background 0.15s;
  cursor: pointer;
  padding: 4px 0;
}
.style-item:hover {
  background: var(--hover-color);
}
.style-item.active {
  background: rgba(126, 200, 160, 0.1);
  border-left: 2px solid var(--accent-color);
}
</style>

