/** 选区变化时触发的载荷 */
export interface SelectionPayload {
  selectedText: string;
  isCollapsed: boolean;
  from: number;
  to: number;
}

/** 选区上下文（包含前后文） */
export interface SelectionContext {
  selectedText: string;
  beforeText: string;
  afterText: string;
  from: number;
  to: number;
}

/** 生成指令类型 */
export type ToneType =
  | 'formal'
  | 'informal'
  | 'humorous'
  | 'serious'
  | 'gentle'
  | 'dominant'
  | 'lickdog'
  | 'green_tea';

export type PersonType = 'first' | 'third';

export interface GenerationRequest {
  instructionKey: string;
  instructionParams?: Record<string, string>;
  selectedText: string;
  beforeText: string;
  afterText: string;
}
