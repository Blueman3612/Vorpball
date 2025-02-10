import { useTranslations } from '@/lib/i18n';
import Image from 'next/image';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    flag: 'https://flagcdn.com/w40/us.png',
  },
];

interface LanguageSelectorProps {
  currentLanguage: string;
}

export function LanguageSelector({ currentLanguage }: LanguageSelectorProps) {
  const { t } = useTranslations();
  const selectedLanguage = languages.find(lang => lang.code === currentLanguage) || languages[0];

  return (
    <div className="relative inline-block w-full">
      <button
        type="button"
        className="w-full flex items-center justify-between gap-2 px-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-center gap-2">
          <div className="relative w-5 h-4 overflow-hidden rounded">
            <Image
              src={selectedLanguage.flag}
              alt={selectedLanguage.name}
              fill
              className="object-cover"
            />
          </div>
          <span className="text-gray-900 dark:text-white">
            {t('common.languages.en')}
          </span>
        </div>
        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
} 