/**
 * AI 提示词模板和指令映射表
 */

export const SYSTEM_PROMPT = `你是一位专业的写作助手，擅长根据用户的风格要求和素材库规则进行文本改写。
你需要严格遵守以下规则：
1. 忠实地按照指令改写文本，保持原意不偏离。
2. 根据给定的写作风格调整句式、用词和语气。
3. 将素材库中的内容自然地融入改写结果。
4. 只输出改写后的文本，不添加任何解释、评价或元信息。`;

export const REWRITE_PROMPT = `## 上下文
前文：
{{beforeText}}

【需要改写的文本】：
{{selectedText}}

后文：
{{afterText}}

## 写作风格要求
{{style}}

## 素材库参考内容
{{materials}}

## 改写指令
{{instruction}}

## 输出要求
- 请严格按照以上要求改写【需要改写的文本】。
- 保持原意不变。
- 只输出改写后的内容，不要添加前缀、后缀或任何解释。
- 如果生成了多个版本，请用 "---VERSION---" 分隔每个版本。`;

/**
 * 指令映射表
 * key 对应 FloatingToolbar / generationStore 中传人的 instructionKey
 */
export const INSTRUCTION_MAP: Record<string, string> = {
  // ---- 基础改写 ----
  rewrite: '请完全改写以上文本，改变表达方式但保持原意不变。使用不同的句式、词汇和修辞手法。',

  // ---- 长度微调 ----
  shorten: '请将以上文本缩短到原来的一半以内。删除冗余描述和修饰，只保留最核心的信息和情感。',
  expand: '请将以上文本扩展至原来的1.5-2倍长度。增加细节描写、心理活动、环境描写或情感递进。',

  // ---- 语气微调 ----
  tone_formal: '请将文本的语气改为正式、客观、专业的风格。使用规范的书面语，避免口语化表达、网络用语和随意语气。',
  tone_informal: '请将文本的语气改为口语化、轻松亲切的风格。多使用日常用语和自然的对话表达。',
  tone_humorous: '请为文本增加幽默感。可以使用俏皮话、夸张、反差、自嘲等手法让表达更有趣。',
  tone_serious: '请将文本改为严肃、庄重的语气。避免任何轻浮或随意的词汇，保持沉着冷静的语调。',
  tone_gentle: '请将文本改为温柔、体贴的语气。多用关怀和安抚的词汇，让读者感到温暖和被理解。',
  tone_dominant: '请将文本改为霸道、强势的语气。使用命令式句式和绝对化表达，展现不容置疑的态度。',
  tone_lickdog: '请将文本改为舔狗风格的表达：卑微、讨好、自我贬低、反复强调对方的完美和自己的不配。',
  tone_green_tea: '请将文本改为绿茶风格的表达：表面温柔无辜、实则暗示和挑拨、以退为进、自我中心。',

  // ---- 人称转换 ----
  change_person_first_to_third: '请将文本从第一人称改为第三人称叙述。把"我"改为"他/她"，调整所有相关的动词和代词。',
  change_person_third_to_first: '请将文本从第三人称改为第一人称叙述。把"他/她"改为"我"，调整所有相关的动词和代词。',

  // ---- 句式转换 ----
  change_structure_split: '请将文本中的长句拆解为短句。每个句子尽量控制在15字以内，增强节奏感和可读性。',
  change_structure_merge: '请将文本中的短句合并为流畅的长句。使用连接词和从句使表达更加连贯。',
};

/**
 * 根据 instructionKey 获取最终指令文本
 * 支持动态参数替换（如 change_person 需要传入 from/to）
 */
export function getInstruction(
  key: string,
  params?: Record<string, string>
): string {
  const template = INSTRUCTION_MAP[key];
  if (!template) return key;

  if (!params) return template;

  let result = template;
  for (const [k, v] of Object.entries(params)) {
    result = result.replace(`{{${k}}}`, v);
  }
  return result;
}

/**
 * 风格 AI 深化分析的提示词
 */
export function getStyleRefinePrompt(
  text: string,
  localStats: {
    sentenceCount: number;
    avgSentenceLength: number;
    firstPersonRatio: number;
    topTones: string[];
  }
): string {
  return `你是一位文学编辑。分析以下文本的写作风格，生成一段简洁的描述（50字以内），包含句式长短、人称使用、语气、修辞特点。并给出3个关键词标签。

原文（前 500 字）：
${text.substring(0, 500)}

本地 NLP 统计：
- 句子数：${localStats.sentenceCount}
- 平均句长：${localStats.avgSentenceLength} 字符
- 第一人称比例：${Math.round(localStats.firstPersonRatio * 100)}%
- 语气倾向：${localStats.topTones.join('、') || '无明显倾向'}

只输出风格描述文本，不要加前缀。`;
}

/**
 * 风格智能推荐的提示词
 */
export function getStyleRecommendPrompt(
  documentSnippet: string,
  styleList: { name: string; description: string }[]
): string {
  const styleText = styleList.map(s => `- ${s.name}：${s.description}`).join('\n');
  return `根据以下文档片段，从用户风格库中推荐最匹配的风格。

文档片段：
${documentSnippet.substring(0, 500)}

用户风格库：
${styleText}

请只返回最匹配的风格名称（精确匹配上面的名称），不要加任何解释。如果都不匹配，返回"无"。`;
}
