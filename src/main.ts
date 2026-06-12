import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { initDefaultData } from '@/services/storage/db';
import { ensureNLPInit } from '@/services/nlp/init';
import { useConfigStore } from '@/stores/configStore';
import { useThemeStore } from '@/stores/themeStore';
import '@/assets/styles/global.css';

async function bootstrap() {
  const app = createApp(App);
  const pinia = createPinia();
  app.use(pinia);
  app.use(router);

  // 预初始化
  await Promise.all([
    initDefaultData().catch(console.warn),
    ensureNLPInit().catch(console.warn),
    useConfigStore().loadConfig(),
  ]);

  // 加载主题偏好（必须在 mount 之前）
  await useThemeStore().initTheme();

  app.mount('#app');
}

bootstrap();
