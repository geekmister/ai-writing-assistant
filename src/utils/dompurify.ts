import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'del',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'hr',
  'a', 'span', 'pre', 'code',
];

const ALLOWED_ATTR = ['href', 'target', 'rel', 'class'];

function createPurifyConfig() {
  return {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  };
}

/**
 * 清理 HTML，防止 XSS 攻击
 * 用于保存 TipTap 编辑器内容时
 */
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, createPurifyConfig());
}
