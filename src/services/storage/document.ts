/**
 * 文档 CRUD
 */
import { db } from './db';
import { v4 as uuid } from 'uuid';
import type { Document } from '@/types/document';
import { sanitizeHTML } from '@/utils/dompurify';

/** 获取所有文档，按更新时间倒序 */
export async function listDocuments(): Promise<Document[]> {
  return db.documents.orderBy('updatedAt').reverse().toArray();
}

/** 获取单个文档 */
export async function getDocument(id: string): Promise<Document | undefined> {
  return db.documents.get(id);
}

/** 创建文档 */
export async function createDocument(title: string): Promise<Document> {
  const now = Date.now();
  const doc: Document = {
    id: uuid(),
    title,
    content: '',
    createdAt: now,
    updatedAt: now,
  };
  await db.documents.add(doc);
  return doc;
}

/** 保存文档（更新标题 / 内容） */
export async function saveDocument(
  id: string,
  data: Partial<Pick<Document, 'title' | 'content'>>
): Promise<void> {
  const update: Partial<Document> = {
    ...data,
    updatedAt: Date.now(),
  };
  // XSS 防护：清理内容后再保存
  if (data.content) {
    update.content = sanitizeHTML(data.content);
  }
  await db.documents.update(id, update);
}

/** 删除文档 */
export async function deleteDocument(id: string): Promise<void> {
  await db.documents.delete(id);
}
