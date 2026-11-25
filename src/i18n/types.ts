export type LanguageCode =
  | 'en'
  | 'es'
  | 'fr'
  | 'de'
  | 'pt'
  | 'ar'
  | 'hi'
  | 'ru'
  | 'zh'
  | 'ja';

export type ToolTabId = 'formatter' | 'link' | 'replies' | 'canvas';

export type ReplyCategoryId = 'orders' | 'support' | 'pricing' | 'everyday';

export interface LanguageOption {
  code: LanguageCode;
  nativeName: string;
  englishName: string;
  dir: 'ltr' | 'rtl';
}

export interface HowToStepCopy {
  name: string;
  text: string;
}

export interface FaqItemCopy {
  question: string;
  answer: string;
}

export interface EditorialSectionCopy {
  title: string;
  body: string;
  bullets: string[];
}

export interface GearItemCopy {
  title: string;
  category: string;
  description: string;
  ctaLabel: string;
  href: string;
}

export interface LocaleBundle {
  code: LanguageCode;
  seo: {
    title: string;
    description: string;
    keywords: string;
    appName: string;
    tabTitles: Record<ToolTabId, string>;
    howToTitle: Record<ToolTabId, string>;
    howToSteps: Record<ToolTabId, HowToStepCopy[]>;
  };
  nav: {
    workspace: string;
    library: string;
    guide: string;
    faq: string;
    languageLabel: string;
  };
  hero: {
    h1: string;
    subtitle: string;
    privacyNotice: string;
  };
  tabs: {
    formatter: { label: string; shortLabel: string };
    link: { label: string; shortLabel: string };
    replies: { label: string; shortLabel: string };
    canvas: { label: string; shortLabel: string };
  };
  formatter: {
    heading: string;
    subheading: string;
    placeholder: string;
    toolbar: {
      bold: string;
      italic: string;
      strike: string;
      mono: string;
      codeBlock: string;
      bullet: string;
      numbered: string;
      quote: string;
      lineBreak: string;
      sample: string;
      clear: string;
    };
    metrics: {
      characters: string;
      words: string;
      lines: string;
      segments: string;
    };
    previewTitle: string;
    previewSubtitle: string;
    emptyPreview: string;
    copyBtn: string;
    copiedBtn: string;
    sendToLinkBtn: string;
    saveBtn: string;
    savedBtn: string;
    sampleMessage: string;
  };
  linkGen: {
    heading: string;
    subheading: string;
    countryCodeLabel: string;
    quickCountryLabel: string;
    phoneLabel: string;
    phonePlaceholder: string;
    digitsCleanedNote: string;
    messageLabel: string;
    messagePlaceholder: string;
    generatedUrlLabel: string;
    invalidPhoneHint: string;
    validPhoneHint: string;
    digitsCount: string;
    copyLinkBtn: string;
    copiedLinkBtn: string;
    openLinkBtn: string;
    saveLinkBtn: string;
    savedLinkBtn: string;
    clearBtn: string;
    previewTitle: string;
    previewEmptyMessage: string;
  };
  replies: {
    heading: string;
    subheading: string;
    searchPlaceholder: string;
    allCategories: string;
    categories: Record<ReplyCategoryId, string>;
    variablesTitle: string;
    varNameLabel: string;
    varNamePlaceholder: string;
    varTimeLabel: string;
    varTimePlaceholder: string;
    varRefLabel: string;
    varRefPlaceholder: string;
    varAmountLabel: string;
    varAmountPlaceholder: string;
    varBusinessLabel: string;
    varBusinessPlaceholder: string;
    sendToEditorBtn: string;
    copyBtn: string;
    copiedBtn: string;
    saveBtn: string;
    savedBtn: string;
    noResults: string;
    countLabel: string;
  };
  canvasMaker: {
    heading: string;
    subheading: string;
    formatLabel: string;
    formats: {
      status: string;
      square: string;
      vertical: string;
    };
    slideCountLabel: string;
    activeSlideLabel: string;
    headlineLabel: string;
    headlinePlaceholder: string;
    bodyLabel: string;
    bodyPlaceholder: string;
    footerLabel: string;
    footerPlaceholder: string;
    paletteLabel: string;
    uploadLabel: string;
    uploadHint: string;
    clearImageBtn: string;
    imageFitLabel: string;
    fitCover: string;
    fitContain: string;
    scrimLabel: string;
    alignLabel: string;
    alignLeft: string;
    alignCenter: string;
    fontScaleLabel: string;
    showSlideBadgeLabel: string;
    safeZoneLabel: string;
    safeZoneNote: string;
    previewLabel: string;
    downloadSingleBtn: string;
    downloadZipBtn: string;
    zippingBtn: string;
    defaultHeadline: string;
    defaultBody: string;
    defaultFooter: string;
  };
  library: {
    heading: string;
    subheading: string;
    messagesTitle: string;
    linksTitle: string;
    notesTitle: string;
    notesPlaceholder: string;
    emptyMessages: string;
    emptyLinks: string;
    loadBtn: string;
    copyBtn: string;
    copiedBtn: string;
    openBtn: string;
    deleteBtn: string;
    exportJsonBtn: string;
    importJsonBtn: string;
    printBtn: string;
    importSuccess: string;
    importError: string;
    printSheetTitle: string;
  };
  editorial: {
    guideHeading: string;
    guideIntro: string;
    sections: EditorialSectionCopy[];
    faqHeading: string;
    faqs: FaqItemCopy[];
    gearHeading: string;
    gearIntro: string;
    gearDisclosure: string;
    gearItems: GearItemCopy[];
  };
  footer: {
    tagline: string;
    privacy: string;
    canonicalNote: string;
  };
}
