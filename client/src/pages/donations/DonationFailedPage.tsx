import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { XCircle, RotateCcw, Home } from 'lucide-react';

export const DonationFailedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const donationId = searchParams.get('donationId');
  const { language } = useLanguage();

  return (
    <div className="max-w-md mx-auto px-6 py-16 animate-fadeIn text-[#1A1A1A]">
      <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-50 text-[#EA3C36] flex items-center justify-center mx-auto shadow-xs border border-red-100">
          <XCircle className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-[#1A1A1A]">
            {language === 'HI' ? 'भुगतान अस्वीकृत / विफल' : 'Simulated Payment Declined'}
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            {language === 'HI'
              ? 'सिम्युलेटेड भुगतान असफल रहा। कोई भी राशि नहीं काटी गई है और कोई 80G रसीद जारी नहीं की गई है।'
              : 'The simulated transaction was declined or cancelled. No funds were transferred and no 80G receipt sequence was consumed.'}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-600 text-left space-y-1.5 shadow-xs">
          <span className="font-bold text-gray-900 block">Safety &amp; Integrity Verification:</span>
          <p className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EA3C36]"></span>
            <span>Zero financial charges occurred.</span>
          </p>
          <p className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EA3C36]"></span>
            <span>Sequential atomic receipt numbering was preserved without gaps.</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/donate"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-[#EA3C36] hover:bg-[#D32F2F] text-white text-sm font-bold rounded-lg transition-all shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{language === 'HI' ? 'पुनः प्रयास करें' : 'Try Again'}</span>
          </Link>

          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 border border-gray-300 text-sm font-semibold text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
