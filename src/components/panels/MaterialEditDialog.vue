<template>
  <n-modal
    :show="show"
    @update:show="emit('update:show', $event)"
    preset="card"
    :title="isEditing ? '编辑素材' : '新建素材'"
    style="width: 600px"
    :mask-closable="false"
    :segmented="true"
  >
    <n-form :model="form" label-placement="top" size="small">
      <!-- 名称 -->
      <n-form-item label="素材名称" required>
        <n-input
          v-model:value="form.name"
          placeholder="如：舔狗深夜消息"
          maxlength="50"
          show-count
        />
      </n-form-item>

      <!-- 内容模板 -->
      <n-form-item label="内容模板" required>
        <n-input
          v-model:value="form.content"
          type="textarea"
          :rows="4"
          placeholder="支持 {{占位符}}，如：{{时间}}了，我还在想你…"
          maxlength="2000"
          show-count
        />
        <template #feedback>
          <n-text depth="3" style="font-size: 12px">
            可用 <code>{`{{变量名}}`}</code> 作为占位符，AI 会根据上下文自动填充
          </n-text>
        </template>
      </n-form-item>

      <!-- 触发类型 -->
      <n-form-item label="触发方式">
        <n-radio-group v-model:value="form.triggerType">
          <n-radio-button value="natural">自然语言描述</n-radio-button>
          <n-radio-button value="structured">结构化标签</n-radio-button>
          <n-radio-button value="both">两者都用</n-radio-button>
        </n-radio-group>
      </n-form-item>

      <!-- 自然语言条件 -->
      <n-form-item
        v-if="form.triggerType !== 'structured'"
        label="自然语言条件"
      >
        <n-input
          v-model:value="form.naturalCondition"
          placeholder="关键词以空格或逗号分隔，如：舔狗 深夜 给女神发消息"
          maxlength="200"
        />
        <template #feedback>
          <n-text depth="3" style="font-size: 12px">
            系统会检查写作上下文中是否包含所有关键词，全部命中时自动注入该素材
          </n-text>
        </template>
      </n-form-item>

      <!-- 结构化标签 -->
      <template v-if="form.triggerType !== 'natural'">
        <n-form-item label="角色标签">
          <n-dynamic-tags
            v-model:value="form.structuredTags.role"
            placeholder="输入角色后回车"
          />
        </n-form-item>
        <n-form-item label="场景标签">
          <n-dynamic-tags
            v-model:value="form.structuredTags.scene"
            placeholder="输入场景后回车"
          />
        </n-form-item>
        <n-form-item label="情绪标签">
          <n-dynamic-tags
            v-model:value="form.structuredTags.emotion"
            placeholder="输入情绪后回车"
          />
        </n-form-item>
      </template>
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
import { reactive, ref, watch } from 'vue';
import {
  NModal, NForm, NFormItem, NInput, NText,
  NRadioGroup, NRadioButton, NDynamicTags, NSpace, NButton,
} from 'naive-ui';
import type { Material } from '@/types/material';

const props = withDefaults(defineProps<{
  show: boolean;
  material?: Material | null;
}>(), {
  show: false,
  material: null,
});

const emit = defineEmits<{
  'update:show': [value: boolean];
  save: [data: Omit<Material, 'id' | 'createdAt'>];
}>();

const isEditing = ref(false);
const saving = ref(false);

const form = reactive<{
  name: string;
  content: string;
  triggerType: 'natural' | 'structured' | 'both';
  naturalCondition: string;
  structuredTags: {
    role: string[];
    scene: string[];
    emotion: string[];
  };
}>({
  name: '',
  content: '',
  triggerType: 'both',
  naturalCondition: '',
  structuredTags: { role: [], scene: [], emotion: [] },
});

// 编辑时回填
watch(() => props.material, (mat) => {
  if (mat) {
    isEditing.value = true;
    form.name = mat.name;
    form.content = mat.content;
    form.triggerType = mat.triggerType;
    form.naturalCondition = mat.naturalCondition || '';
    form.structuredTags = {
      role: mat.structuredTags?.role ?? [],
      scene: mat.structuredTags?.scene ?? [],
      emotion: mat.structuredTags?.emotion ?? [],
    };
  } else {
    isEditing.value = false;
    resetForm();
  }
}, { immediate: true });

function resetForm() {
  form.name = '';
  form.content = '';
  form.triggerType = 'both';
  form.naturalCondition = '';
  form.structuredTags = { role: [], scene: [], emotion: [] };
}

async function handleConfirm() {
  if (!form.name.trim()) return;
  if (!form.content.trim()) return;

  saving.value = true;
  try {
    emit('save', {
      name: form.name.trim(),
      content: form.content.trim(),
      triggerType: form.triggerType,
      naturalCondition: form.naturalCondition.trim() || undefined,
      structuredTags: {
        role: form.structuredTags.role.length > 0 ? form.structuredTags.role : undefined,
        scene: form.structuredTags.scene.length > 0 ? form.structuredTags.scene : undefined,
        emotion: form.structuredTags.emotion.length > 0 ? form.structuredTags.emotion : undefined,
      },
      embedding: null,
    });
    emit('update:show', false);
  } finally {
    saving.value = false;
  }
}
</script>
