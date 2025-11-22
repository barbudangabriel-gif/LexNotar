import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ro' ? 'en' : 'ro';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="p-2 text-white hover:bg-indigo-700 rounded-lg transition-colors"
      title={i18n.language === 'ro' ? 'Switch to English' : 'Schimbă în Română'}
      aria-label="Language switcher"
    >
      <Globe className="w-5 h-5" />
      <span className="ml-1 text-xs font-semibold uppercase">
        {i18n.language === 'ro' ? 'EN' : 'RO'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
