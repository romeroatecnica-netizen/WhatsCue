import type { LanguageCode, LocaleBundle } from './types';
import { en } from './locales/en';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { de } from './locales/de';
import { pt } from './locales/pt';
import { ar } from './locales/ar';
import { hi } from './locales/hi';
import { ru } from './locales/ru';
import { zh } from './locales/zh';
import { ja } from './locales/ja';

export const LOCALES: Record<LanguageCode, LocaleBundle> = {
  en,
  es,
  fr,
  de,
  pt,
  ar,
  hi,
  ru,
  zh,
  ja,
};

export function getLocale(lang: LanguageCode): LocaleBundle {
  return LOCALES[lang] ?? en;
}
