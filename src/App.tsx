import { useEffect, useState } from 'react';
import { Image, Link2, MessageSquareText, ShieldCheck, Zap } from 'lucide-react';
import { syncHeadMetadata } from './config/seo';
import { getLocale } from './i18n';
import type { LanguageCode, ToolTabId } from './i18n/types';
import {
  createId,
  detectInitialLanguage,
  loadDraftMessage,
  loadNotes,
  loadSavedLinks,
  loadSavedMessages,
  persistDraftMessage,
  persistLanguage,
  persistNotes,
  persistSavedLinks,
  persistSavedMessages,
  type SavedLinkItem,
  type SavedMessageItem,
} from './utils/storage';
import { Header } from './components/Header';
import { MessageFormatter } from './components/MessageFormatter';
import { LinkGenerator } from './components/LinkGenerator';
import { QuickReplies } from './components/QuickReplies';
import { CanvasMaker } from './components/CanvasMaker';
import { SavedLibrary } from './components/SavedLibrary';
import { AdSlot } from './components/AdSlot';
import { EditorialSection } from './components/EditorialSection';
import { Footer } from './components/Footer';

export default function App() {
  const [language, setLanguage] = useState<LanguageCode>(() => detectInitialLanguage());
  const [activeTab, setActiveTab] = useState<ToolTabId>('formatter');

  const locale = getLocale(language);
  const isRtl = language === 'ar';

  // Formatter state
  const [formatterText, setFormatterText] = useState<string>(() => {
    const savedDraft = loadDraftMessage();
    return savedDraft !== null ? savedDraft : getLocale(detectInitialLanguage()).formatter.sampleMessage;
  });

  // wa.me Link Generator state
  const [countryCode, setCountryCode] = useState<string>('1');
  const [phone, setPhone] = useState<string>('');
  const [linkMessage, setLinkMessage] = useState<string>('');

  // Local Library state
  const [savedMessages, setSavedMessages] = useState<SavedMessageItem[]>(() =>
    loadSavedMessages()
  );
  const [savedLinks, setSavedLinks] = useState<SavedLinkItem[]>(() => loadSavedLinks());
  const [notes, setNotes] = useState<string>(() => loadNotes());

  // Keep <head> canonical, hreflang, meta tags, dir, and JSON-LD synchronized
  useEffect(() => {
    syncHeadMetadata(locale, activeTab);
  }, [locale, activeTab]);

  // Persist formatter draft
  useEffect(() => {
    persistDraftMessage(formatterText);
  }, [formatterText]);

  const handleLanguageChange = (nextLang: LanguageCode) => {
    setLanguage(nextLang);
    persistLanguage(nextLang);

    // Update browser query string gently without ever touching canonical origin logic
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (nextLang === 'en') {
        url.searchParams.delete('lang');
      } else {
        url.searchParams.set('lang', nextLang);
      }
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }
  };

  const handleSaveMessage = (text: string, label?: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;
    const firstLine = cleanText.split('\n')[0].replace(/[*_~`]/g, '').trim();
    const resolvedLabel = label || firstLine.slice(0, 48) || 'WhatsApp Message';

    const nextItem: SavedMessageItem = {
      id: createId(),
      label: resolvedLabel,
      text: cleanText,
      createdAt: new Date().toISOString(),
    };
    const nextList = [nextItem, ...savedMessages].slice(0, 50);
    setSavedMessages(nextList);
    persistSavedMessages(nextList);
  };

  const handleDeleteMessage = (id: string) => {
    const nextList = savedMessages.filter((item) => item.id !== id);
    setSavedMessages(nextList);
    persistSavedMessages(nextList);
  };

  const handleSaveLink = (payload: {
    countryCode: string;
    phone: string;
    message: string;
    url: string;
  }) => {
    const nextItem: SavedLinkItem = {
      id: createId(),
      label: `+${payload.countryCode} ${payload.phone}`,
      countryCode: payload.countryCode,
      phone: payload.phone,
      message: payload.message,
      url: payload.url,
      createdAt: new Date().toISOString(),
    };
    const nextList = [nextItem, ...savedLinks].slice(0, 50);
    setSavedLinks(nextList);
    persistSavedLinks(nextList);
  };

  const handleDeleteLink = (id: string) => {
    const nextList = savedLinks.filter((item) => item.id !== id);
    setSavedLinks(nextList);
    persistSavedLinks(nextList);
  };

  const handleNotesChange = (next: string) => {
    setNotes(next);
    persistNotes(next);
  };

  const handleImportBackup = (data: {
    messages: SavedMessageItem[];
    links: SavedLinkItem[];
    notes: string;
  }) => {
    setSavedMessages(data.messages);
    setSavedLinks(data.links);
    setNotes(data.notes);
    persistSavedMessages(data.messages);
    persistSavedLinks(data.links);
    persistNotes(data.notes);
  };

  const tabs: Array<{ id: ToolTabId; icon: typeof MessageSquareText }> = [
    { id: 'formatter', icon: MessageSquareText },
    { id: 'link', icon: Link2 },
    { id: 'replies', icon: Zap },
    { id: 'canvas', icon: Image },
  ];

  return (
    <div id="top" dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      <Header locale={locale} language={language} onLanguageChange={handleLanguageChange} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 space-y-10">
        {/* Hero & Privacy Assurance */}
        <section className="no-print space-y-4">
          <div className="max-w-3xl space-y-2.5">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 text-balance">
              {locale.hero.h1}
            </h1>
            <p className="text-sm sm:text-base leading-relaxed text-slate-600">
              {locale.hero.subtitle}
            </p>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-xs sm:text-sm text-slate-700">
            <ShieldCheck className="h-4 w-4 text-[#059669] shrink-0 mt-0.5" aria-hidden="true" />
            <span>{locale.hero.privacyNotice}</span>
          </div>
        </section>

        {/* 4-Tool Workspace */}
        <section id="workspace" aria-label={locale.nav.workspace} className="no-print space-y-6">
          <div
            role="tablist"
            aria-label="WhatsApp utilities"
            className="grid grid-cols-2 gap-1.5 rounded-xl border border-[#E2E8F0] bg-slate-100 p-1.5 lg:grid-cols-4"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  type="button"
                  aria-selected={isSelected}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669] ${
                    isSelected
                      ? 'bg-white text-[#047857] shadow-xs border border-[#E2E8F0]'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isSelected ? 'text-[#059669]' : 'text-slate-500'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="hidden sm:inline truncate">{locale.tabs[tab.id].label}</span>
                  <span className="sm:hidden truncate">{locale.tabs[tab.id].shortLabel}</span>
                </button>
              );
            })}
          </div>

          <div role="tabpanel">
            {activeTab === 'formatter' && (
              <MessageFormatter
                locale={locale}
                value={formatterText}
                onChange={setFormatterText}
                onSendToLink={(text) => {
                  setLinkMessage(text);
                  setActiveTab('link');
                }}
                onSaveMessage={(text) => handleSaveMessage(text)}
              />
            )}

            {activeTab === 'link' && (
              <LinkGenerator
                locale={locale}
                countryCode={countryCode}
                phone={phone}
                message={linkMessage}
                onCountryCodeChange={setCountryCode}
                onPhoneChange={setPhone}
                onMessageChange={setLinkMessage}
                onSaveLink={handleSaveLink}
              />
            )}

            {activeTab === 'replies' && (
              <QuickReplies
                locale={locale}
                onSendToEditor={(text) => {
                  setFormatterText(text);
                  setActiveTab('formatter');
                }}
                onSaveMessage={(text, label) => handleSaveMessage(text, label)}
              />
            )}

            {activeTab === 'canvas' && <CanvasMaker locale={locale} isRtl={isRtl} />}
          </div>
        </section>

        {/* Saved Local Library, JSON Backup & Print Sheet */}
        <SavedLibrary
          locale={locale}
          messages={savedMessages}
          links={savedLinks}
          notes={notes}
          onNotesChange={handleNotesChange}
          onLoadMessage={(text) => {
            setFormatterText(text);
            setActiveTab('formatter');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onDeleteMessage={handleDeleteMessage}
          onLoadLink={(item) => {
            setCountryCode(item.countryCode);
            setPhone(item.phone);
            setLinkMessage(item.message);
            setActiveTab('link');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onDeleteLink={handleDeleteLink}
          onImportBackup={handleImportBackup}
        />

        {/* Mid-Page Media.net Ad Slot (Between Workspace/Library and Editorial SEO Section) */}
        <AdSlot
          slotId="medianet-mid-banner"
          placementLabel="Media.net Responsive Ad Slot — Mid-Page"
          minHeightPx={100}
        />

        {/* Editorial SEO Guide, FAQ Accordion & Contextual Affiliate Gear */}
        <EditorialSection locale={locale} />

        {/* Bottom Media.net Ad Slot (End of Page) */}
        <AdSlot
          slotId="medianet-footer-banner"
          placementLabel="Media.net Responsive Ad Slot — Footer"
          minHeightPx={100}
        />
      </main>

      <Footer locale={locale} />
    </div>
  );
}
