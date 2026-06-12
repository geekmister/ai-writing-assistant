import type { ToneType, PersonType } from '@/types/editor';

/** AI 生成请求参数 */
export interface GenerationRequest {
  instructionKey: string;
  instructionParams?: Record<string, string>;
  selectedText: string;
  beforeText: string;
  afterText: string;
}

/** AI 生成响应（多个版本） */
export interface GenerationResult {
  versions: string[];
  selectedVersionIndex: number;
  loading: boolean;
  error: string | null;
}

/** 悬浮工具栏操作映射到 instructionKey */
export const FLOATING_ACTION_MAP: Record<string, string> = {
  rewrite: 'rewrite',
  shorten: 'shorten',
  expand: 'expand',
};

/** 语气类型到 instructionKey 的映射 */
export function toneToInstructionKey(tone: ToneType): string {
  return `tone_${tone}`;
}

/** 人称转换到 instructionKey 的映射 */
export function personToInstructionKey(
  from: PersonType,
  to: PersonType
): string {
  return `change_person_${from}_to_${to}`;
}

/** 句式转换到 instructionKey 的映射 */
export function structureToInstructionKey(type: 'split' | 'merge'): string {
  return `change_structure_${type}`;
}
