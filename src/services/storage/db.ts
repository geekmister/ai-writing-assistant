import Dexie, { type Table } from 'dexie';
import { v4 as uuid } from 'uuid';
import type { Document } from '@/types/document';
import type { Material } from '@/types/material';
import type { Style } from '@/types/style';
import type { AppConfig } from '@/types/config';

export class AIWritingDB extends Dexie {
  documents!: Table<Document, string>;
  materials!: Table<Material, string>;
  styles!: Table<Style, string>;
  config!: Table<{ key: string; value: unknown }, string>;

  constructor() {
    super('AIWritingDB');

    this.version(1).stores({
      documents: 'id, title, updatedAt',
      materials: 'id, name, triggerType',
      styles: 'id, name, isDefault',
      config: 'key',
    });
  }
}

export const db = new AIWritingDB();

/** 初始默认数据 —— 仅在数据库为空时写入 */
export async function initDefaultData(): Promise<void> {
  await db.open();

  // ---- 预置素材 ----
  const materialCount = await db.materials.count();
  if (materialCount === 0) {
    await db.materials.bulkAdd([
      {
        id: uuid(),
        name: '舔狗深夜消息',
        content: '{{时间}}了，我知道你可能睡了，但还是忍不住想跟你说……今天{{某件事}}的时候，我第一个想到的就是你。晚安，希望你梦里有我。',
        triggerType: 'both',
        naturalCondition: '舔狗 深夜 发消息 女神',
        structuredTags: { role: ['舔狗'], scene: ['深夜发消息'], emotion: ['卑微'] },
        embedding: null,
        createdAt: Date.now(),
      },
      {
        id: uuid(),
        name: '绿茶回复模板',
        content: '啊，真的吗？{{对方表达好感}}……其实我也觉得你人很好，只是我现在心思都在学习/工作上，不想耽误你。',
        triggerType: 'both',
        naturalCondition: '绿茶 拒绝 暧昧',
        structuredTags: { role: ['绿茶'], scene: ['拒绝好感'], emotion: ['高冷', '无辜'] },
        embedding: null,
        createdAt: Date.now(),
      },
    ]);
  }

  // ---- 默认配置 ----
  const configCount = await db.config.count();
  if (configCount === 0) {
    await db.config.put({
      key: 'appConfig',
      value: {
        openaiApiKey: '',
        model: 'gpt-3.5-turbo',
        autoRetrieveMaterial: true,
        defaultStyleId: null,
        theme: 'dark',
        generation: { temperature: 0.7, maxTokens: 2000, n: 2 },
      } as AppConfig,
    });
  }
}

