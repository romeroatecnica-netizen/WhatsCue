export type InlineNode =
  | { type: 'text'; value: string }
  | { type: 'bold'; children: InlineNode[] }
  | { type: 'italic'; children: InlineNode[] }
  | { type: 'strike'; children: InlineNode[] }
  | { type: 'mono'; value: string }
  | { type: 'link'; value: string };

export type BlockNode =
  | { type: 'paragraph'; children: InlineNode[] }
  | { type: 'codeblock'; value: string }
  | { type: 'blockquote'; children: InlineNode[] }
  | { type: 'bullet'; items: InlineNode[][] }
  | { type: 'numbered'; items: Array<{ index: string; children: InlineNode[] }> }
  | { type: 'spacer' };

const URL_REGEX = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/i;

function splitLinks(text: string): InlineNode[] {
  const parts: InlineNode[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    const match = remaining.match(URL_REGEX);
    if (!match || match.index === undefined) {
      parts.push({ type: 'text', value: remaining });
      break;
    }
    if (match.index > 0) {
      parts.push({ type: 'text', value: remaining.slice(0, match.index) });
    }
    parts.push({ type: 'link', value: match[0] });
    remaining = remaining.slice(match.index + match[0].length);
  }
  return parts;
}

export function parseWhatsAppInline(input: string, depth = 0): InlineNode[] {
  if (!input) return [];
  if (depth > 4) return splitLinks(input);

  const nodes: InlineNode[] = [];
  let i = 0;

  const pushPlain = (str: string) => {
    if (!str) return;
    nodes.push(...splitLinks(str));
  };

  let buffer = '';

  while (i < input.length) {
    // Triple backtick inline fallback or single backtick inline monospace
    if (input.startsWith('```', i)) {
      const end = input.indexOf('```', i + 3);
      if (end !== -1 && end > i + 3) {
        pushPlain(buffer);
        buffer = '';
        nodes.push({ type: 'mono', value: input.slice(i + 3, end) });
        i = end + 3;
        continue;
      }
    }

    if (input[i] === '`') {
      const end = input.indexOf('`', i + 1);
      if (end !== -1 && end > i + 1 && !input.slice(i + 1, end).includes('\n')) {
        pushPlain(buffer);
        buffer = '';
        nodes.push({ type: 'mono', value: input.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    const ch = input[i];
    if (ch === '*' || ch === '_' || ch === '~') {
      const prevChar = i > 0 ? input[i - 1] : ' ';
      const nextChar = i + 1 < input.length ? input[i + 1] : '';
      const validOpen = !/[A-Za-z0-9]/.test(prevChar) && nextChar !== '' && !/\s/.test(nextChar);

      if (validOpen) {
        let closeIdx = -1;
        let searchFrom = i + 1;
        while (searchFrom < input.length) {
          const candidate = input.indexOf(ch, searchFrom);
          if (candidate === -1) break;
          const beforeClose = input[candidate - 1];
          const afterClose = candidate + 1 < input.length ? input[candidate + 1] : ' ';
          if (!/\s/.test(beforeClose) && !/[A-Za-z0-9]/.test(afterClose) && candidate > i + 1) {
            closeIdx = candidate;
            break;
          }
          searchFrom = candidate + 1;
        }

        if (closeIdx !== -1) {
          pushPlain(buffer);
          buffer = '';
          const inner = input.slice(i + 1, closeIdx);
          const children = parseWhatsAppInline(inner, depth + 1);
          if (ch === '*') nodes.push({ type: 'bold', children });
          else if (ch === '_') nodes.push({ type: 'italic', children });
          else nodes.push({ type: 'strike', children });
          i = closeIdx + 1;
          continue;
        }
      }
    }

    buffer += ch;
    i += 1;
  }

  pushPlain(buffer);
  return nodes;
}

export function parseWhatsAppMessage(text: string): BlockNode[] {
  if (!text) return [];
  const normalized = text.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  const blocks: BlockNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Multi-line ```code block```
    if (line.trim().startsWith('```')) {
      const restOfFirstLine = line.trim().slice(3);
      if (restOfFirstLine.endsWith('```') && restOfFirstLine.length > 3) {
        blocks.push({ type: 'codeblock', value: restOfFirstLine.slice(0, -3) });
        i += 1;
        continue;
      }
      const codeLines: string[] = [];
      if (restOfFirstLine.length > 0) codeLines.push(restOfFirstLine);
      let j = i + 1;
      let closed = false;
      while (j < lines.length) {
        if (lines[j].trim().endsWith('```')) {
          const beforeFence = lines[j].trim().slice(0, -3);
          if (beforeFence.length > 0) codeLines.push(beforeFence);
          closed = true;
          break;
        }
        codeLines.push(lines[j]);
        j += 1;
      }
      if (closed) {
        blocks.push({ type: 'codeblock', value: codeLines.join('\n') });
        i = j + 1;
        continue;
      }
    }

    if (line.trim() === '') {
      blocks.push({ type: 'spacer' });
      i += 1;
      continue;
    }

    // Blockquote: "> quote"
    if (/^>\s?/.test(line)) {
      const content = line.replace(/^>\s?/, '');
      blocks.push({ type: 'blockquote', children: parseWhatsAppInline(content) });
      i += 1;
      continue;
    }

    // Bullet list: "- item" or "* item" (note "* " with trailing space is bullet in WhatsApp)
    if (/^[-•]\s+/.test(line) || /^\*\s+/.test(line)) {
      const items: InlineNode[][] = [];
      while (i < lines.length && (/^[-•]\s+/.test(lines[i]) || /^\*\s+/.test(lines[i]))) {
        const itemText = lines[i].replace(/^([-•]|\*)\s+/, '');
        items.push(parseWhatsAppInline(itemText));
        i += 1;
      }
      blocks.push({ type: 'bullet', items });
      continue;
    }

    // Numbered list: "1. item"
    if (/^\d+\.\s+/.test(line)) {
      const items: Array<{ index: string; children: InlineNode[] }> = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        const match = lines[i].match(/^(\d+\.)\s+(.*)$/);
        if (match) {
          items.push({ index: match[1], children: parseWhatsAppInline(match[2]) });
        }
        i += 1;
      }
      blocks.push({ type: 'numbered', items });
      continue;
    }

    blocks.push({ type: 'paragraph', children: parseWhatsAppInline(line) });
    i += 1;
  }

  return blocks;
}

export function wrapSelectionWithSyntax(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  prefix: string,
  suffix: string,
  fallbackText: string
): { nextText: string; nextStart: number; nextEnd: number } {
  const selected = text.slice(selectionStart, selectionEnd);
  const content = selected.length > 0 ? selected : fallbackText;
  const trimmedLeading = content.match(/^\s*/)?.[0] ?? '';
  const trimmedTrailing = content.match(/\s*$/)?.[0] ?? '';
  const core = content.trim() || fallbackText;
  const wrapped = `${trimmedLeading}${prefix}${core}${suffix}${trimmedTrailing}`;

  const nextText = text.slice(0, selectionStart) + wrapped + text.slice(selectionEnd);
  const nextStart = selectionStart + trimmedLeading.length + prefix.length;
  const nextEnd = nextStart + core.length;
  return { nextText, nextStart, nextEnd };
}

export function prefixLinesWithSyntax(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  mode: 'bullet' | 'numbered' | 'quote'
): { nextText: string; nextStart: number; nextEnd: number } {
  const lineStart = text.lastIndexOf('\n', Math.max(0, selectionStart - 1)) + 1;
  const nextNewline = text.indexOf('\n', selectionEnd);
  const lineEnd = nextNewline === -1 ? text.length : nextNewline;

  const block = text.slice(lineStart, lineEnd);
  const lines = block.split('\n');
  const transformed = lines.map((line, idx) => {
    const clean = line.replace(/^([-•*]|\d+\.|>)\s+/, '');
    if (mode === 'bullet') return `- ${clean}`;
    if (mode === 'numbered') return `${idx + 1}. ${clean}`;
    return `> ${clean}`;
  });

  const replacement = transformed.join('\n');
  const nextText = text.slice(0, lineStart) + replacement + text.slice(lineEnd);
  return {
    nextText,
    nextStart: lineStart,
    nextEnd: lineStart + replacement.length,
  };
}

export function countMessageMetrics(text: string) {
  const characters = text.length;
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
  // WhatsApp long message threshold reference (~4096 chars per typical message)
  const segments = characters === 0 ? 0 : Math.ceil(characters / 4096);
  return { characters, words, lines, segments };
}
