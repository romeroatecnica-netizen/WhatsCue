import { useMemo, useState } from 'react';
import { ArrowRight, Bookmark, Check, Copy, Search } from 'lucide-react';
import { QUICK_REPLIES } from '../data/quickReplies';
import type { LocaleBundle, ReplyCategoryId } from '../i18n/types';

interface QuickRepliesProps {
  locale: LocaleBundle;
  onSendToEditor: (text: string) => void;
  onSaveMessage: (text: string, label?: string) => void;
}

interface TemplateVariables {
  name: string;
  time: string;
  ref: string;
  amount: string;
  business: string;
}

function interpolateTemplate(template: string, vars: TemplateVariables, locale: LocaleBundle): string {
  const safeName = vars.name.trim() || locale.replies.varNamePlaceholder;
  const safeTime = vars.time.trim() || locale.replies.varTimePlaceholder;
  const safeRef = vars.ref.trim() || locale.replies.varRefPlaceholder;
  const safeAmount = vars.amount.trim() || locale.replies.varAmountPlaceholder;
  const safeBusiness = vars.business.trim() || locale.replies.varBusinessPlaceholder;

  return template
    .replaceAll('{name}', safeName)
    .replaceAll('{time}', safeTime)
    .replaceAll('{ref}', safeRef)
    .replaceAll('{amount}', safeAmount)
    .replaceAll('{business}', safeBusiness);
}

const CATEGORIES: ReplyCategoryId[] = ['orders', 'support', 'pricing', 'everyday'];

export function QuickReplies({ locale, onSendToEditor, onSaveMessage }: QuickRepliesProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | ReplyCategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const [vars, setVars] = useState<TemplateVariables>({
    name: '',
    time: '',
    ref: '',
    amount: '',
    business: '',
  });

  const filteredReplies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return QUICK_REPLIES.map((item) => {
      const title = item.title[locale.code] ?? item.title.en;
      const rawBody = item.body[locale.code] ?? item.body.en;
      const renderedBody = interpolateTemplate(rawBody, vars, locale);
      return {
        ...item,
        titleText: title,
        renderedBody,
      };
    }).filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        item.titleText.toLowerCase().includes(q) ||
        item.renderedBody.toLowerCase().includes(q) ||
        locale.replies.categories[item.category].toLowerCase().includes(q)
      );
    });
  }, [locale, searchQuery, selectedCategory, vars]);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1600);
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleSave = (id: string, text: string, title: string) => {
    onSaveMessage(text, title);
    setSavedId(id);
    window.setTimeout(() => setSavedId(null), 1600);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            {locale.replies.heading}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{locale.replies.subheading}</p>
        </div>
        <div className="text-xs font-medium text-slate-500 tabular-nums">
          <strong className="font-semibold text-slate-900">{filteredReplies.length}</strong>{' '}
          {locale.replies.countLabel}
        </div>
      </div>

      {/* Live Placeholder Inputs */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 sm:p-5 space-y-4">
        <div className="text-xs font-semibold text-slate-700">
          {locale.replies.variablesTitle}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label htmlFor="qr-var-name" className="block text-xs text-slate-500 mb-1">
              {locale.replies.varNameLabel}
            </label>
            <input
              id="qr-var-name"
              type="text"
              value={vars.name}
              onChange={(e) => setVars((v) => ({ ...v, name: e.target.value }))}
              placeholder={locale.replies.varNamePlaceholder}
              className="w-full min-h-[40px] rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-sm text-slate-900 focus:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
            />
          </div>
          <div>
            <label htmlFor="qr-var-time" className="block text-xs text-slate-500 mb-1">
              {locale.replies.varTimeLabel}
            </label>
            <input
              id="qr-var-time"
              type="text"
              value={vars.time}
              onChange={(e) => setVars((v) => ({ ...v, time: e.target.value }))}
              placeholder={locale.replies.varTimePlaceholder}
              className="w-full min-h-[40px] rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-sm text-slate-900 focus:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
            />
          </div>
          <div>
            <label htmlFor="qr-var-ref" className="block text-xs text-slate-500 mb-1">
              {locale.replies.varRefLabel}
            </label>
            <input
              id="qr-var-ref"
              type="text"
              value={vars.ref}
              onChange={(e) => setVars((v) => ({ ...v, ref: e.target.value }))}
              placeholder={locale.replies.varRefPlaceholder}
              className="w-full min-h-[40px] rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 font-mono text-sm text-slate-900 tabular-nums focus:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
            />
          </div>
          <div>
            <label htmlFor="qr-var-amount" className="block text-xs text-slate-500 mb-1">
              {locale.replies.varAmountLabel}
            </label>
            <input
              id="qr-var-amount"
              type="text"
              value={vars.amount}
              onChange={(e) => setVars((v) => ({ ...v, amount: e.target.value }))}
              placeholder={locale.replies.varAmountPlaceholder}
              className="w-full min-h-[40px] rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 font-mono text-sm text-slate-900 tabular-nums focus:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
            />
          </div>
          <div>
            <label htmlFor="qr-var-business" className="block text-xs text-slate-500 mb-1">
              {locale.replies.varBusinessLabel}
            </label>
            <input
              id="qr-var-business"
              type="text"
              value={vars.business}
              onChange={(e) => setVars((v) => ({ ...v, business: e.target.value }))}
              placeholder={locale.replies.varBusinessPlaceholder}
              className="w-full min-h-[40px] rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-sm text-slate-900 focus:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
            />
          </div>
        </div>
      </div>

      {/* Category Filter + Search */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-label="Reply categories"
          className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1"
        >
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`min-h-[36px] rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              selectedCategory === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {locale.replies.allCategories}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[36px] rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {locale.replies.categories[cat]}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={locale.replies.searchPlaceholder}
            aria-label={locale.replies.searchPlaceholder}
            className="w-full min-h-[40px] rounded-lg border border-[#E2E8F0] bg-white ps-9 pe-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
          />
        </div>
      </div>

      {/* Templates Grid */}
      {filteredReplies.length === 0 ? (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-10 text-center text-sm text-slate-500">
          {locale.replies.noResults}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredReplies.map((item) => {
            const isCopied = copiedId === item.id;
            const isSaved = savedId === item.id;

            return (
              <article
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-[#E2E8F0] bg-white p-5 transition-colors hover:border-slate-300"
              >
                <div>
                  <div className="text-xs font-medium text-[#047857]">
                    {locale.replies.categories[item.category]}
                  </div>
                  <h3 className="mt-1 font-display text-base font-bold text-slate-900">
                    {item.titleText}
                  </h3>
                  <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                    {item.renderedBody}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#E2E8F0] pt-3.5">
                  <button
                    type="button"
                    onClick={() => onSendToEditor(item.renderedBody)}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#059669] px-3.5 py-1.5 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-[#047857] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
                  >
                    <span>{locale.replies.sendToEditorBtn}</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.id, item.renderedBody)}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
                  >
                    {isCopied ? (
                      <Check className="h-3.5 w-3.5 text-[#059669]" aria-hidden="true" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    <span>{isCopied ? locale.replies.copiedBtn : locale.replies.copyBtn}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave(item.id, item.renderedBody, item.titleText)}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 whitespace-nowrap shrink-0 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
                  >
                    {isSaved ? (
                      <Check className="h-3.5 w-3.5 text-[#059669]" aria-hidden="true" />
                    ) : (
                      <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    <span>{isSaved ? locale.replies.savedBtn : locale.replies.saveBtn}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
