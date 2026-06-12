import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { initDefaultData } from '@/services/storage/db';
import { ensureNLPInit } from '@/services/nlp/init';
import '@/assets/styles/global.css';

async function bootstrap() {
  const app = createApp(App);
  const pinia = createPinia();
  app.use(pinia);
  app.use(router);

  // 预初始化：数据库默认数据 + NLP 引擎（WASM 单次加载）
  await Promise.all([
    initDefaultData().catch(console.warn),
    ensureNLPInit().catch(console.warn),
  ]);

  app.mount('#app');
}

bootstrap();
