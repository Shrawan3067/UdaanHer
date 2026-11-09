import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex items-center bg-gray-100 p-0.5 rounded-full border border-gray-200/80 shadow-2xs ${className}`}
    >
      <button
        type="button"
        onClick={() => setLanguage('EN')}
        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all duration-150 cursor-pointer ${
          language === 'EN'
            ? 'bg-[#EA3C36] text-white shadow-xs'
            : 'text-gray-600 hover:text-[#EA3C36]'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('HI')}
        className={`px-2.5 py-0.5 rounded-full text-[11px] font-hindi font-bold transition-all duration-150 cursor-pointer ${
          language === 'HI'
            ? 'bg-[#EA3C36] text-white shadow-xs'
            : 'text-gray-600 hover:text-[#EA3C36]'
        }`}
      >
        हिं
      </button>
    </div>
  );
};
