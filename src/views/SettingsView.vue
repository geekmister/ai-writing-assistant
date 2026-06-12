<script setup lang="ts">
import AppHeader from '@/components/common/AppHeader.vue';

const emit = defineEmits<{
  'open-settings': [];
}>();
</script>

<template>
  <div class="settings-view">
    <AppHeader @open-settings="emit('open-settings')" />
    <div class="settings-content">
      <h2>设置</h2>
      <p class="coming-soon">设置面板将在后续任务中实现</p>
    </div>
  </div>
</template>

<style scoped>
.settings-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--app-bg);
  color: var(--text-primary);
}
.settings-content {
  flex: 1;
  padding: 40px;
  max-width: 640px;
}
.coming-soon {
  color: var(--text-secondary);
  margin-top: 16px;
}
</style>
