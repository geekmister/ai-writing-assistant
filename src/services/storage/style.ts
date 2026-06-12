/**
 * 风格 CRUD
 */
import { db } from './db';
import { v4 as uuid } from 'uuid';
import type { Style } from '@/types/style';

/** 获取所有风格 */
export async function listStyles(): Promise<Style[]> {
  return db.styles.toArray();
}

/** 添加风格 */
export async function addStyle(data: Omit<Style, 'id' | 'createdAt'>): Promise<Style> {
  const style: Style = { id: uuid(), ...data, createdAt: Date.now() };
  await db.styles.add(style);
  return style;
}

/** 更新风格 */
export async function updateStyle(id: string, data: Partial<Style>): Promise<void> {
  await db.styles.update(id, data);
}

/** 删除风格 */
export async function deleteStyle(id: string): Promise<void> {
  await db.styles.delete(id);
}

/** 设置默认风格（事务：将所有风格 isDefault 置零，再设置目标） */
export async function setDefaultStyle(id: string): Promise<void> {
  await db.transaction('rw', db.styles, async () => {
    const all = await db.styles.toArray();
    for (const s of all) {
      if (s.isDefault && s.id !== id) {
        await db.styles.update(s.id, { isDefault: false });
      }
    }
    await db.styles.update(id, { isDefault: true });
  });
}
