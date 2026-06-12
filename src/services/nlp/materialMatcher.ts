/**
 * 素材自动检索增强
 * 基于 jieba-wasm 分词 + 关键词匹配
 */
import { cut } from 'jieba-wasm';
import { ensureNLPInit } from './init';
import type { Material } from '@/types/material';

export interface MatchResult {
  material: Material;
  /** 匹配得分（命中关键词数，越高越相关） */
  score: number;
  /** 匹配方式 */
  matchType: 'natural' | 'structured' | 'both';
}

/**
 * 使用 jieba 分词增强的关键词匹配
 * 比简单的 includes 更加准确
 */
export async function retrieveByTokenizedKeywords(
  contextText: string,
  materials: Material[]
): Promise<MatchResult[]> {
  await ensureNLPInit();

  const results: MatchResult[] = [];
  const tokens = new Set(cut(contextText, true) as string[]);

  for (const m of materials) {
    let score = 0;
    let matchType: 'natural' | 'structured' | 'both' = 'natural';
    let matchedNatural = false;
    let matchedStructured = false;

    // ---- 自然语言条件：分词后匹配 ----
    if (m.naturalCondition) {
      const condTokens = cut(m.naturalCondition, true) as string[];
      const matchedCount = condTokens.filter(t => tokens.has(t)).length;
      const requiredCount = condTokens.length;

      // 全部命中才算匹配
      if (requiredCount > 0 && matchedCount >= requiredCount) {
        matchedNatural = true;
        score += matchedCount;
      }
    }

    // ---- 结构化标签：直接 tokens 匹配 ----
    if (m.structuredTags) {
      const allTagValues = [
        ...(m.structuredTags.role ?? []),
        ...(m.structuredTags.scene ?? []),
        ...(m.structuredTags.emotion ?? []),
      ];
      const tagMatchCount = allTagValues.filter(tag =>
        tokens.has(tag) || contextText.includes(tag)
      ).length;
      if (tagMatchCount > 0) {
        matchedStructured = true;
        score += tagMatchCount * 2; // 结构化标签权重更高
      }
    }

    if (matchedNatural && matchedStructured) {
      matchType = 'both';
    } else if (matchedStructured) {
      matchType = 'structured';
    }

    if (matchedNatural || matchedStructured) {
      results.push({ material: m, score, matchType });
    }
  }

  // 按得分降序排列
  return results.sort((a, b) => b.score - a.score);
}

/**
 * 纯关键词匹配（备选，不依赖 jieba）
 * 用于检索已在内存中的素材
 */
export function retrieveByKeywordsSimple(
  lowerText: string,
  materials: Material[]
): Material[] {
  return materials.filter(m => {
    if (m.naturalCondition) {
      const keywords = m.naturalCondition.split(/[,，\s]+/).filter(Boolean);
      if (keywords.every(kw => lowerText.includes(kw.toLowerCase()))) return true;
    }
    if (m.structuredTags) {
      const tagValues = Object.values(m.structuredTags).flat().filter(Boolean) as string[];
      if (tagValues.some(tag => lowerText.includes(tag.toLowerCase()))) return true;
    }
    return false;
  });
}
