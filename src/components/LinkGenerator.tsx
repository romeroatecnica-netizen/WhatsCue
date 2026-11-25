import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Bookmark,
  Check,
  CheckCircle2,
  Copy,
  Eraser,
  ExternalLink,
  Link2,
} from 'lucide-react';
import { POPULAR_COUNTRY_CODES } from '../data/countryCodes';
import type { LocaleBundle } from '../i18n/types';
import { WhatsAppMessageRenderer } from './WhatsAppMessageRenderer';

interface LinkGeneratorProps {
  locale: LocaleBundle;
  countryCode: string;
  phone: string;
  message: string;
  onCountryCodeChange: (val: string) => void;
  onPhoneChange: (val: string) => void;
  onMessageChange: (val: string) => void;
  onSaveLink: (payload: {
    countryCode: string;
    phone: string;
    message: string;
    url: string;
  }) => void;
}

export function sanitizeDigits(input: string): string {
  return input.replace(/\D+/g, '');
}

export function buildWaMeUrl(countryCode: string, phone: string, message: string): {
  digits: string;
  url: string;
  isValid: boolean;
} {
  const cleanCode = sanitizeDigits(countryCode);
  const cleanPhone = sanitizeDigits(phone).replace(/^0+/, '');
  const digits = `${cleanCode}${cleanPhone}`;
  const isValid = digits.length >= 6 && digits.length <= 15;

  const base = digits ? `https://wa.me/${digits}` : 'https://wa.me/';
  const trimmedMsg = message.trim();
  const url = trimmedMsg ? `${base}?text=${encodeURIComponent(message)}` : base;

  return { digits, url, isValid };
}

