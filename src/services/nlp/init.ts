/**
 * jieba-wasm 初始化（全局单例）
 * 在应用启动时调用 ensureNLPInit()，确保 WASM 模块只加载一次
 */
import init from 'jieba-wasm';

let initialized = false;

export async function ensureNLPInit(): Promise<void> {
  if (!initialized) {
    await init();
    initialized = true;
  }
}

export function isNLPReady(): boolean {
  return initialized;
}
