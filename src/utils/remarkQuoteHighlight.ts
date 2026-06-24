import { visit } from 'unist-util-visit';

const QUOTE_RE = /("[^"]*"|"[^"]*")/g;

export function remarkQuoteHighlight() {
  return (tree: any) => {
    visit(tree, 'text', (node: any, index: number | undefined, parent: any) => {
      if (!parent || index == null) return;
      if (parent.type === 'heading') return;

      const value: string = node.value;
      QUOTE_RE.lastIndex = 0;
      if (!QUOTE_RE.test(value)) return;
      QUOTE_RE.lastIndex = 0;

      const children: any[] = [];
      let last = 0;
      let m: RegExpExecArray | null;

      while ((m = QUOTE_RE.exec(value)) !== null) {
        if (m.index > last) {
          children.push({ type: 'text', value: value.slice(last, m.index) });
        }
        children.push({
          type: 'emphasis',
          data: {
            hName: 'em',
            hProperties: { className: ['book-quote'] },
          },
          children: [{ type: 'text', value: m[0] }],
        });
        last = m.index + m[0].length;
      }

      if (last < value.length) {
        children.push({ type: 'text', value: value.slice(last) });
      }

      parent.children.splice(index, 1, ...children);
      return index + children.length;
    });
  };
}
