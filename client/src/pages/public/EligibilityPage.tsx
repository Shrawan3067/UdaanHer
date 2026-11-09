import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { EligibilityResult } from '../../types';
import { CallbackModal } from '../../components/common/CallbackModal';
import {
  CheckCircle2,
  Circle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Printer,
  ShieldCheck,
  Zap,
  Users,
  CreditCard,
  Building,
  HeartHandshake,
  Headphones,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

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

const AGE_RANGES = [
  { id: '18-25', min: 18, max: 25, label: '18–25 Years', labelHi: '18–25 वर्ष (युवा)', desc: 'Higher education & skill programs' },
  { id: '26-40', min: 26, max: 40, label: '26–40 Years', labelHi: '26–40 वर्ष', desc: 'Maternal health & enterprise credit' },
  { id: '41-59', min: 41, max: 59, label: '41–59 Years', labelHi: '41–59 वर्ष', desc: 'SHG loans & micro-enterprise funds' },
  { id: '60+', min: 60, max: 80, label: '60+ Years', labelHi: '60+ वर्ष (वरिष्ठ)', desc: 'Senior citizen social security pension' },
];

const WORK_CATEGORIES = [
  { id: 'Homemaker', label: 'Homemaker', labelHi: 'गृहिणी', desc: 'Focusing on family, caregiving, and household welfare' },
  { id: 'Agriculture', label: 'Farmer / Farming', labelHi: 'कृषि / किसान', desc: 'Cultivator, smallholder, or agricultural worker' },
  { id: 'Daily Wage Labourer', label: 'Daily Wage Labourer', labelHi: 'दैनिक मजदूर', desc: 'Engaged in seasonal manual or unorganized labor' },
  { id: 'Small Artisan/Self-Employed', label: 'Artisan / Self-Employed', labelHi: 'कारीगर / उद्यमी', desc: 'Handicrafts, weaving, retail shop, or micro-enterprise' },
];

export const EligibilityPage: React.FC = () => {
  const { language } = useLanguage();

  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Answers State
  const [district, setDistrict] = useState('Sehore');
  const [ageRange, setAgeRange] = useState('26-40');
  const [age, setAge] = useState<number>(32);
  const [occupation, setOccupation] = useState('Homemaker');
  const [maritalStatus, setMaritalStatus] = useState<'unmarried' | 'married' | 'widowed' | 'divorced'>('widowed');
  const [isSHGMember, setIsSHGMember] = useState<boolean>(true);
  const [hasBPLCard, setHasBPLCard] = useState<boolean>(true);
  const [isPregnantOrNewMother, setIsPregnantOrNewMother] = useState<boolean>(false);

  // Results State
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Callback inline form
  const [callbackVillage, setCallbackVillage] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackSuccess, setCallbackSuccess] = useState(false);
  const [callbackLoading, setCallbackLoading] = useState(false);

  // Callback Modal State
  const [callbackModal, setCallbackModal] = useState<{
    isOpen: boolean;
    schemeCode?: string;
    schemeName?: string;
  }>({ isOpen: false });

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleEvaluate();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    setError(null);

    try {
      const data = await api.matchEligibility({
        district,
        age: Number(age),
        occupation,
        maritalStatus,
        isSHGMember,
        hasBPLCard,
        isPregnantOrNewMother,
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate eligibility. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const resetCalculator = () => {
    setResult(null);
    setStep(1);
    setError(null);
  };

  const submitInlineCallback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackPhone || callbackPhone.length < 10) return;
    setCallbackLoading(true);
    try {
      await api.requestCallback({
        applicantName: 'Anonymous Applicant',
        phoneNumber: callbackPhone,
        preferredTime: 'Morning',
        district,
        villagePanchayat: callbackVillage || 'Local Gram Panchayat',
        notes: `Submitted from screener (Status: ${maritalStatus}, Age: ${age})`,
      });
      setCallbackSuccess(true);
      setCallbackPhone('');
      setCallbackVillage('');
    } catch (err: any) {
      alert(err.message || 'Failed to submit callback request.');
    } finally {
      setCallbackLoading(false);
    }
  };

  const stepLabels = [
    { num: '01', title: 'District', val: district },
    { num: '02', title: 'Age', val: ageRange },
    { num: '03', title: 'Work', val: occupation.split('/')[0].trim() },
    {
      num: '04',
      title: 'Status',
      val: maritalStatus === 'widowed' ? 'Widowed (कल्याणी)' : maritalStatus,
    },
    { num: '05', title: 'SHG', val: isSHGMember ? 'Yes (SHG)' : 'No' },
    { num: '06', title: 'Ration', val: hasBPLCard ? 'BPL Card' : 'General' },
  ];

  return (
    <div className="relative w-full overflow-hidden bg-white text-[#1A1A1A]">
      {/* Header Banner */}
      <section className="w-full bg-[#F8F9FA] py-10 px-6 lg:px-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#EA3C36] text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#EA3C36] animate-pulse"></span>
              <span>Updated 2024–25 Government Rules</span>
            </div>
          </div>

          {/* Privacy Notice Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-gray-700 text-xs font-semibold border border-gray-200 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#EA3C36]" />
            <span>
              <strong>100% Free &amp; Anonymous</strong> • No Aadhaar, phone number, or OTP required
            </span>
          </div>

          {/* Main Title & Bilingual Intro */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-3">
              <span className="text-xs uppercase tracking-wider text-[#EA3C36] font-bold">
                2-MINUTE CONFIDENTIAL SCREENER
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A1A1A] tracking-tight leading-tight">
                Find Welfare Programs You Are Eligible For
              </h1>
              <p className="text-gray-600 text-base leading-relaxed max-w-2xl">
                सरल ६ सवालों के जवाब दें और अपनी पात्रता अनुसार सरकारी योजनाएं खोजें। We match your household situation against verified Central and Madhya Pradesh welfare programs with clear documentation steps.
              </p>
            </div>

            {/* Quick Benefits Tray */}
            <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-[#EA3C36] shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Takes ~2 Minutes</p>
                  <p className="text-[11px] text-gray-500">6 simple anonymous questions</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#00A3C4] shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Zero Identity Risk</p>
                  <p className="text-[11px] text-gray-500">No personal data logged</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-[#EA3C36] shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Instant Sanction Checklist</p>
                  <p className="text-[11px] text-gray-500">Immediate document checklist</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Questionnaire Container */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-10">
        {/* Evaluating State */}
        {isEvaluating && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto text-[#EA3C36]">
              <span className="material-symbols-outlined text-3xl animate-spin">refresh</span>
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">
              Evaluating Rules Against Welfare Databases...
            </h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Matching your inputs with verified eligibility rules for Sehore, Bhopal, Raisen, and other districts.
            </p>
          </div>
        )}

        {/* QUESTIONNAIRE INTERFACE */}
        {!isEvaluating && !result && (
          <section className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 sm:p-8 lg:p-10 space-y-8">
            {/* Stepper Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-gray-100 pb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#EA3C36] font-bold">
                    QUESTION {step} OF 6
                  </span>
                  <h2 className="text-xl font-bold text-[#1A1A1A] mt-0.5">
                    {step === 1 && 'District of Residence (निवास ज़िला)'}
                    {step === 2 && 'Applicant Age Bracket (आयु सीमा)'}
                    {step === 3 && 'Livelihood & Occupation (व्यवसाय / आजीविका)'}
                    {step === 4 && 'Marital & Family Status (वैवाहिक स्थिति)'}
                    {step === 5 && 'Self-Help Group Affiliation (स्वयं सहायता समूह)'}
                    {step === 6 && 'Household Ration Card Status (राशन कार्ड)'}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">
                    {Math.round((step / 6) * 100)}% Completed
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-[#EA3C36] text-[11px] font-bold">
                    Step {step}
                  </span>
                </div>
              </div>

              {/* Red Cross Progress Rail */}
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#EA3C36] h-full transition-all duration-300"
                  style={{ width: `${(step / 6) * 100}%` }}
                ></div>
              </div>

              {/* Step Summary Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2">
                {stepLabels.map((sl, idx) => {
                  const isDone = idx + 1 < step;
                  const isCurrent = idx + 1 === step;
                  return (
                    <div
                      key={sl.num}
                      className={`px-3 py-2 rounded-lg border text-xs transition-all flex items-center gap-2 ${
                        isDone
                          ? 'bg-gray-50 border-gray-200 text-gray-700'
                          : isCurrent
                          ? 'bg-red-50/60 border-[#EA3C36] text-[#EA3C36]'
                          : 'bg-white border-gray-200 text-gray-400 opacity-60'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-[#EA3C36] shrink-0" />
                      ) : isCurrent ? (
                        <div className="w-2 h-2 rounded-full bg-[#EA3C36] shrink-0 animate-pulse" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase font-bold tracking-wider truncate">
                          {sl.title}
                        </p>
                        <p className="font-bold text-xs truncate">
                          {sl.val}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Question Options Body */}
            <div className="space-y-6 pt-2">
              {/* Step 1: District */}
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    मध्य प्रदेश का अपना निवास ज़िला चुनें। Schemes are matched based on applicable administrative jurisdictions.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {MP_DISTRICTS.map((d) => {
                      const isSelected = district === d;
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDistrict(d)}
                          className={`p-4 rounded-xl text-left transition-all border flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'border-[#EA3C36] bg-red-50 text-[#EA3C36] shadow-xs'
                              : 'border-gray-200 hover:border-gray-300 bg-white text-gray-800'
                          }`}
                        >
                          <span className="font-bold text-sm">{d}</span>
                          {isSelected ? (
                            <CheckCircle2 className="w-5 h-5 text-[#EA3C36]" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: Age Bracket */}
              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    आवेदक की आयु सीमा चुनें। Age is a statutory prerequisite for youth skilling, maternal cash grants, and old-age social security.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {AGE_RANGES.map((ar) => {
                      const isSelected = ageRange === ar.id;
                      return (
                        <button
                          key={ar.id}
                          type="button"
                          onClick={() => {
                            setAgeRange(ar.id);
                            setAge(Math.round((ar.min + ar.max) / 2));
                          }}
                          className={`p-5 rounded-xl text-left transition-all border flex flex-col justify-between space-y-3 cursor-pointer ${
                            isSelected
                              ? 'border-[#EA3C36] bg-red-50 text-[#EA3C36] shadow-xs'
                              : 'border-gray-200 hover:border-gray-300 bg-white text-gray-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/80 border border-gray-100">
                              {ar.labelHi}
                            </span>
                            {isSelected ? (
                              <CheckCircle2 className="w-5 h-5 text-[#EA3C36]" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                          <div>
                            <p className="font-extrabold text-base">{ar.label}</p>
                            <p className="text-xs text-gray-500 mt-1">{ar.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Occupation */}
              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    आवेदक की वर्तमान आजीविका या कार्यक्षेत्र चुनें। Matches enterprise subsidies, artisan toolkits, and NRLM credit.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {WORK_CATEGORIES.map((wc) => {
                      const isSelected = occupation === wc.id;
                      return (
                        <button
                          key={wc.id}
                          type="button"
                          onClick={() => setOccupation(wc.id)}
                          className={`p-5 rounded-xl text-left transition-all border flex flex-col justify-between space-y-2 cursor-pointer ${
                            isSelected
                              ? 'border-[#EA3C36] bg-red-50 text-[#EA3C36] shadow-xs'
                              : 'border-gray-200 hover:border-gray-300 bg-white text-gray-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-base">{wc.label}</p>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                              {wc.labelHi}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed">{wc.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 4: Marital Status */}
              {step === 4 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    आवेदक की वर्तमान वैवाहिक स्थिति चुनें। Enables matching with specific pension, remarriage grant, or single-mother benefit programs.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        id: 'widowed',
                        label: 'Widowed',
                        labelHi: 'कल्याणी / विधवा',
                        desc: 'Qualifies for MP Kalyani Social Security Pension (₹600/month) and child education aid.',
                      },
                      {
                        id: 'married',
                        label: 'Married',
                        labelHi: 'विवाहित',
                        desc: 'Eligible for maternal health incentives (PMMVY), Ladli Behna, and joint SHG loans.',
                      },
                      {
                        id: 'unmarried',
                        label: 'Single / Unmarried',
                        labelHi: 'अविवाहित (18+ वर्ष)',
                        desc: 'Access higher skill training, entrepreneurship stipends, and rural credit programs.',
                      },
                      {
                        id: 'divorced',
                        label: 'Separated / Abandoned',
                        labelHi: 'परित्यक्ता / अलग',
                        desc: 'Qualifies for legal aid assistance, safe transition housing, and emergency stipends.',
                      },
                    ].map((st) => {
                      const isSelected = maritalStatus === st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setMaritalStatus(st.id as any)}
                          className={`p-5 rounded-xl text-left transition-all border flex flex-col justify-between space-y-3 cursor-pointer ${
                            isSelected
                              ? 'border-[#EA3C36] bg-red-50 text-[#EA3C36] shadow-xs'
                              : 'border-gray-200 hover:border-gray-300 bg-white text-gray-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/80 border border-gray-100">
                              {st.labelHi}
                            </span>
                            {isSelected ? (
                              <CheckCircle2 className="w-5 h-5 text-[#EA3C36]" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-base">{st.label}</p>
                            <p className="text-xs text-gray-500 mt-1 leading-snug">{st.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 5: SHG Affiliation */}
              {step === 5 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    क्या आप किसी ग्राम स्तरीय स्वयं सहायता समूह (SHG) की सदस्या हैं? DAY-NRLM micro-loans and community investment funds require SHG affiliation.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setIsSHGMember(true)}
                      className={`p-6 rounded-xl text-left transition-all border cursor-pointer ${
                        isSHGMember
                          ? 'border-[#EA3C36] bg-red-50 text-[#EA3C36] shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 bg-white text-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-base">Yes, Active SHG Member</p>
                        <Users className="w-5 h-5 text-[#EA3C36]" />
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Eligible for DAY-NRLM revolving funds, 4% interest subvention, and collective toolkits.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsSHGMember(false)}
                      className={`p-6 rounded-xl text-left transition-all border cursor-pointer ${
                        !isSHGMember
                          ? 'border-[#EA3C36] bg-red-50 text-[#EA3C36] shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 bg-white text-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-base">No, Not in an SHG</p>
                        <Circle className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Matches individual direct pensions, DBT cash allowances, and maternal welfare programs.
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 6: Ration Card & Maternal */}
              {step === 6 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    क्या आपके परिवार के पास गरीबी रेखा (BPL) अथवा अंत्योदय राशन कार्ड है?
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setHasBPLCard(true)}
                      className={`p-6 rounded-xl text-left transition-all border cursor-pointer ${
                        hasBPLCard
                          ? 'border-[#EA3C36] bg-red-50 text-[#EA3C36] shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 bg-white text-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-base">Yes, BPL / Antyodaya Card</p>
                        <CreditCard className="w-5 h-5 text-[#EA3C36]" />
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Unlocks maximum income-subsidized benefits, free healthcare desks, and full state fee exemptions.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHasBPLCard(false)}
                      className={`p-6 rounded-xl text-left transition-all border cursor-pointer ${
                        !hasBPLCard
                          ? 'border-[#EA3C36] bg-red-50 text-[#EA3C36] shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 bg-white text-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-base">No BPL Card (General / APL)</p>
                        <Circle className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Universal entitlement schemes (e.g. Ladli Behna, PMMVY, youth skilling) remain fully open.
                      </p>
                    </button>
                  </div>

                  {/* Maternal Healthcare Add-on */}
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 mt-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPregnantOrNewMother}
                        onChange={(e) => setIsPregnantOrNewMother(e.target.checked)}
                        className="w-4 h-4 mt-1 rounded text-[#EA3C36] focus:ring-[#EA3C36]"
                      />
                      <div>
                        <p className="text-xs font-bold text-gray-900">
                          Currently Pregnant or Nursing First Child (गर्भवती अथवा धात्री माता)
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Check this to match Pradhan Mantri Matru Vandana Yojana (PMMVY 2.0 direct ₹5,000 cash grant).
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Stepper Footer & Next/Prev Controls */}
            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <HelpCircle className="w-4 h-4 text-[#EA3C36]" />
                <span>100% confidential. No personal identity data is stored or forwarded.</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="px-5 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-7 py-3 rounded-lg bg-[#EA3C36] hover:bg-[#D32F2F] text-white text-xs font-bold transition-all shadow-md hover-lift flex items-center gap-2 cursor-pointer"
                >
                  <span>{step === 6 ? 'Find My Eligible Schemes' : `Continue to Next (Step ${step + 1})`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* MATCHED RESULTS VIEW                                      */}
        {/* ========================================================= */}
        {!isEvaluating && result && (
          <div className="space-y-10 animate-fadeIn">
            {/* Top Results Headline Bar */}
            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EA3C36] animate-pulse"></span>
                  <h2 className="text-2xl font-extrabold text-[#1A1A1A]">
                    {result.eligibleSchemes.length} Programs Match Your Profile
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-[#EA3C36] text-xs font-bold">
                    95%+ Confidence
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Profile: District: {district} • Age: {ageRange} • Status: {maritalStatus} • SHG: {isSHGMember ? 'Yes' : 'No'} • Ration: {hasBPLCard ? 'BPL' : 'General'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center gap-1.5 transition-colors border border-gray-200 cursor-pointer"
                  type="button"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Checklist</span>
                </button>
                <button
                  onClick={resetCalculator}
                  className="px-4 py-2 rounded-lg bg-[#EA3C36] hover:bg-[#D32F2F] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  type="button"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Recalculate</span>
                </button>
              </div>
            </section>

            {/* Matched Schemes Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {result.eligibleSchemes.map((scheme, idx) => (
                <article
                  key={scheme.schemeId}
                  className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 sm:p-7 space-y-5 flex flex-col justify-between hover-lift transition-all"
                >
                  <div className="space-y-4">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-red-50 text-[#EA3C36] text-xs font-bold">
                        {scheme.schemeCode}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00A3C4]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {idx === 0 ? '98% High Match' : idx === 1 ? '95% Match' : '92% Match'}
                      </span>
                    </div>

                    {/* Scheme Title & Benefit */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-[#1A1A1A] leading-snug">
                        {scheme.name}
                      </h3>
                      {scheme.nameHi && (
                        <p className="text-xs font-bold text-[#EA3C36] font-hindi">
                          {scheme.nameHi}
                        </p>
                      )}

                      {/* Financial Benefit Callout */}
                      <div className="p-3.5 rounded-lg bg-gray-50 flex items-center justify-between border border-gray-100 mt-2">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                            Sanctioned Direct Benefit
                          </p>
                          <p className="text-xl font-extrabold text-[#1A1A1A]">
                            {scheme.benefit.split('(')[0] || 'Direct Transfer'}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-red-50 text-[#EA3C36] text-[10px] font-bold">
                          DBT Direct
                        </span>
                      </div>
                    </div>

                    {/* Matched Reasoning Box */}
                    <div className="p-3 rounded-lg bg-red-50/50 text-[#1A1A1A] text-xs flex items-start gap-2 border border-red-100">
                      <CheckCircle2 className="w-4 h-4 text-[#EA3C36] shrink-0 mt-0.5" />
                      <span>
                        <strong>Why you matched:</strong> {scheme.matchingReasons?.join(' ') || scheme.benefit}
                      </span>
                    </div>

                    {/* Documents Needed Tags */}
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                        Required Documents Checklist
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-0.5 rounded bg-gray-100 text-gray-700 text-xs">
                          Samagra ID (समग्र)
                        </span>
                        <span className="px-2.5 py-0.5 rounded bg-gray-100 text-gray-700 text-xs">
                          Aadhaar Card
                        </span>
                        <span className="px-2.5 py-0.5 rounded bg-gray-100 text-gray-700 text-xs">
                          Active Bank Passbook
                        </span>
                        <span className="px-2.5 py-0.5 rounded bg-gray-100 text-gray-700 text-xs">
                          Ration Card / BPL
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100">
                    <Link
                      to={`/schemes/${scheme.slug}`}
                      className="w-full sm:flex-1 py-2.5 px-4 rounded-lg bg-[#EA3C36] hover:bg-[#D32F2F] text-white text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>View Guidelines</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() =>
                        setCallbackModal({
                          isOpen: true,
                          schemeCode: scheme.schemeCode,
                          schemeName: scheme.name,
                        })
                      }
                      className="w-full sm:w-auto py-2.5 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors border border-gray-200 flex items-center justify-center gap-1.5 cursor-pointer"
                      type="button"
                    >
                      <Headphones className="w-4 h-4 text-[#EA3C36]" />
                      <span>Ask Volunteer</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Grassroots Free Doorstep Helpdesk Box */}
            <section className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-3">
                  <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#EA3C36] font-bold">
                    <HeartHandshake className="w-4 h-4 text-[#EA3C36]" />
                    <span>Free Doorstep Community Support</span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-[#1A1A1A]">
                    Need Help Filing? Certified Community Volunteers Can Assist You for Free
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Don't worry if document verification feels confusing. In {district} district, trained{' '}
                    <strong>volunteers</strong> visit Gram Panchayats weekly. They will print your checklist, review your Samagra ID, and help prepare your file for the Gram Panchayat Secretary with zero facilitation fees.
                  </p>
                </div>

                {/* Inline Callback Card */}
                <div className="lg:col-span-4 bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-[#EA3C36]" />
                    <p className="text-xs font-bold text-gray-900">Request a Free Callback</p>
                  </div>

                  {callbackSuccess ? (
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs text-center border border-red-200">
                      <p className="font-bold">धन्यवाद! Callback Scheduled.</p>
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        Our facilitator for {district} will contact you shortly.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={submitInlineCallback} className="space-y-2">
                      <input
                        value={callbackVillage}
                        onChange={(e) => setCallbackVillage(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white text-xs border border-gray-300 focus:border-[#EA3C36] focus:outline-hidden"
                        placeholder="Village / Gram Panchayat"
                        type="text"
                      />
                      <input
                        value={callbackPhone}
                        onChange={(e) => setCallbackPhone(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-lg bg-white text-xs border border-gray-300 focus:border-[#EA3C36] focus:outline-hidden"
                        placeholder="Mobile Number (10 digits)"
                        type="tel"
                      />
                      <button
                        type="submit"
                        disabled={callbackLoading}
                        className="w-full py-2 bg-[#EA3C36] hover:bg-[#D32F2F] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {callbackLoading ? 'Scheduling...' : 'Connect With Field Volunteer'}
                      </button>
                    </form>
                  )}
                  <p className="text-[10px] text-gray-400 text-center leading-tight">
                    We never share your phone number with commercial agents.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Callback Modal Component */}
      <CallbackModal
        isOpen={callbackModal.isOpen}
        onClose={() => setCallbackModal({ isOpen: false })}
        schemeCode={callbackModal.schemeCode}
        schemeName={callbackModal.schemeName}
      />
    </div>
  );
};
