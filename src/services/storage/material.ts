/**
 * 素材 CRUD
 */
import { db } from './db';
import { v4 as uuid } from 'uuid';
import type { Material } from '@/types/material';

/** 获取所有素材 */
export async function listMaterials(): Promise<Material[]> {
  return db.materials.toArray();
}

/** 添加素材 */
export async function addMaterial(data: Omit<Material, 'id' | 'createdAt'>): Promise<Material> {
  const material: Material = {
    id: uuid(),
    ...data,
    embedding: data.embedding ?? null,
    createdAt: Date.now(),
  };
  await db.materials.add(material);
  return material;
}

/** 更新素材 */
export async function updateMaterial(id: string, data: Partial<Material>): Promise<void> {
  await db.materials.update(id, data);
}

/** 删除素材 */
export async function deleteMaterial(id: string): Promise<void> {
  await db.materials.delete(id);
}
