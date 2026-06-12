/**
 * 上下文构建器
 * 将风格描述、素材、选区上下文合并为最终 prompt
 */
import { REWRITE_PROMPT, SYSTEM_PROMPT, getInstruction } from './prompts';
import { useMaterialStore } from '@/stores/materialStore';
import { useStyleStore } from '@/stores/styleStore';
import { useConfigStore } from '@/stores/configStore';

export interface BuildPromptParams {
  /** 选中的文本 */
  selectedText: string;
  /** 前文 */
  beforeText: string;
  /** 后文 */
  afterText: string;
  /** 指令 key（如 'rewrite'、'shorten'、'tone_formal'） */
  instructionKey: string;
  /** 指令的动态参数（如人称转换的 from/to） */
  instructionParams?: Record<string, string>;
}

/** 系统级角色设定（发给 API 的第一条消息） */
export function getSystemPrompt(): string {
  return SYSTEM_PROMPT;
}

/** 构建最终的 messages 数组（system + user） */
export function buildMessages(params: BuildPromptParams) {
  return [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    { role: 'user' as const, content: buildRewritePrompt(params) },
  ];
}

/**
 * 构建完整的改写提示词
 * 包含：上下文 → 风格描述 → 素材注入 → 改写指令
 */
export function buildRewritePrompt(params: BuildPromptParams): string {
  const styleStore = useStyleStore();
  const materialStore = useMaterialStore();
  const configStore = useConfigStore();

  // 1. 获取风格描述
  const effectiveStyleId =
    styleStore.currentStyleId ?? configStore.config.defaultStyleId;
  const styleDesc =
    styleStore.getEffectiveStyleDescription(effectiveStyleId);

  // 2. 获取素材（手动选中 + 自动检索混合）
  const contextText = `${params.beforeText}\n${params.selectedText}\n${params.afterText}`;
  const allMaterials = collectMaterials(materialStore, contextText);

  const materialsText =
    allMaterials.length > 0
      ? allMaterials.map(m => `- 【${m.name}】${m.content}`).join('\n')
      : '无';

  // 3. 获取指令
  const instruction = getInstruction(
    params.instructionKey,
    params.instructionParams
  );

  // 4. 替换模板
  return REWRITE_PROMPT.replace('{{beforeText}}', params.beforeText || '(无)')
    .replace('{{selectedText}}', params.selectedText)
    .replace('{{afterText}}', params.afterText || '(无)')
    .replace('{{style}}', styleDesc)
    .replace('{{materials}}', materialsText)
    .replace('{{instruction}}', instruction);
}

/**
 * 收集素材（手动选中 + 自动检索合并去重）
 */
function collectMaterials(
  materialStore: ReturnType<typeof useMaterialStore>,
  contextText: string
) {
  const configStore = useConfigStore();
  const results: Array<{ id: string; name: string; content: string }> = [];

  // 手动选中的素材优先加入
  if (materialStore.activeMaterial) {
    results.push(materialStore.activeMaterial);
  }

  // 自动检索（仅当开关开启）
  if (configStore.config.autoRetrieveMaterial) {
    const autoMatched = materialStore.retrieveByKeywords(contextText);
    for (const m of autoMatched) {
      if (!results.find(r => r.id === m.id)) {
        results.push(m);
      }
    }
  }

  return results;
}
