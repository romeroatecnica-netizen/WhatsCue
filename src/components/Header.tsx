import { Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../config/seo';
import type { LanguageCode, LocaleBundle } from '../i18n/types';

interface HeaderProps {
  locale: LocaleBundle;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

export function Header({ locale, language, onLanguageChange }: HeaderProps) {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#top"
          className="font-display text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669] rounded"
        >
          Whats<span className="text-[#059669]">Cue</span>
        </a>

        {/* Zone 2: 4 Clean Single-Line Nav Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          <a
            href="#workspace"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 hover:underline underline-offset-4"
          >
            {locale.nav.workspace}
          </a>
          <a
            href="#library"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 hover:underline underline-offset-4"
          >
            {locale.nav.library}
          </a>
          <a
            href="#guide"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 hover:underline underline-offset-4"
          >
            {locale.nav.guide}
          </a>
          <a
            href="#faq"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 hover:underline underline-offset-4"
          >
            {locale.nav.faq}
          </a>
        </nav>

        {/* Zone 3: Instant 10-Language Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <Globe className="h-4 w-4 text-slate-500 shrink-0" aria-hidden="true" />
          <label htmlFor="whatscue-lang-select" className="sr-only">
            {locale.nav.languageLabel}
          </label>
          <select
            id="whatscue-lang-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
            className="min-h-[40px] rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-sm font-medium text-slate-800 transition-colors hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
          >
            {SUPPORTED_LANGUAGES.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.nativeName}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
