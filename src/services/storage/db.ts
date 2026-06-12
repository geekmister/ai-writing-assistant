// Dexie 数据库存根 — 后续任务（任务 4）将完整实现
import Dexie from 'dexie';

export class AIWritingDB extends Dexie {
  documents!: Dexie.Table<any, string>;
  materials!: Dexie.Table<any, string>;
  styles!: Dexie.Table<any, string>;
  config!: Dexie.Table<{ key: string; value: unknown }, string>;

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

export async function initDefaultData(): Promise<void> {
  // 后续任务 4 实现完整初始化
  // MVP 阶段仅确保数据库表已就绪
  await db.open();
}
