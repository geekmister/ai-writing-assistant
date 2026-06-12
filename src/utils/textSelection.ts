import type { Editor } from '@tiptap/vue-3';

/**
 * 从 TipTap 编辑器中提取选区上下文
 * @param editor 编辑器实例
 * @param charsBefore 前文截取字符数（默认 200）
 * @param charsAfter 后文截取字符数（默认 200）
 */
export function extractSelectionContext(
  editor: Editor | null,
  charsBefore = 200,
  charsAfter = 200
): { selectedText: string; beforeText: string; afterText: string; from: number; to: number } {
  if (!editor) {
    return { selectedText: '', beforeText: '', afterText: '', from: 0, to: 0 };
  }

  const { from, to } = editor.state.selection;
  const doc = editor.state.doc;
  const beforeStart = Math.max(0, from - charsBefore);
  const afterEnds = Math.min(doc.content.size, to + charsAfter);

  return {
    selectedText: doc.textBetween(from, to),
    beforeText: doc.textBetween(beforeStart, from),
    afterText: doc.textBetween(to, afterEnds),
    from,
    to,
  };
}
