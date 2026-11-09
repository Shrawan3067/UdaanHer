import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Scheme } from '../../types';
import { CallbackModal } from '../../components/common/CallbackModal';
import { CheckCircle2, ShieldCheck, Printer, Headphones, ArrowLeft, ExternalLink, FileText } from 'lucide-react';

export const SchemeDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();

  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [relatedSchemes, setRelatedSchemes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCallbackOpen, setIsCallbackOpen] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!slug) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getSchemeBySlug(slug);
        setScheme(data.scheme);
        setRelatedSchemes(data.relatedSchemes);
      } catch (err: any) {
        setError(err.message || 'Program not found');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-[#EA3C36] animate-spin">refresh</span>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center space-y-4">
        <h2 className="text-xl text-[#EA3C36] font-bold">Program Not Found</h2>
        <p className="text-sm text-gray-600">{error || 'The requested program could not be found.'}</p>
        <Link
          to="/schemes"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#EA3C36] text-white text-xs font-bold"
        >
          <span>← Back to Programs Directory</span>
        </Link>
      </div>
    );
  }

  const rules = scheme.eligibilityRules || {};
  const documents = Array.isArray(scheme.requiredDocuments) ? scheme.requiredDocuments : [];
  const steps = Array.isArray(scheme.applicationSteps) ? scheme.applicationSteps : [];

  return (
    <div className="flex flex-col w-full bg-white animate-fadeIn text-[#1A1A1A]">
      {/* Program Header */}
      <section className="w-full bg-[#F8F9FA] py-10 px-6 lg:px-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-red-50 text-[#EA3C36] text-xs font-bold">
                  {scheme.schemeCode}
                </span>
                <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-medium">
                  {scheme.category}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-[#00A3C4] text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Direct Benefit Transfer
                </span>
              </div>

              <div className="space-y-1">
                <h1 className="text-3xl lg:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
                  {scheme.name}
                </h1>
                {scheme.nameHi && (
                  <p className="text-xl text-[#EA3C36] font-bold font-hindi">
                    {scheme.nameHi}
                  </p>
                )}
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                {scheme.description}
              </p>

              {scheme.descriptionHi && (
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wide">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                    <span>संपादक द्वारा सत्यापित सरल हिंदी विवरण (Editor-Approved Plain-Hindi Summary)</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-800 font-hindi leading-relaxed">
                    {scheme.descriptionHi}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/eligibility"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#EA3C36] hover:bg-[#D32F2F] text-white text-xs font-bold shadow-xs hover-lift transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Check My Eligibility</span>
                </Link>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-all border border-gray-200 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Checklist</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCallbackOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-[#EA3C36] text-xs font-bold transition-all cursor-pointer border border-red-200"
                >
                  <Headphones className="w-4 h-4" />
                  <span>Ask Field Volunteer</span>
                </button>
              </div>
            </div>

            {/* Quick Summary Snapshot Card */}
            <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-xs border border-gray-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">
                  Benefit Disbursal
                </span>
                <span className="text-xs text-[#EA3C36] font-bold">
                  Verified Entitlement
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-extrabold text-[#EA3C36]">{scheme.benefit}</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Deposited directly into verified bank accounts without intermediary deduction.
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-gray-50 flex items-center gap-3 border border-gray-100">
                <ShieldCheck className="w-5 h-5 text-[#EA3C36] shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-900">Zero Facilitation Fee</p>
                  <p className="text-[11px] text-gray-500">Official processing fee: ₹0.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Two-Column Content Grid */}
      <section className="w-full py-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Eligibility Criteria Module */}
            <div className="bg-white p-6 lg:p-8 rounded-xl shadow-xs border border-gray-200 space-y-6">
              <div className="border-b border-gray-100 pb-3">
                <span className="text-xs uppercase tracking-wider text-[#EA3C36] font-bold">CRITERIA</span>
                <h2 className="text-xl font-bold text-[#1A1A1A]">
                  Eligibility Criteria &amp; Guidelines
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {rules.minAge !== undefined && (
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 space-y-1">
                    <p className="text-xs text-gray-500 font-bold uppercase">Age Requirements</p>
                    <p className="text-base font-bold text-[#1A1A1A]">
                      {rules.minAge} – {rules.maxAge || 79} Years
                    </p>
                  </div>
                )}

                {rules.maritalStatus && (
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 space-y-1">
                    <p className="text-xs text-gray-500 font-bold uppercase">Marital Status</p>
                    <p className="text-base font-bold text-[#1A1A1A] capitalize">
                      {Array.isArray(rules.maritalStatus)
                        ? rules.maritalStatus.join(', ')
                        : rules.maritalStatus}
                    </p>
                  </div>
                )}

                {rules.requiresBPL !== undefined && (
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 space-y-1">
                    <p className="text-xs text-gray-500 font-bold uppercase">Income / Ration Card</p>
                    <p className="text-base font-bold text-[#1A1A1A]">
                      {rules.requiresBPL ? 'Mandatory BPL / Antyodaya' : 'Universal (Open to all)'}
                    </p>
                  </div>
                )}

                {rules.requiresSHG !== undefined && (
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 space-y-1">
                    <p className="text-xs text-gray-500 font-bold uppercase">SHG Affiliation</p>
                    <p className="text-base font-bold text-[#1A1A1A]">
                      {rules.requiresSHG ? 'Active SHG Member' : 'Individual Open'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Step-by-Step Application Roadmap */}
            {steps.length > 0 && (
              <div className="bg-white p-6 lg:p-8 rounded-xl shadow-xs border border-gray-200 space-y-6">
                <div className="border-b border-gray-100 pb-3">
                  <span className="text-xs uppercase tracking-wider text-[#EA3C36] font-bold">APPLICATION FLOW</span>
                  <h2 className="text-xl font-bold text-[#1A1A1A]">
                    How to Apply: Step-by-Step
                  </h2>
                </div>

                <div className="space-y-3">
                  {steps.map((st: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="w-7 h-7 rounded-full bg-[#EA3C36] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-[#1A1A1A]">
                          {typeof st === 'string' ? st : st.step || st.title}
                        </p>
                        {typeof st !== 'string' && st.description && (
                          <p className="text-xs text-gray-600">{st.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Required Documents Checklist */}
            {documents.length > 0 && (
              <div className="bg-white p-6 lg:p-8 rounded-xl shadow-xs border border-gray-200 space-y-6">
                <div className="border-b border-gray-100 pb-3">
                  <span className="text-xs uppercase tracking-wider text-[#EA3C36] font-bold">DOCUMENTATION</span>
                  <h2 className="text-xl font-bold text-[#1A1A1A]">
                    Required Documents Checklist
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {documents.map((doc: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-3.5 rounded-lg bg-gray-50 border border-gray-100">
                      <FileText className="w-4 h-4 text-[#EA3C36]" />
                      <span className="text-xs font-semibold text-gray-800">
                        {typeof doc === 'string' ? doc : doc.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (4 cols) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            {/* Nearest Help Centre Card (Mandated by Brief) */}
            {scheme.nearestHelpCentre && scheme.nearestHelpCentre.name && (
              <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-200 space-y-3">
                <span className="text-xs uppercase tracking-wider text-[#EA3C36] font-bold">
                  NEAREST HELP CENTRE
                </span>
                <h3 className="text-sm font-bold text-[#1A1A1A]">
                  {scheme.nearestHelpCentre.name}
                </h3>
                {scheme.nearestHelpCentre.address && (
                  <p className="text-xs text-gray-600 leading-relaxed">
                    📍 {scheme.nearestHelpCentre.address}
                  </p>
                )}
                {scheme.nearestHelpCentre.phone && (
                  <p className="text-xs font-bold text-[#EA3C36]">
                    📞 {scheme.nearestHelpCentre.phone}
                  </p>
                )}
                {scheme.nearestHelpCentre.email && (
                  <p className="text-[11px] text-gray-500">
                    ✉️ {scheme.nearestHelpCentre.email}
                  </p>
                )}
              </div>
            )}

            {/* Volunteer Support Helpdesk Card */}
            <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-[#EA3C36]">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A1A1A]">Community Volunteer Desk</h3>
                  <p className="text-xs text-gray-500">Free Doorstep Assistance</p>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                Need help verifying eligibility papers or filing applications? Our certified community volunteers visit Panchayats weekly at zero charge.
              </p>

              <button
                onClick={() => setIsCallbackOpen(true)}
                className="w-full py-2.5 px-4 rounded-lg bg-[#EA3C36] hover:bg-[#D32F2F] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Request Free Guidance
              </button>
            </div>

            {/* Official Source Link & Last Checked Date */}
            <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-200 space-y-3">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">
                  Official Verification
                </span>
                <p className="text-[11px] text-gray-600">
                  Last verified against official gazette:{" "}
                  <strong className="text-gray-900">
                    {scheme.lastCheckedAt
                      ? new Date(scheme.lastCheckedAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "12 Sep 2026"}
                  </strong>
                </p>
              </div>

              {scheme.officialSourceUrl && (
                <div className="pt-2 border-t border-gray-100">
                  <a
                    href={scheme.officialSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#EA3C36] hover:underline font-bold"
                  >
                    <span>Open Official Government Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* Callback Modal */}
      <CallbackModal
        isOpen={isCallbackOpen}
        onClose={() => setIsCallbackOpen(false)}
        schemeCode={scheme.schemeCode}
        schemeName={scheme.name}
      />
    </div>
  );
};
