import type { LanguageCode } from '../i18n/types';
import { isSupportedLanguage } from '../config/seo';

export interface SavedMessageItem {
  id: string;
  label: string;
  text: string;
  createdAt: string;
}

export interface SavedLinkItem {
  id: string;
  label: string;
  countryCode: string;
  phone: string;
  message: string;
  url: string;
  createdAt: string;
}

export interface WhatsCueBackupData {
  version: 1;
  exportedAt: string;
  messages: SavedMessageItem[];
  links: SavedLinkItem[];
  notes: string;
}

const KEYS = {
  lang: 'whatscue_lang_v1',
  messages: 'whatscue_saved_messages_v1',
  links: 'whatscue_saved_links_v1',
  notes: 'whatscue_notes_v1',
  draftMessage: 'whatscue_draft_message_v1',
};

export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `wc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function detectInitialLanguage(): LanguageCode {
  if (typeof window === 'undefined') return 'en';

  const params = new URLSearchParams(window.location.search);
  const queryLang = params.get('lang')?.toLowerCase();
  if (isSupportedLanguage(queryLang)) {
    return queryLang;
  }

  try {
    const stored = window.localStorage.getItem(KEYS.lang);
    if (isSupportedLanguage(stored)) {
      return stored;
    }
  } catch {
    // Ignore storage access failures
  }

  const navLangs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const raw of navLangs) {
    if (!raw) continue;
    const base = raw.toLowerCase().split('-')[0];
    if (isSupportedLanguage(base)) {
      return base;
    }
  }

  return 'en';
}

export function persistLanguage(lang: LanguageCode): void {
  try {
    window.localStorage.setItem(KEYS.lang, lang);
  } catch {
    // Ignore storage errors
  }
}

export function loadSavedMessages(): SavedMessageItem[] {
  try {
    const raw = window.localStorage.getItem(KEYS.messages);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistSavedMessages(items: SavedMessageItem[]): void {
  try {
    window.localStorage.setItem(KEYS.messages, JSON.stringify(items));
  } catch {
    // Ignore storage errors
  }
}

export function loadSavedLinks(): SavedLinkItem[] {
  try {
    const raw = window.localStorage.getItem(KEYS.links);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistSavedLinks(items: SavedLinkItem[]): void {
  try {
    window.localStorage.setItem(KEYS.links, JSON.stringify(items));
  } catch {
    // Ignore storage errors
  }
}

export function loadNotes(): string {
  try {
    return window.localStorage.getItem(KEYS.notes) ?? '';
  } catch {
    return '';
  }
}

export function persistNotes(notes: string): void {
  try {
    window.localStorage.setItem(KEYS.notes, notes);
  } catch {
    // Ignore storage errors
  }
}

export function loadDraftMessage(): string | null {
  try {
    return window.localStorage.getItem(KEYS.draftMessage);
  } catch {
    return null;
  }
}

export function persistDraftMessage(text: string): void {
  try {
    window.localStorage.setItem(KEYS.draftMessage, text);
  } catch {
    // Ignore storage errors
  }
}

export function buildBackupPayload(
  messages: SavedMessageItem[],
  links: SavedLinkItem[],
  notes: string
): WhatsCueBackupData {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    messages,
    links,
    notes,
  };
}

export function parseBackupPayload(rawJson: string): WhatsCueBackupData | null {
  try {
    const data = JSON.parse(rawJson);
    if (!data || typeof data !== 'object') return null;
    const messages = Array.isArray(data.messages)
      ? data.messages.filter(
          (m: unknown): m is SavedMessageItem =>
            Boolean(m) &&
            typeof m === 'object' &&
            typeof (m as SavedMessageItem).id === 'string' &&
            typeof (m as SavedMessageItem).text === 'string'
        )
      : [];
    const links = Array.isArray(data.links)
      ? data.links.filter(
          (l: unknown): l is SavedLinkItem =>
            Boolean(l) &&
            typeof l === 'object' &&
            typeof (l as SavedLinkItem).id === 'string' &&
            typeof (l as SavedLinkItem).url === 'string'
        )
      : [];
    const notes = typeof data.notes === 'string' ? data.notes : '';
    return {
      version: 1,
      exportedAt: typeof data.exportedAt === 'string' ? data.exportedAt : new Date().toISOString(),
      messages,
      links,
      notes,
    };
  } catch {
    return null;
  }
}
