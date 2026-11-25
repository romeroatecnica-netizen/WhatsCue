import { useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import type { LocaleBundle } from '../i18n/types';

interface EditorialSectionProps {
  locale: LocaleBundle;
}

export function EditorialSection({ locale }: EditorialSectionProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <div className="no-print space-y-12">
      {/* Practical SEO Guide */}
      <section id="guide" aria-labelledby="guide-heading" className="space-y-6">
        <div className="max-w-3xl">
          <h2 id="guide-heading" className="font-display text-2xl font-bold text-slate-900 text-balance">
            {locale.editorial.guideHeading}
          </h2>
          <p className="mt-2 text-base leading-relaxed text-slate-600">
            {locale.editorial.guideIntro}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {locale.editorial.sections.map((section) => (
            <article
              key={section.title}
              className="rounded-xl border border-[#E2E8F0] bg-white p-6 space-y-3"
            >
              <h3 className="font-display text-base font-bold text-slate-900">
                {section.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">{section.body}</p>
              <ul className="list-disc ps-5 space-y-1.5 text-sm leading-relaxed text-slate-700">
                {section.bullets.map((bullet, idx) => (
                  <li key={idx}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Interactive Collapsible FAQ */}
      <section id="faq" aria-labelledby="faq-heading" className="space-y-5">
        <h2 id="faq-heading" className="font-display text-2xl font-bold text-slate-900">
          {locale.editorial.faqHeading}
        </h2>

        <div className="divide-y divide-[#E2E8F0] rounded-xl border border-[#E2E8F0] bg-white">
          {locale.editorial.faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={faq.question}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
                >
                  <span className="font-display text-sm sm:text-base font-semibold text-slate-900">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-500 shrink-0 transition-transform duration-150 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-sm leading-relaxed text-slate-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contextual Affiliate Gear Block */}
      <section aria-labelledby="gear-heading" className="space-y-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 id="gear-heading" className="font-display text-xl font-bold text-slate-900">
              {locale.editorial.gearHeading}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{locale.editorial.gearIntro}</p>
          </div>
          <p className="text-xs text-slate-500">{locale.editorial.gearDisclosure}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {locale.editorial.gearItems.map((item) => (
            <article
              key={item.title}
              className="flex flex-col justify-between rounded-xl border border-[#E2E8F0] bg-white p-5"
            >
              <div>
                <div className="text-xs font-medium text-[#047857]">{item.category}</div>
                <h3 className="mt-1 font-display text-sm font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{item.description}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E2E8F0]">
                <a
                  href={item.href}
                  target="_blank"
                  rel="sponsored nofollow noopener"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:underline"
                >
                  <span>{item.ctaLabel}</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
