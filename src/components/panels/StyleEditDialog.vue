<template>
  <n-modal
    :show="show"
    @update:show="emit('update:show', $event)"
    preset="card"
    :title="isEditing ? '编辑风格' : '新建风格'"
    style="width: 520px"
    :mask-closable="false"
    :segmented="true"
  >
    <n-form :model="form" label-placement="top" size="small">
      <!-- 风格名称 -->
      <n-form-item label="风格名称" required>
        <n-input
          v-model:value="form.name"
          placeholder="如：海明威式简洁、都市言情风"
          maxlength="30"
          show-count
        />
      </n-form-item>

      <!-- 风格描述 -->
      <n-form-item label="风格描述" required>
        <n-input
          v-model:value="form.description"
          type="textarea"
          :rows="4"
          placeholder="描述该风格的句式特点、用词习惯、语气等。&#10;如：短句为主，多用比喻和重复，第一人称，略带自嘲和幽默感。"
          maxlength="500"
          show-count
        />
        <template #feedback>
          <n-text depth="3" style="font-size: 12px">
            这段描述会直接作为 AI 提示词注入，建议具体、细致
          </n-text>
        </template>
      </n-form-item>

      <!-- 设为默认 -->
      <n-form-item>
        <n-checkbox v-model:checked="form.isDefault">
          设为全局默认风格
        </n-checkbox>
      </n-form-item>

      <!-- 来源 & NLP 统计 -->
      <n-space v-if="statsDisplay" vertical :size="4">
        <n-tag size="tiny" :bordered="false" :type="sourceTagType">{{ sourceLabel }}</n-tag>
        <n-space :size="4" wrap>
          <n-tag v-if="statsDisplay.avgSentenceLength" size="tiny" :bordered="false">
            句均 {{ statsDisplay.avgSentenceLength }} 字
          </n-tag>
          <n-tag v-if="statsDisplay.firstPersonRatio !== undefined" size="tiny" :bordered="false">
            人称比 {{ Math.round(statsDisplay.firstPersonRatio * 100) }}%
          </n-tag>
          <n-tag v-if="statsDisplay.toneKeywords?.length" size="tiny" :bordered="false" type="warning">
            语气：{{ statsDisplay.toneKeywords.join('、') }}
          </n-tag>
        </n-space>
      </n-space>
    </n-form>

    <template #footer>
      <n-space justify="end">
        <n-button @click="emit('update:show', false)">取消</n-button>
        <n-button type="primary" @click="handleConfirm" :loading="saving">
          保存
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue';
import {
  NModal, NForm, NFormItem, NInput, NText,
  NSpace, NButton, NCheckbox, NTag,
} from 'naive-ui';
import type { Style } from '@/types/style';

const props = withDefaults(defineProps<{
  show: boolean;
  style?: Style | null;
}>(), {
  show: false,
  style: null,
});

const emit = defineEmits<{
  'update:show': [value: boolean];
  save: [data: Omit<Style, 'id' | 'createdAt'>];
}>();

const isEditing = ref(false);
const saving = ref(false);

const statsDisplay = computed(() => props.style?.stats ?? null);

const sourceLabel = computed(() => {
  if (!props.style || props.style.source === 'manual') return '手动创建';
  if (props.style.source === 'auto-extracted') return '自动提取';
  return 'AI 深化';
});

const sourceTagType = computed(() => {
  if (!props.style || props.style.source === 'manual') return 'default';
  if (props.style.source === 'auto-extracted') return 'success';
  return 'info';
});

const form = reactive({
  name: '',
  description: '',
  source: 'manual' as 'manual',
  isDefault: false,
});

watch(() => props.style, (style) => {
  if (style) {
    isEditing.value = true;
    form.name = style.name;
    form.description = style.description;
    form.source = 'manual';
    form.isDefault = style.isDefault;
  } else {
    isEditing.value = false;
    form.name = '';
    form.description = '';
    form.source = 'manual';
    form.isDefault = false;
  }
}, { immediate: true });

async function handleConfirm() {
  if (!form.name.trim() || !form.description.trim()) return;
  saving.value = true;
  try {
    emit('save', {
      name: form.name.trim(),
      description: form.description.trim(),
      source: 'manual',
      isDefault: form.isDefault,
    });
    emit('update:show', false);
  } finally {
    saving.value = false;
  }
}
</script>
