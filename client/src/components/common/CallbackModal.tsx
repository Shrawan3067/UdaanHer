import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { X, Headphones, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

interface CallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  schemeCode?: string;
  schemeName?: string;
}

const MP_DISTRICTS = [
  'Bhopal',
  'Sehore',
  'Raisen',
  'Rajgarh',
  'Vidisha',
  'Hoshangabad',
  'Harda',
  'Betul',
  'Guna',
];

export const CallbackModal: React.FC<CallbackModalProps> = ({
  isOpen,
  onClose,
  schemeCode,
  schemeName,
}) => {
  const { language } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Bhopal');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await api.requestHelplineCallback({
        name,
        phone,
        district,
        schemeCode,
        notes: notes || (schemeName ? `Inquiry regarding: ${schemeName}` : undefined),
      });

      setSuccessMessage(res.message);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit callback request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden relative p-6 sm:p-7 space-y-5 animate-slideUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-red-50 text-[#EA3C36] flex items-center justify-center shadow-xs border border-red-100">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h3 id="modal-title" className="text-base font-bold text-[#1A1A1A]">
              {language === 'HI' ? 'उड़ानहर सहायता अनुरोध' : 'Request UdaanHer Guidance'}
            </h3>
            <p className="text-xs text-gray-500">
              {language === 'HI'
                ? 'हमारे उड़ानहर ज़मीनी कार्यकर्ता निःशुल्क सहायता हेतु आपसे संपर्क करेंगे'
                : 'A certified UdaanHer field facilitator will assist you for free'}
            </p>
          </div>
        </div>

        {schemeName && (
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs">
            <span className="font-bold text-[#EA3C36]">
              {language === 'HI' ? 'संबंधित योजना:' : 'Program:'}{' '}
            </span>
            <span className="text-gray-800 font-medium">{schemeName}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 border border-emerald-200 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 text-[#EA3C36] text-xs font-semibold flex items-center gap-2 border border-red-200 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {!successMessage && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Applicant Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sunita Bai"
                className="w-full px-3.5 py-2.5 rounded-lg bg-gray-50 text-sm text-[#1A1A1A] border border-gray-200 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-[#EA3C36]/20 focus:border-[#EA3C36] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Phone Number (10 digits) *</label>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="98XXXXXXXX"
                className="w-full px-3.5 py-2.5 rounded-lg bg-gray-50 text-sm text-[#1A1A1A] border border-gray-200 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-[#EA3C36]/20 focus:border-[#EA3C36] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">District in MP</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-gray-50 text-sm text-[#1A1A1A] border border-gray-200 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-[#EA3C36]/20 focus:border-[#EA3C36] transition-all cursor-pointer font-medium"
              >
                {MP_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Notes or Assistance Needed</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Need assistance gathering death certificate & BPL card"
                className="w-full px-3.5 py-2.5 rounded-lg bg-gray-50 text-sm text-[#1A1A1A] border border-gray-200 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-[#EA3C36]/20 focus:border-[#EA3C36] transition-all"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || phone.length < 10}
                className="px-5 py-2.5 rounded-lg bg-[#EA3C36] hover:bg-[#D32F2F] text-white text-xs font-bold shadow-xs hover-lift transition-all disabled:opacity-50 cursor-pointer active:scale-98"
              >
                {isSubmitting ? 'Submitting...' : 'Request Free Callback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
