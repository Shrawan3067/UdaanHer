import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  HI: {
    // Nav
    'nav.schemes': 'योजनाएं',
    'nav.eligibility': 'पात्रता जांचें',
    'nav.campaigns': 'अभियान',
    'nav.donate': 'दान करें',
    'nav.login': 'लॉग इन',
    'nav.register': 'पंजीकरण',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.adminDashboard': 'प्रशासक पोर्टल',
    'nav.logout': 'लॉग आउट',

    // Hero
    'hero.tagline': 'हर महिला के लिए एक बेहतर अवसर।',
    'hero.subtitle': 'सरकारी योजनाओं को जानें, अपने लिए सही अवसर खोजें और महिलाओं के सशक्तिकरण में योगदान दें।',
    'hero.ctaScheme': 'योजनाएं खोजें',
    'hero.ctaDonate': 'अभी दान करें',

    // Sections
    'home.schemesTitle': 'प्रमुख महिला कल्याण योजनाएं',
    'home.schemesSubtitle': 'मध्य प्रदेश शासन एवं केंद्र सरकार की सत्यापित योजनाएं',
    'home.byNeedTitle': 'ज़रूरत के अनुसार खोजें',
    'home.byDistrictTitle': 'ज़िले के अनुसार खोजें',
    'home.eligibilityPromoTitle': 'क्या आप पात्र हैं? 2 मिनट में जानें',
    'home.eligibilityPromoText': 'सरल 6 प्रश्नों के उत्तर दें और अपने लिए उपयुक्त सभी योजनाओं की तत्काल सूची पाएं।',
    'home.eligibilityPromoButton': 'पात्रता कैलकुलेटर शुरू करें',
    'home.campaignsTitle': 'सक्रिय सामाजिक प्रभाव अभियान',
    'home.impactTitle': 'ट्रस्ट का सामाजिक प्रभाव',
    'home.transparencyTitle': 'पारदर्शिता एवं 80G कर छूट',
    'home.viewAllSchemes': 'सभी योजनाएं देखें',
    'home.viewAllCampaigns': 'सभी अभियान देखें',

    // Scheme Details
    'scheme.benefit': 'प्राप्त होने वाला लाभ',
    'scheme.whoCanApply': 'कौन आवेदन कर सकता है',
    'scheme.requiredDocuments': 'आवश्यक दस्तावेज़',
    'scheme.howToApply': 'आवेदन कैसे करें',
    'scheme.helpCentre': 'निकटतम सहायता केंद्र',
    'scheme.officialSource': 'आधिकारिक स्रोत पोर्टल',
    'scheme.lastVerified': 'अंतिम सत्यापन',
    'scheme.requestCallback': 'सहायता हेतु कॉल का अनुरोध करें',

    // Eligibility
    'eligibility.title': 'महिला कल्याण पात्रता कैलकुलेटर',
    'eligibility.subtitle': 'सटीक, सुरक्षित एवं गोपनीय मिलान',
    'eligibility.step': 'चरण',
    'eligibility.of': 'का',
    'eligibility.next': 'आगे बढ़ें',
    'eligibility.prev': 'पिछला',
    'eligibility.findMatches': 'पात्र योजनाएं खोजें',
    'eligibility.resultsTitle': 'आपके लिए उपयुक्त योजनाएं',

    // Common
    'common.searchPlaceholder': 'योजना का नाम या कीवर्ड खोजें...',
    'common.allCategories': 'सभी श्रेणियां',
    'common.allDistricts': 'सभी 9 ज़िले',
    'common.verified': 'सत्यापित योजना',
    'common.testModeBadge': 'परीक्षण मोड (Test Mode)',
    'common.taxDeduction': 'धारा 80G के तहत 50% आयकर छूट',
  },
  EN: {
    // Nav
    'nav.schemes': 'Schemes',
    'nav.eligibility': 'Check Eligibility',
    'nav.campaigns': 'Campaigns',
    'nav.donate': 'Donate Now',
    'nav.login': 'Log In',
    'nav.register': 'Register',
    'nav.dashboard': 'Donor Portal',
    'nav.adminDashboard': 'Admin Portal',
    'nav.logout': 'Log Out',

    // Hero
    'hero.tagline': 'Every Woman Deserves an Opportunity to Thrive.',
    'hero.subtitle': 'Discover verified government welfare schemes, check your eligibility in minutes, and empower grassroots women.',
    'hero.ctaScheme': 'Find Your Scheme',
    'hero.ctaDonate': 'Donate Now',

    // Sections
    'home.schemesTitle': 'Featured Women Welfare Schemes',
    'home.schemesSubtitle': 'Verified welfare schemes across Madhya Pradesh and Central Government',
    'home.byNeedTitle': 'Browse by Need',
    'home.byDistrictTitle': 'Browse by District',
    'home.eligibilityPromoTitle': 'Are you eligible? Check in 2 minutes',
    'home.eligibilityPromoText': 'Answer 6 simple questions and instantly discover state welfare schemes tailored to you.',
    'home.eligibilityPromoButton': 'Start Eligibility Finder',
    'home.campaignsTitle': 'Active Social Impact Campaigns',
    'home.impactTitle': 'Trust Community Impact',
    'home.transparencyTitle': 'Transparency & 80G Tax Benefits',
    'home.viewAllSchemes': 'View All Schemes',
    'home.viewAllCampaigns': 'View All Campaigns',

    // Scheme Details
    'scheme.benefit': 'Official Benefit',
    'scheme.whoCanApply': 'Who Can Apply',
    'scheme.requiredDocuments': 'Required Documents',
    'scheme.howToApply': 'Application Process',
    'scheme.helpCentre': 'Nearest Help Centre',
    'scheme.officialSource': 'Official Source Portal',
    'scheme.lastVerified': 'Last Verified',
    'scheme.requestCallback': 'Request Helpline Callback',

    // Eligibility
    'eligibility.title': 'Welfare Eligibility Calculator',
    'eligibility.subtitle': 'Deterministic, confidential, and instant evaluation',
    'eligibility.step': 'Step',
    'eligibility.of': 'of',
    'eligibility.next': 'Next Step',
    'eligibility.prev': 'Previous',
    'eligibility.findMatches': 'Calculate Eligible Schemes',
    'eligibility.resultsTitle': 'Your Eligible Schemes',

    // Common
    'common.searchPlaceholder': 'Search scheme by title, keyword, or code...',
    'common.allCategories': 'All Categories',
    'common.allDistricts': 'All 9 Districts',
    'common.verified': 'Verified Official Scheme',
    'common.testModeBadge': 'Simulation Mode (Test Mode)',
    'common.taxDeduction': '50% Income Tax Exemption under Sec 80G',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('udaanher_lang') || localStorage.getItem('sakhisetu_lang');
    return (saved as Language) || 'HI'; // Default to Hindi as per prompt
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('udaanher_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['EN'][key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = language.toLowerCase();
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

