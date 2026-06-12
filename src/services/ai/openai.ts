/**
 * OpenAI API 调用封装
 * 支持 AbortController 取消请求、错误处理、多版本返回
 */
import type { AppConfig } from '@/types/config';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIChoice {
  message: { content: string };
}

interface OpenAIErrorBody {
  error?: { message: string; type: string };
}

const API_BASE = 'https://api.openai.com/v1';

/**
 * 调用 OpenAI Chat Completion API
 * @param messages 消息列表
 * @param config 用户配置（含 API Key、模型、生成参数）
 * @param signal 可选 AbortSignal 用于取消请求
 * @returns 多个版本的文本数组（对应 n 参数）
 */
export async function callOpenAI(
  messages: ChatMessage[],
  config: AppConfig,
  signal?: AbortSignal
): Promise<string[]> {
  if (!config.openaiApiKey) {
    throw new Error('请先在设置中配置 OpenAI API Key');
  }

  const response = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: config.generation.temperature,
      max_tokens: config.generation.maxTokens,
      n: config.generation.n,
      stream: false,
    }),
    signal,
  });

  if (!response.ok) {
    const errorBody: OpenAIErrorBody = await response.json().catch(() => ({}));
    const message = errorBody.error?.message || `API 请求失败 (${response.status})`;

    // 常见错误友好提示
    switch (response.status) {
      case 401:
        throw new Error('API Key 无效，请在设置中检查');
      case 429:
        throw new Error('API 请求频率过高，请稍后再试');
      case 500:
        throw new Error('OpenAI 服务器错误，请稍后再试');
      default:
        throw new Error(message);
    }
  }

  const data = await response.json();
  const contents = data.choices.map((choice: OpenAIChoice) =>
    cleanAIResponse(choice.message.content)
  );

  // 多版本兜底机制
  // 主路径: n 参数 → data.choices.length > 1
  // 兜底:   n 参数受限时 → 检查 ---VERSION--- 分隔符
  if (contents.length === 1 && contents[0].includes('---VERSION---')) {
    return contents[0]
      .split('---VERSION---')
      .map(s => s.trim())
      .filter(Boolean);
  }

  return contents;
}

/**
 * 清理 AI 输出中的无关前缀和多余空行
 */
function cleanAIResponse(text: string): string {
  return text
    .trim()
    .replace(/^(改写后|新版本|生成结果)[:：]\s*/i, '')
    .replace(/\n{3,}/g, '\n\n');
}
