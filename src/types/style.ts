export interface Style {
  id: string;
  /** 风格名称，如"海明威式简洁" */
  name: string;
  /** 风格描述文本（用于提示词） */
  description: string;
  /** 是否为全局默认风格 */
  isDefault: boolean;
  source: 'manual' | 'auto-extracted' | 'ai-refined';
  /** 本地 NLP 统计（可选） */
  stats?: {
    avgSentenceLength?: number;
    firstPersonRatio?: number;
    toneKeywords?: string[];
  };
  createdAt: number;
}

export interface StyleCreatePayload {
  name: string;
  description: string;
  source: 'manual' | 'auto-extracted' | 'ai-refined';
  isDefault?: boolean;
}
