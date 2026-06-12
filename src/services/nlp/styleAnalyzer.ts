/**
 * 中文风格分析器
 * 基于 jieba-wasm 分词 + 正则规则
 * 用于范文上传 → 自动提取风格标签
 */
import { cut } from 'jieba-wasm';
import { ensureNLPInit } from './init';

const SENTENCE_SEP = /[。！？；\n]+/;

// 第一/第三人称代词集合
const FIRST_PERSON_SET = new Set([
  '我', '我们', '咱', '咱们', '自己', '本人', '老子', '老娘', '在下',
]);
const THIRD_PERSON_SET = new Set([
  '他', '她', '它', '他们', '她们', '它们', '其', '某人',
]);

// 语气关键词词典
const TONE_KEYWORDS: Record<string, string[]> = {
  formal:    ['因此', '故而', '综上所述', '依据', '根据', '严格', '遵循', '规范', '鉴于', '故此'],
  informal:  ['哈哈', '嘿嘿', '嘛', '啦', '呀', '哦', '嗯', '吧', '呗', '嗯嗯', '哈', '哟'],
  humorous:  ['笑死', '绝了', '离谱', '翻车', '社死', '真香', '栓Q', '笑喷', '笑哭'],
  serious:   ['严正', '郑重', '声明', '警告', '必须', '不得', '禁止', '坚决'],
  gentle:    ['温柔', '轻轻', '慢慢', '暖暖', '静静', '乖', '心疼', '好好', '没事'],
  dominant:  ['给老子', '必须', '不准', '绝对', '命令', '服从', '我说了算', '给劳资'],
  lickdog:   ['女神', '卑微', '配不上', '你不配', '舔狗', '好难受'],
  green_tea: ['哎呀', '不好意思', '不是故意的', '不要误会', '其实我', '你人很好'],
};

export interface ChineseStyleStats {
  sentenceCount: number;
  avgSentenceLength: number;
  wordCount: number;
  firstPersonRatio: number;
  thirdPersonRatio: number;
  dominantPerson: 'first' | 'third' | 'neutral';
  topTones: string[];
  adjectiveRatio: number;
  /** 自动生成的简短描述 */
  autoDescription: string;
}

/**
 * 分析中文文本的本地风格统计
 */
export async function analyzeChineseStyle(text: string): Promise<ChineseStyleStats> {
  await ensureNLPInit();

  // 1. 句子分割（正则）
  const sentences = text
    .split(SENTENCE_SEP)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // 2. jieba 分词
  const words = cut(text, true) as string[];

  // 3. 平均句长
  const avgSentenceLength =
    sentences.length > 0
      ? sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length
      : 0;

  // 4. 人称检测
  const firstCount = words.filter(w => FIRST_PERSON_SET.has(w)).length;
  const thirdCount = words.filter(w => THIRD_PERSON_SET.has(w)).length;
  const firstPersonRatio = words.length > 0 ? firstCount / words.length : 0;
  const thirdPersonRatio = words.length > 0 ? thirdCount / words.length : 0;
  const dominantPerson: 'first' | 'third' | 'neutral' =
    firstCount > thirdCount * 2
      ? 'first'
      : thirdCount > firstCount * 2
        ? 'third'
        : 'neutral';

  // 5. 语气检测
  const toneScores = Object.entries(TONE_KEYWORDS).map(([tone, kws]) => ({
    tone,
    score: kws.filter(kw => text.includes(kw)).length,
  }));
  const topTones = toneScores
    .filter(t => t.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(t => t.tone);

  // 6. 形容词比例（粗略：以"的"结尾的双字词）
  const adjCount = words.filter(w => w.length === 2 && w.endsWith('的')).length;
  const adjectiveRatio = words.length > 0 ? adjCount / words.length : 0;

  // 7. 自动生成描述
  const autoDescription = generateStyleDescription({
    avgSentenceLength,
    firstPersonRatio,
    topTones,
    dominantPerson,
  });

  return {
    sentenceCount: sentences.length,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    wordCount: words.length,
    firstPersonRatio: Math.round(firstPersonRatio * 100) / 100,
    thirdPersonRatio: Math.round(thirdPersonRatio * 100) / 100,
    dominantPerson,
    topTones,
    adjectiveRatio: Math.round(adjectiveRatio * 100) / 100,
    autoDescription,
  };
}

/**
 * 基于统计结果生成简短风格描述
 */
function generateStyleDescription(stats: {
  avgSentenceLength: number;
  firstPersonRatio: number;
  dominantPerson: string;
  topTones: string[];
}): string {
  const parts: string[] = [];

  // 句长特征
  if (stats.avgSentenceLength < 15) parts.push('极短句');
  else if (stats.avgSentenceLength < 25) parts.push('短句为主');
  else if (stats.avgSentenceLength < 40) parts.push('中等句长');
  else parts.push('长句为主');

  // 人称特征
  if (stats.dominantPerson === 'first') parts.push('第一人称');
  else if (stats.dominantPerson === 'third') parts.push('第三人称');
  else parts.push('混合人称');

  // 形容词使用
  // 语气特征
  if (stats.topTones.length > 0) {
    parts.push(`语气倾向：${stats.topTones.join('、')}`);
  }

  return parts.join('，');
}

/**
 * 将统计结果映射为 Style.stats 格式
 */
export function statsToStyleStats(stats: ChineseStyleStats): {
  avgSentenceLength: number;
  firstPersonRatio: number;
  toneKeywords: string[];
} {
  return {
    avgSentenceLength: stats.avgSentenceLength,
    firstPersonRatio: stats.firstPersonRatio,
    toneKeywords: stats.topTones,
  };
}
