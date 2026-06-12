export interface Material {
  id: string;
  /** 素材名称，如"舔狗深夜消息" */
  name: string;
  /** 模板内容，支持占位符 {{var}} 及简单条件逻辑 */
  content: string;
  /** 触发方式 */
  triggerType: 'natural' | 'structured' | 'both';
  /** 自然语言描述，如"当用户写舔狗给女神发消息时" */
  naturalCondition?: string;
  /** 结构化标签 */
  structuredTags?: {
    role?: string[];
    scene?: string[];
    emotion?: string[];
  };
  /** 预留 —— MVP 阶段留空 */
  embedding?: number[] | null;
  createdAt: number;
}
