<template>
  <n-icon :size="size" :color="color" :class="{ 'icon-spin': spin }">
    <component :is="iconComponent" />
  </n-icon>
</template>

<script setup lang="ts">
import { shallowRef, watch } from 'vue';

const props = withDefaults(defineProps<{
  name: IconName;
  size?: number;
  color?: string;
  spin?: boolean;
}>(), {
  size: 18,
});

type IconName =
  | 'add' | 'trash' | 'create' | 'settings'
  | 'moon' | 'sunny' | 'refresh' | 'close'
  | 'checkmark' | 'copy' | 'download' | 'upload'
  | 'search' | 'folder' | 'document' | 'expand'
  | 'contract' | 'arrow-forward' | 'arrow-back'
  | 'swap' | 'sparkles' | 'bookmark' | 'brush'
  | 'chevron-down' | 'chevron-up' | 'more' | 'save';

const componentMap: Record<IconName, () => Promise<any>> = {
  add:              () => import('@vicons/ionicons5/AddOutline'),
  trash:            () => import('@vicons/ionicons5/TrashOutline'),
  create:           () => import('@vicons/ionicons5/CreateOutline'),
  settings:         () => import('@vicons/ionicons5/SettingsOutline'),
  moon:             () => import('@vicons/ionicons5/MoonOutline'),
  sunny:            () => import('@vicons/ionicons5/SunnyOutline'),
  refresh:          () => import('@vicons/ionicons5/RefreshOutline'),
  close:            () => import('@vicons/ionicons5/CloseOutline'),
  checkmark:        () => import('@vicons/ionicons5/CheckmarkOutline'),
  copy:             () => import('@vicons/ionicons5/CopyOutline'),
  download:         () => import('@vicons/ionicons5/DownloadOutline'),
  upload:           () => import('@vicons/ionicons5/CloudUploadOutline'),
  search:           () => import('@vicons/ionicons5/SearchOutline'),
  folder:           () => import('@vicons/ionicons5/FolderOutline'),
  document:         () => import('@vicons/ionicons5/DocumentTextOutline'),
  expand:           () => import('@vicons/ionicons5/ExpandOutline'),
  contract:         () => import('@vicons/ionicons5/ContractOutline'),
  'arrow-forward':  () => import('@vicons/ionicons5/ArrowForwardOutline'),
  'arrow-back':     () => import('@vicons/ionicons5/ArrowBackOutline'),
  swap:             () => import('@vicons/ionicons5/SwapHorizontalOutline'),
  sparkles:         () => import('@vicons/ionicons5/SparklesOutline'),
  bookmark:         () => import('@vicons/ionicons5/BookmarkOutline'),
  brush:            () => import('@vicons/ionicons5/BrushOutline'),
  'chevron-down':   () => import('@vicons/ionicons5/ChevronDownOutline'),
  'chevron-up':     () => import('@vicons/ionicons5/ChevronUpOutline'),
  more:             () => import('@vicons/ionicons5/EllipsisHorizontalOutline'),
  save:             () => import('@vicons/ionicons5/SaveOutline'),
};

const iconComponent = shallowRef<any>(null);

watch(() => props.name, (name) => {
  const loader = componentMap[name];
  if (loader) {
    loader().then(mod => { iconComponent.value = mod.default; });
  }
}, { immediate: true });
</script>

<style scoped>
.icon-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
