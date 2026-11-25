import { useRef, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Printer,
  Trash2,
  Upload,
} from 'lucide-react';
import type { LocaleBundle } from '../i18n/types';
import {
  buildBackupPayload,
  parseBackupPayload,
  type SavedLinkItem,
  type SavedMessageItem,
} from '../utils/storage';
import { triggerBlobDownload } from '../utils/canvasRenderer';

interface SavedLibraryProps {
  locale: LocaleBundle;
  messages: SavedMessageItem[];
  links: SavedLinkItem[];
  notes: string;
  onNotesChange: (next: string) => void;
  onLoadMessage: (text: string) => void;
  onDeleteMessage: (id: string) => void;
  onLoadLink: (item: SavedLinkItem) => void;
  onDeleteLink: (id: string) => void;
  onImportBackup: (data: {
    messages: SavedMessageItem[];
    links: SavedLinkItem[];
    notes: string;
  }) => void;
}

export function SavedLibrary({
  locale,
  messages,
  links,
  notes,
  onNotesChange,
  onLoadMessage,
  onDeleteMessage,
  onLoadLink,
  onDeleteLink,
  onImportBackup,
}: SavedLibraryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleCopy = async (id: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1600);
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleExportJson = () => {
    const payload = buildBackupPayload(messages, links, notes);
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const dateStamp = new Date().toISOString().slice(0, 10);
    triggerBlobDownload(blob, `whatscue-backup-${dateStamp}.json`);
  };

  const handleImportFile = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      const parsed = parseBackupPayload(reader.result);
      if (!parsed) {
        setImportStatus({ type: 'error', text: locale.library.importError });
      } else {
        onImportBackup({
          messages: parsed.messages,
          links: parsed.links,
          notes: parsed.notes,
        });
        setImportStatus({ type: 'success', text: locale.library.importSuccess });
      }
      window.setTimeout(() => setImportStatus(null), 3500);
    };
    reader.readAsText(files[0]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <section
      id="library"
      aria-labelledby="library-heading"
      className="print-sheet rounded-xl border border-[#E2E8F0] bg-white p-5 sm:p-6 space-y-6"
    >
      <div className="flex flex-col gap-4 border-b border-[#E2E8F0] pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="library-heading" className="font-display text-xl font-bold text-slate-900">
            <span className="no-print">{locale.library.heading}</span>
            <span className="hidden print:inline">{locale.library.printSheetTitle}</span>
          </h2>
          <p className="no-print mt-1 text-sm text-slate-600">{locale.library.subheading}</p>
        </div>

        <div className="no-print flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs font-semibold text-slate-800 whitespace-nowrap transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
          >
            <Download className="h-3.5 w-3.5 text-[#059669]" aria-hidden="true" />
            <span>{locale.library.exportJsonBtn}</span>
          </button>

          <input
            ref={fileInputRef}
            id="whatscue-import-json"
            type="file"
            accept="application/json,.json"
            onChange={(e) => handleImportFile(e.target.files)}
            className="sr-only"
          />
          <label
            htmlFor="whatscue-import-json"
            className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs font-semibold text-slate-800 whitespace-nowrap transition-colors hover:bg-slate-100"
          >
            <Upload className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden="true" />
            <span>{locale.library.importJsonBtn}</span>
          </label>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white whitespace-nowrap transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{locale.library.printBtn}</span>
          </button>
        </div>
      </div>

      {importStatus && (
        <div
          role="status"
          className={`no-print rounded-lg border px-4 py-2.5 text-xs font-medium ${
            importStatus.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-[#047857]'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {importStatus.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Saved Messages */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-slate-900">
              {locale.library.messagesTitle}
            </h3>
            <span className="font-mono text-xs text-slate-500 tabular-nums">{messages.length}</span>
          </div>

          {messages.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[#E2E8F0] p-4 text-xs leading-relaxed text-slate-500">
              {locale.library.emptyMessages}
            </p>
          ) : (
            <ul className="divide-y divide-[#E2E8F0] rounded-lg border border-[#E2E8F0]">
              {messages.map((item) => (
                <li key={item.id} className="p-3.5 space-y-2">
                  <div className="text-xs font-semibold text-slate-900 truncate">{item.label}</div>
                  <p className="line-clamp-3 whitespace-pre-line text-xs text-slate-600 print:line-clamp-none">
                    {item.text}
                  </p>
                  <div className="no-print flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onLoadMessage(item.text)}
                      className="text-xs font-semibold text-[#059669] hover:underline"
                    >
                      {locale.library.loadBtn}
                    </button>
                    <span className="text-slate-300" aria-hidden="true">
                      ·
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.id, item.text)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                    >
                      {copiedId === item.id ? (
                        <Check className="h-3 w-3 text-[#059669]" aria-hidden="true" />
                      ) : (
                        <Copy className="h-3 w-3" aria-hidden="true" />
                      )}
                      <span>
                        {copiedId === item.id ? locale.library.copiedBtn : locale.library.copyBtn}
                      </span>
                    </button>
                    <span className="text-slate-300" aria-hidden="true">
                      ·
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteMessage(item.id)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" />
                      <span>{locale.library.deleteBtn}</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Saved Links */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-slate-900">
              {locale.library.linksTitle}
            </h3>
            <span className="font-mono text-xs text-slate-500 tabular-nums">{links.length}</span>
          </div>

          {links.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[#E2E8F0] p-4 text-xs leading-relaxed text-slate-500">
              {locale.library.emptyLinks}
            </p>
          ) : (
            <ul className="divide-y divide-[#E2E8F0] rounded-lg border border-[#E2E8F0]">
              {links.map((item) => (
                <li key={item.id} className="p-3.5 space-y-2">
                  <div className="font-mono text-xs font-semibold text-slate-900 tabular-nums">
                    +{item.countryCode} {item.phone}
                  </div>
                  <div className="font-mono text-[11px] text-[#2563EB] break-all">{item.url}</div>
                  {item.message && (
                    <p className="line-clamp-2 text-xs text-slate-600 print:line-clamp-none">
                      {item.message}
                    </p>
                  )}
                  <div className="no-print flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onLoadLink(item)}
                      className="text-xs font-semibold text-[#059669] hover:underline"
                    >
                      {locale.library.loadBtn}
                    </button>
                    <span className="text-slate-300" aria-hidden="true">
                      ·
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.id, item.url)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                    >
                      {copiedId === item.id ? (
                        <Check className="h-3 w-3 text-[#059669]" aria-hidden="true" />
                      ) : (
                        <Copy className="h-3 w-3" aria-hidden="true" />
                      )}
                      <span>
                        {copiedId === item.id ? locale.library.copiedBtn : locale.library.copyBtn}
                      </span>
                    </button>
                    <span className="text-slate-300" aria-hidden="true">
                      ·
                    </span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      <span>{locale.library.openBtn}</span>
                    </a>
                    <span className="text-slate-300" aria-hidden="true">
                      ·
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteLink(item.id)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" />
                      <span>{locale.library.deleteBtn}</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Local Notes */}
        <div className="lg:col-span-4 space-y-3">
          <label
            htmlFor="whatscue-local-notes"
            className="block font-display text-sm font-bold text-slate-900"
          >
            {locale.library.notesTitle}
          </label>
          <textarea
            id="whatscue-local-notes"
            rows={7}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder={locale.library.notesPlaceholder}
            className="w-full resize-y rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
          />
        </div>
      </div>
    </section>
  );
}
