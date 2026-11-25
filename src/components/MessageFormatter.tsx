import { useRef, useState } from 'react';
import {
  Bold,
  Bookmark,
  Check,
  CheckCheck,
  Code,
  Copy,
  CornerDownLeft,
  Eraser,
  FileCode2,
  Italic,
  List,
  ListOrdered,
  Quote,
  Send,
  Sparkles,
  Strikethrough,
} from 'lucide-react';
import type { LocaleBundle } from '../i18n/types';
import {
  countMessageMetrics,
  prefixLinesWithSyntax,
  wrapSelectionWithSyntax,
} from '../utils/whatsappFormat';
import { WhatsAppMessageRenderer } from './WhatsAppMessageRenderer';

interface MessageFormatterProps {
  locale: LocaleBundle;
  value: string;
  onChange: (next: string) => void;
  onSendToLink: (text: string) => void;
  onSaveMessage: (text: string) => void;
}

export function MessageFormatter({
  locale,
  value,
  onChange,
  onSendToLink,
  onSaveMessage,
}: MessageFormatterProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const metrics = countMessageMetrics(value);

  const applyWrap = (prefix: string, suffix: string, fallback: string) => {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const { nextText, nextStart, nextEnd } = wrapSelectionWithSyntax(
      value,
      start,
      end,
      prefix,
      suffix,
      fallback
    );
    onChange(nextText);
    window.requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(nextStart, nextEnd);
      }
    });
  };

  const applyLineMode = (mode: 'bullet' | 'numbered' | 'quote') => {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const { nextText, nextStart, nextEnd } = prefixLinesWithSyntax(value, start, end, mode);
    onChange(nextText);
    window.requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(nextStart, nextEnd);
      }
    });
  };

  const insertBlankLine = () => {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const nextText = value.slice(0, start) + '\n\n' + value.slice(end);
    onChange(nextText);
    window.requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + 2, start + 2);
      }
    });
  };

  const handleCopy = async () => {
    if (!value.trim()) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback copy via temporary selection
      if (textareaRef.current) {
        textareaRef.current.select();
        document.execCommand('copy');
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
    }
  };

  const handleSave = () => {
    if (!value.trim()) return;
    onSaveMessage(value);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            {locale.formatter.heading}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{locale.formatter.subheading}</p>
        </div>

        {/* Unboxed tabular counters */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500 tabular-nums">
          <span>
            <strong className="font-semibold text-slate-900">{metrics.characters}</strong>{' '}
            {locale.formatter.metrics.characters}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            <strong className="font-semibold text-slate-900">{metrics.words}</strong>{' '}
            {locale.formatter.metrics.words}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            <strong className="font-semibold text-slate-900">{metrics.lines}</strong>{' '}
            {locale.formatter.metrics.lines}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            <strong className="font-semibold text-slate-900">{metrics.segments}</strong>{' '}
            {locale.formatter.metrics.segments}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        {/* Editor Column */}
        <div className="lg:col-span-7 flex flex-col rounded-xl border border-[#E2E8F0] bg-white">
          {/* Formatting Toolbar */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-[#E2E8F0] p-3">
            <button
              type="button"
              onClick={() => applyWrap('*', '*', 'bold text')}
              title={`${locale.formatter.toolbar.bold} (*text*)`}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1.5 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0 transition-colors hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
            >
              <Bold className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{locale.formatter.toolbar.bold}</span>
            </button>
            <button
              type="button"
              onClick={() => applyWrap('_', '_', 'italic text')}
              title={`${locale.formatter.toolbar.italic} (_text_)`}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1.5 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0 transition-colors hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
            >
              <Italic className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{locale.formatter.toolbar.italic}</span>
            </button>
            <button
              type="button"
              onClick={() => applyWrap('~', '~', 'strikethrough')}
              title={`${locale.formatter.toolbar.strike} (~text~)`}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1.5 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0 transition-colors hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
            >
              <Strikethrough className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{locale.formatter.toolbar.strike}</span>
            </button>
            <button
              type="button"
              onClick={() => applyWrap('`', '`', 'CODE-123')}
              title={`${locale.formatter.toolbar.mono} (\`code\`)`}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1.5 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0 transition-colors hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
            >
              <Code className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{locale.formatter.toolbar.mono}</span>
            </button>
            <button
              type="button"
              onClick={() => applyWrap('```\n', '\n```', 'code block')}
              title={`${locale.formatter.toolbar.codeBlock} (\`\`\`code\`\`\`)`}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1.5 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0 transition-colors hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
            >
              <FileCode2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{locale.formatter.toolbar.codeBlock}</span>
            </button>
            <button
              type="button"
              onClick={() => applyLineMode('bullet')}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1.5 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0 transition-colors hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
            >
              <List className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{locale.formatter.toolbar.bullet}</span>
            </button>
            <button
              type="button"
              onClick={() => applyLineMode('numbered')}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1.5 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0 transition-colors hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
            >
              <ListOrdered className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{locale.formatter.toolbar.numbered}</span>
            </button>
            <button
              type="button"
              onClick={() => applyLineMode('quote')}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1.5 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0 transition-colors hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
            >
              <Quote className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{locale.formatter.toolbar.quote}</span>
            </button>
            <button
              type="button"
              onClick={insertBlankLine}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1.5 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0 transition-colors hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
            >
              <CornerDownLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{locale.formatter.toolbar.lineBreak}</span>
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={locale.formatter.placeholder}
            rows={11}
            aria-label={locale.formatter.heading}
            className="w-full flex-1 resize-y bg-white p-4 text-[15px] leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] p-3 rounded-b-xl">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onChange(locale.formatter.sampleMessage)}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#059669]" aria-hidden="true" />
                <span>{locale.formatter.toolbar.sample}</span>
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                disabled={!value}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-slate-600 whitespace-nowrap shrink-0 transition-colors hover:bg-slate-50 disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
              >
                <Eraser className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{locale.formatter.toolbar.clear}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={!value.trim()}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0 transition-colors hover:bg-slate-50 disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
              >
                {saved ? (
                  <Check className="h-3.5 w-3.5 text-[#059669]" aria-hidden="true" />
                ) : (
                  <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>{saved ? locale.formatter.savedBtn : locale.formatter.saveBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => onSendToLink(value)}
                disabled={!value.trim()}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#2563EB]/30 bg-white px-3.5 py-2 text-xs font-semibold text-[#2563EB] whitespace-nowrap shrink-0 transition-colors hover:bg-blue-50 disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              >
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{locale.formatter.sendToLinkBtn}</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!value.trim()}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#059669] px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-[#047857] disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>{copied ? locale.formatter.copiedBtn : locale.formatter.copyBtn}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Chat Bubble Preview Column */}
        <div className="lg:col-span-5 flex flex-col rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3">
            <div>
              <h3 className="font-display text-sm font-bold text-slate-900">
                {locale.formatter.previewTitle}
              </h3>
              <p className="text-xs text-slate-500">{locale.formatter.previewSubtitle}</p>
            </div>
            <span className="font-mono text-xs text-slate-500 tabular-nums">{nowTime}</span>
          </div>

          {/* Authentic neutral-warm WhatsApp chat canvas */}
          <div className="flex-1 bg-[#EFEAE2] p-4 sm:p-5 flex flex-col justify-end min-h-[300px]">
            {value.trim() ? (
              <div className="ms-auto max-w-[92%] rounded-xl rounded-se-none bg-[#D9FDD3] px-3.5 py-2.5 shadow-xs border border-[#C6F0BE]">
                <WhatsAppMessageRenderer text={value} />
                <div className="mt-1.5 flex items-center justify-end gap-1 text-[11px] text-slate-500 tabular-nums">
                  <span>{nowTime}</span>
                  <CheckCheck className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden="true" />
                </div>
              </div>
            ) : (
              <div className="m-auto max-w-xs text-center text-sm text-slate-600">
                {locale.formatter.emptyPreview}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
