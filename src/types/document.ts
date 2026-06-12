export interface Document {
  id: string;
  title: string;
  /** HTML 字符串（TipTap 输出） */
  content: string;
  /** Unix 时间戳（毫秒） */
  createdAt: number;
  /** Unix 时间戳（毫秒） */
  updatedAt: number;
}

export interface DocumentSummary {
  id: string;
  title: string;
  updatedAt: number;
  wordCount?: number;
}
