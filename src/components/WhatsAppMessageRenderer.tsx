import type { ReactNode } from 'react';
import { parseWhatsAppMessage, type InlineNode } from '../utils/whatsappFormat';

function renderInlineNodes(nodes: InlineNode[], keyPrefix: string): ReactNode[] {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;
    switch (node.type) {
      case 'text':
        return <span key={key}>{node.value}</span>;
      case 'bold':
        return (
          <strong key={key} className="font-semibold text-slate-900">
            {renderInlineNodes(node.children, key)}
          </strong>
        );
      case 'italic':
        return (
          <em key={key} className="italic">
            {renderInlineNodes(node.children, key)}
          </em>
        );
      case 'strike':
        return (
          <del key={key} className="line-through text-slate-500">
            {renderInlineNodes(node.children, key)}
          </del>
        );
      case 'mono':
        return (
          <code
            key={key}
            className="rounded bg-black/5 px-1.5 py-0.5 font-mono text-[0.875em] text-slate-900"
          >
            {node.value}
          </code>
        );
      case 'link': {
        const href = node.value.startsWith('http') ? node.value : `https://${node.value}`;
        return (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2563EB] underline decoration-[#2563EB]/50 underline-offset-2 break-all"
          >
            {node.value}
          </a>
        );
      }
      default:
        return null;
    }
  });
}

interface WhatsAppMessageRendererProps {
  text: string;
}

export function WhatsAppMessageRenderer({ text }: WhatsAppMessageRendererProps) {
  const blocks = parseWhatsAppMessage(text);

  return (
    <div className="space-y-1.5 text-[15px] leading-[1.48] text-slate-900 break-words">
      {blocks.map((block, idx) => {
        const key = `blk-${idx}`;
        switch (block.type) {
          case 'spacer':
            return <div key={key} className="h-2" aria-hidden="true" />;
          case 'codeblock':
            return (
              <pre
                key={key}
                className="overflow-x-auto rounded-md bg-black/5 p-2.5 font-mono text-[13px] leading-snug text-slate-800"
              >
                <code>{block.value}</code>
              </pre>
            );
          case 'blockquote':
            return (
              <div
                key={key}
                className="rounded-md bg-black/[0.04] px-3 py-1.5 text-slate-700"
              >
                <span className="font-mono text-xs text-[#047857] me-1.5" aria-hidden="true">
                  |
                </span>
                {renderInlineNodes(block.children, key)}
              </div>
            );
          case 'bullet':
            return (
              <ul key={key} className="list-disc ps-5 space-y-0.5">
                {block.items.map((itemNodes, itemIdx) => (
                  <li key={`${key}-li-${itemIdx}`}>
                    {renderInlineNodes(itemNodes, `${key}-li-${itemIdx}`)}
                  </li>
                ))}
              </ul>
            );
          case 'numbered':
            return (
              <ol key={key} className="space-y-0.5">
                {block.items.map((item, itemIdx) => (
                  <li key={`${key}-ol-${itemIdx}`} className="flex gap-2">
                    <span className="font-medium tabular-nums text-slate-700 shrink-0">
                      {item.index}
                    </span>
                    <span>{renderInlineNodes(item.children, `${key}-ol-${itemIdx}`)}</span>
                  </li>
                ))}
              </ol>
            );
          case 'paragraph':
          default:
            return <p key={key}>{renderInlineNodes(block.children, key)}</p>;
        }
      })}
    </div>
  );
}
