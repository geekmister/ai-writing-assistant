import type { GlobalThemeOverrides } from 'naive-ui';

/** 亮色主题 */
export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#18a058',
    primaryColorHover: '#36ad6a',
    borderRadius: '4px',
  },
  Button: {
    textColor: '#FFFFFF',
  },
};

/** 暗色工具台风格主题 — 推荐配色 */
export const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    // 主色：暖调青绿，暗色背景下不刺眼
    primaryColor: '#7ec8a0',
    primaryColorHover: '#98d6b5',
    primaryColorPressed: '#5ba880',
    primaryColorSuppl: '#7ec8a0',
    borderRadius: '4px',
    fontSize: '14px',
    // 背景层次
    bodyColor: '#1a1a2e',
    cardColor: '#111827',
    modalColor: '#111827',
    popoverColor: '#111827',
    tableColor: '#111827',
    // 文字颜色
    textColor1: '#e2e8f0',
    textColor2: '#94a3b8',
    textColor3: '#64748b',
    // 边框
    borderColor: '#1e293b',
    dividerColor: '#1e293b',
    // 悬浮
    hoverColor: 'rgba(126, 200, 160, 0.08)',
  },
  Button: {
    textColor: '#e2e8f0',
    textColorHover: '#ffffff',
  },
  Input: {
    color: '#0f3460',
    colorFocus: '#0f3460',
  },
  Card: {
    color: '#111827',
    borderColor: '#1e293b',
  },
};
