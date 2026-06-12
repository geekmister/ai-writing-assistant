<template>
  <div v-if="visible" class="loading-spinner" :class="[size]">
    <AppIcon name="sparkles" :size="iconSize" spin />
    <span v-if="text" class="loading-text">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AppIcon from '@/components/common/AppIcon.vue';

const props = withDefaults(defineProps<{
  visible?: boolean;
  text?: string;
  size?: 'small' | 'medium' | 'large';
  overlay?: boolean;
}>(), {
  visible: false,
  text: '',
  size: 'medium',
  overlay: false,
});

const iconSize = computed(() => {
  if (props.size === 'small') return 16;
  if (props.size === 'large') return 32;
  return 22;
});
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: var(--accent-color);
}
.loading-spinner.small { padding: 8px; }
.loading-spinner.large { padding: 24px; }
.loading-text {
  font-size: 13px;
  color: var(--text-secondary);
}
</style>
