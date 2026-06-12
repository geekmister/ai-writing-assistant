export interface AppConfig {
  openaiApiKey: string;
  model: 'gpt-3.5-turbo' | 'gpt-4';
  /** 是否自动检索素材 */
  autoRetrieveMaterial: boolean;
  /** 全局默认风格 ID */
  defaultStyleId: string | null;
  /** 当前主题 */
  theme: 'light' | 'dark';
  /** 生成参数 */
  generation: {
    /** 0.0 ~ 1.0 */
    temperature: number;
    /** 默认 2000 */
    maxTokens: number;
    /** 生成版本数量 1~3 */
    n: number;
  };
}