export function LinkGenerator({
  locale,
  countryCode,
  phone,
  message,
  onCountryCodeChange,
  onPhoneChange,
  onMessageChange,
  onSaveLink,
}: LinkGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const { digits, url, isValid } = useMemo(
    () => buildWaMeUrl(countryCode, phone, message),
    [countryCode, phone, message]
  );

  const handleCopy = async () => {
    if (!isValid) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback ignored if clipboard blocked
    }
  };

  const handleSave = () => {
    if (!isValid) return;
    onSaveLink({
      countryCode: sanitizeDigits(countryCode),
      phone: sanitizeDigits(phone),
      message,
      url,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const handleClear = () => {
    onPhoneChange('');
    onMessageChange('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-900">
          {locale.linkGen.heading}
        </h2>
        <p className="mt-1 text-sm text-slate-600">{locale.linkGen.subheading}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        {/* Form Inputs Column */}
        <div className="lg:col-span-7 rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
            <div className="sm:col-span-4">
              <label
                htmlFor="wa-country-select"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                {locale.linkGen.quickCountryLabel}
              </label>
              <select
                id="wa-country-select"
                value={
                  POPULAR_COUNTRY_CODES.some((c) => c.dial === sanitizeDigits(countryCode))
                    ? sanitizeDigits(countryCode)
                    : ''
                }
                onChange={(e) => {
                  if (e.target.value) onCountryCodeChange(e.target.value);
                }}
                className="w-full min-h-[42px] rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
              >
                <option value="">--</option>
                {POPULAR_COUNTRY_CODES.map((c) => (
                  <option key={c.iso} value={c.dial}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="wa-country-code"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                {locale.linkGen.countryCodeLabel}
              </label>
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute start-3 font-mono text-sm text-slate-400">
                  +
                </span>
                <input
                  id="wa-country-code"
                  type="text"
                  inputMode="numeric"
                  value={countryCode}
                  onChange={(e) => onCountryCodeChange(sanitizeDigits(e.target.value).slice(0, 4))}
                  placeholder="1"
                  className="w-full min-h-[42px] rounded-lg border border-[#E2E8F0] bg-white ps-7 pe-3 py-2 font-mono text-sm text-slate-900 tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
                />
              </div>
            </div>

            <div className="sm:col-span-5">
              <label
                htmlFor="wa-phone-input"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                {locale.linkGen.phoneLabel}
              </label>
              <input
                id="wa-phone-input"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => onPhoneChange(e.target.value)}
                placeholder={locale.linkGen.phonePlaceholder}
                className="w-full min-h-[42px] rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 font-mono text-sm text-slate-900 tabular-nums placeholder:font-sans placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
              />
            </div>
          </div>

          <p className="text-xs text-slate-500">{locale.linkGen.digitsCleanedNote}</p>

          <div>
            <label
              htmlFor="wa-prefill-message"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {locale.linkGen.messageLabel}
            </label>
            <textarea
              id="wa-prefill-message"
              rows={5}
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder={locale.linkGen.messagePlaceholder}
              className="w-full resize-y rounded-lg border border-[#E2E8F0] bg-white p-3.5 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
            />
          </div>

          {/* Generated Link Output */}
          <div className="space-y-2.5 border-t border-[#E2E8F0] pt-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-700">
                {locale.linkGen.generatedUrlLabel}
              </span>
              <span className="text-xs font-medium text-slate-500 tabular-nums">
                {digits.length} {locale.linkGen.digitsCount}
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5">
              <Link2 className="h-4 w-4 text-[#059669] shrink-0" aria-hidden="true" />
              <output
                htmlFor="wa-country-code wa-phone-input wa-prefill-message"
                className="flex-1 overflow-x-auto font-mono text-xs sm:text-sm text-slate-900 tabular-nums whitespace-nowrap select-all"
              >
                {url}
              </output>
            </div>

            <div className="flex items-start gap-2 text-xs">
              {isValid ? (
                <>
                  <CheckCircle2
                    className="h-4 w-4 text-[#059669] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span className="text-[#047857] font-medium">
                    {locale.linkGen.validPhoneHint}
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle
                    className="h-4 w-4 text-amber-600 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span className="text-amber-700 font-medium">
                    {locale.linkGen.invalidPhoneHint}
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!isValid}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#059669] px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-[#047857] disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>{copied ? locale.linkGen.copiedLinkBtn : locale.linkGen.copyLinkBtn}</span>
              </button>

              {isValid ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{locale.linkGen.openLinkBtn}</span>
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 opacity-45"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{locale.linkGen.openLinkBtn}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={!isValid}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0 transition-colors hover:bg-slate-50 disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
              >
                {saved ? (
                  <Check className="h-3.5 w-3.5 text-[#059669]" aria-hidden="true" />
                ) : (
                  <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>{saved ? locale.linkGen.savedLinkBtn : locale.linkGen.saveLinkBtn}</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                disabled={!phone && !message}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 whitespace-nowrap shrink-0 transition-colors hover:bg-slate-50 disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
              >
                <Eraser className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{locale.linkGen.clearBtn}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-5 flex flex-col rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3">
            <h3 className="font-display text-sm font-bold text-slate-900">
              {locale.linkGen.previewTitle}
            </h3>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              {digits ? `+${digits}` : 'wa.me'}
            </span>
          </div>

          <div className="flex-1 bg-[#EFEAE2] p-4 sm:p-5 flex flex-col justify-between min-h-[280px]">
            <div className="text-xs text-slate-600 font-mono truncate">
              {digits ? `https://wa.me/${digits}` : 'https://wa.me/...'}
            </div>

            {message.trim() ? (
              <div className="mt-6 ms-auto max-w-[92%] rounded-xl rounded-se-none bg-[#D9FDD3] px-3.5 py-2.5 shadow-xs border border-[#C6F0BE]">
                <WhatsAppMessageRenderer text={message} />
              </div>
            ) : (
              <div className="my-auto text-center text-sm text-slate-600">
                {locale.linkGen.previewEmptyMessage}
              </div>
            )}

            <div className="mt-4 rounded-lg border border-black/10 bg-white/95 px-3 py-2 text-xs text-slate-500 truncate">
              {message.trim() || locale.linkGen.messagePlaceholder}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
