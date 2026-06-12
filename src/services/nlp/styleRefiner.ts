/**
 * 风格 AI 深化分析
 * 将本地 NLP 统计结果 + 范文发送给 OpenAI，返回更细腻的描述
 */
import { callOpenAI } from '@/services/ai/openai';
import { useConfigStore } from '@/stores/configStore';
import type { ChineseStyleStats } from './styleAnalyzer';

/**
 * 调用 AI 深化风格分析
 * @param text 范文原文（前 500 字）
 * @param localStats 本地 NLP 统计结果
 * @returns AI 生成的风格描述文本
 */
export async function refineStyleWithAI(
  text: string,
  localStats: ChineseStyleStats
): Promise<string> {
  const config = useConfigStore().config;
  if (!config.openaiApiKey) throw new Error('请先配置 OpenAI API Key');

  const prompt = `你是一位文学编辑。分析以下文本的写作风格，生成一段简洁的描述（50字以内），包含句式长短、人称使用、语气、修辞特点。并给出3个关键词标签。

原文（前 500 字）：
${text.substring(0, 500)}

本地 NLP 统计：
- 句子数：${localStats.sentenceCount}
- 平均句长：${localStats.avgSentenceLength} 字符
- 第一人称比例：${Math.round(localStats.firstPersonRatio * 100)}%
- 语气倾向：${localStats.topTones.join('、') || '无明显倾向'}

只输出风格描述文本，不要加前缀。`;

  const messages = [{ role: 'user' as const, content: prompt }];
  const results = await callOpenAI(messages, {
    ...config,
    generation: { temperature: 0.5, maxTokens: 200, n: 1 },
  });
  return results[0];
}
