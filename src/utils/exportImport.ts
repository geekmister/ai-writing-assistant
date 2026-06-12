/**
 * 数据导入/导出
 * 将整个 IndexedDB 数据导出为 JSON 文件，支持导入恢复
 */
import { db } from '@/services/storage/db';
import type { Document } from '@/types/document';
import type { Material } from '@/types/material';
import type { Style } from '@/types/style';
import type { AppConfig } from '@/types/config';

export interface ExportData {
  version: string;
  exportedAt: string;
  documents: Document[];
  materials: Material[];
  styles: Style[];
  config: AppConfig | null;
}

/** 导出所有数据 */
export async function exportAllData(): Promise<ExportData> {
  const [documents, materials, styles, configEntry] = await Promise.all([
    db.documents.toArray(),
    db.materials.toArray(),
    db.styles.toArray(),
    db.config.get('appConfig'),
  ]);

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    documents,
    materials,
    styles,
    config: configEntry?.value as AppConfig | null ?? null,
  };
}

/** 下载 JSON 文件 */
export function downloadJSON(data: ExportData, filename?: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `ai-writing-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** 从 JSON 导入恢复数据 */
export async function importFromJSON(jsonString: string): Promise<void> {
  let data: ExportData;
  try {
    data = JSON.parse(jsonString);
  } catch {
    throw new Error('JSON 格式无效');
  }

  if (!data.version) throw new Error('无效的导出文件格式');

  await db.transaction(
    'rw',
    [db.documents, db.materials, db.styles, db.config],
    async () => {
      // 去重导入：按 id 覆盖
      for (const doc of data.documents) {
        await db.documents.put(doc);
      }
      for (const mat of data.materials) {
        await db.materials.put(mat);
      }
      for (const style of data.styles) {
        await db.styles.put(style);
      }
      if (data.config) {
        await db.config.put({ key: 'appConfig', value: data.config });
      }
    }
  );
}
