import type { LanguageCode, LanguageOption, LocaleBundle, ToolTabId } from '../i18n/types';

export const CANONICAL_ORIGIN = 'https://whatscue.bastelar.com';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', nativeName: 'English', englishName: 'English', dir: 'ltr' },
  { code: 'es', nativeName: 'Español', englishName: 'Spanish', dir: 'ltr' },
  { code: 'fr', nativeName: 'Français', englishName: 'French', dir: 'ltr' },
  { code: 'de', nativeName: 'Deutsch', englishName: 'German', dir: 'ltr' },
  { code: 'pt', nativeName: 'Português', englishName: 'Portuguese', dir: 'ltr' },
  { code: 'ar', nativeName: 'العربية', englishName: 'Arabic', dir: 'rtl' },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', dir: 'ltr' },
  { code: 'ru', nativeName: 'Русский', englishName: 'Russian', dir: 'ltr' },
  { code: 'zh', nativeName: '中文', englishName: 'Chinese', dir: 'ltr' },
  { code: 'ja', nativeName: '日本語', englishName: 'Japanese', dir: 'ltr' },
];

export function isSupportedLanguage(code: string | null | undefined): code is LanguageCode {
  if (!code) return false;
  return SUPPORTED_LANGUAGES.some((lang) => lang.code === code);
}

export function getCanonicalUrl(lang: LanguageCode): string {
  return lang === 'en' ? `${CANONICAL_ORIGIN}/` : `${CANONICAL_ORIGIN}/?lang=${lang}`;
}

export function getAlternateLinks(): Array<{ hreflang: string; href: string }> {
  const list = SUPPORTED_LANGUAGES.map((lang) => ({
    hreflang: lang.code,
    href: getCanonicalUrl(lang.code),
  }));
  return [{ hreflang: 'x-default', href: `${CANONICAL_ORIGIN}/` }, ...list];
}

export function buildJsonLd(locale: LocaleBundle, activeTab: ToolTabId) {
  const canonicalUrl = getCanonicalUrl(locale.code);
  const steps = locale.seo.howToSteps[activeTab] || locale.seo.howToSteps.formatter;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `${CANONICAL_ORIGIN}/#webapp`,
        name: locale.seo.appName,
        url: canonicalUrl,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires JavaScript. Runs 100% client-side in modern browsers.',
        inLanguage: locale.code,
        description: locale.seo.description,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: [
          locale.tabs.formatter.label,
          locale.tabs.link.label,
          locale.tabs.replies.label,
          locale.tabs.canvas.label,
        ],
      },
      {
        '@type': 'HowTo',
        '@id': `${canonicalUrl}#howto-${activeTab}`,
        name: locale.seo.howToTitle[activeTab],
        description: locale.seo.description,
        inLanguage: locale.code,
        step: steps.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: step.name,
          text: step.text,
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonicalUrl}#faq`,
        inLanguage: locale.code,
        mainEntity: locale.editorial.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };
}

export function syncHeadMetadata(locale: LocaleBundle, activeTab: ToolTabId): void {
  if (typeof document === 'undefined') return;

  const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === locale.code) ?? SUPPORTED_LANGUAGES[0];
  document.documentElement.lang = langMeta.code;
  document.documentElement.dir = langMeta.dir;

  const activeTitle = `${locale.seo.tabTitles[activeTab]} | ${locale.seo.title}`;
  document.title = activeTitle;

  const canonicalUrl = getCanonicalUrl(locale.code);

  const upsertMeta = (selector: string, attrs: Record<string, string>) => {
    let el = document.head.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      document.head.appendChild(el);
    }
    for (const [key, val] of Object.entries(attrs)) {
      el.setAttribute(key, val);
    }
  };

  upsertMeta('meta[name="description"]', {
    name: 'description',
    content: locale.seo.description,
  });
  upsertMeta('meta[name="keywords"]', {
    name: 'keywords',
    content: locale.seo.keywords,
  });
  upsertMeta('meta[property="og:url"]', {
    property: 'og:url',
    content: canonicalUrl,
  });
  upsertMeta('meta[property="og:title"]', {
    property: 'og:title',
    content: activeTitle,
  });
  upsertMeta('meta[property="og:description"]', {
    property: 'og:description',
    content: locale.seo.description,
  });
  upsertMeta('meta[name="twitter:title"]', {
    name: 'twitter:title',
    content: activeTitle,
  });
  upsertMeta('meta[name="twitter:description"]', {
    name: 'twitter:description',
    content: locale.seo.description,
  });

  let canonicalLink = document.head.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', canonicalUrl);

  const alternates = getAlternateLinks();
  for (const alt of alternates) {
    let altLink = document.head.querySelector(
      `link[rel="alternate"][hreflang="${alt.hreflang}"]`
    );
    if (!altLink) {
      altLink = document.createElement('link');
      altLink.setAttribute('rel', 'alternate');
      altLink.setAttribute('hreflang', alt.hreflang);
      document.head.appendChild(altLink);
    }
    altLink.setAttribute('href', alt.href);
  }

  let jsonLdScript = document.getElementById('whatscue-jsonld');
  if (!jsonLdScript) {
    jsonLdScript = document.createElement('script');
    jsonLdScript.id = 'whatscue-jsonld';
    jsonLdScript.setAttribute('type', 'application/ld+json');
    document.head.appendChild(jsonLdScript);
  }
  jsonLdScript.textContent = JSON.stringify(buildJsonLd(locale, activeTab));
}
