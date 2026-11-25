import { CANONICAL_ORIGIN } from '../config/seo';
import type { LocaleBundle } from '../i18n/types';

interface FooterProps {
  locale: LocaleBundle;
}

export function Footer({ locale }: FooterProps) {
  return (
    <footer className="no-print border-t border-[#E2E8F0] bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-1">
          <p className="font-semibold text-slate-800">{locale.footer.tagline}</p>
          <p>{locale.footer.privacy}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={CANONICAL_ORIGIN}
            className="font-mono text-slate-600 hover:text-slate-900 hover:underline"
          >
            {locale.footer.canonicalNote}
          </a>
        </div>
      </div>
    </footer>
  );
}
