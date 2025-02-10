import { createIntl } from '@formatjs/intl';
import type { IntlConfig } from '@formatjs/intl';
import enMessages from '@/locales/en.json';

type RecursiveDotPrefix<TKey extends string, TValue> = TValue extends object
  ? {
      [TSubKey in keyof TValue & string]: RecursiveDotPrefix<
        `${TKey}.${TSubKey}`,
        TValue[TSubKey]
      >;
    }[keyof TValue & string]
  : TKey;

type DotPrefix<T> = {
  [K in keyof T & string]: RecursiveDotPrefix<K, T[K]>;
}[keyof T & string];

export type MessageKeys = DotPrefix<typeof enMessages>;

type SupportedLocales = 'en';

// Flatten nested messages
function flattenMessages(nestedMessages: any, prefix = ''): Record<string, string> {
  return Object.keys(nestedMessages).reduce((messages: any, key) => {
    const value = nestedMessages[key];
    const prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      messages[prefixedKey] = value;
    } else {
      Object.assign(messages, flattenMessages(value, prefixedKey));
    }

    return messages;
  }, {});
}

// Create a type-safe translation function
export function createTranslator(locale: SupportedLocales = 'en') {
  const flattenedMessages: Record<SupportedLocales, Record<string, string>> = {
    en: flattenMessages(enMessages),
  };

  const intl = createIntl({
    locale,
    messages: flattenedMessages[locale],
  } as IntlConfig);

  return {
    t: (id: MessageKeys, values?: Record<string, string | number>) => {
      return intl.formatMessage({ id: id as string }, values);
    },
  };
}

// Create a hook for use in components
export function useTranslations() {
  // For now, we'll just use English
  return createTranslator('en');
} 