import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { api } from "../../services/api";
import { Scheme } from "../../types";
import { CallbackModal } from "../../components/common/CallbackModal";
import { SchemeCardSkeleton } from "../../components/common/LoadingSkeleton";
import {
  Search,
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  Heart,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Building,
  Phone,
  Calendar,
  ExternalLink,
  ArrowRight,
  Headphones,
  AlertCircle,
  HelpCircle,
  Filter,
  Lock,
  Zap,
} from "lucide-react";

const MP_DISTRICTS = [
  "All Districts",
  "Bhopal",
  "Sehore",
  "Raisen",
  "Rajgarh",
  "Vidisha",
  "Hoshangabad",
  "Harda",
  "Betul",
  "Guna",
];

const NEED_CATEGORIES = [
  { id: "All", labelEn: "All Needs", labelHi: "सभी आवश्यकताएं", count: 38 },
  {
    id: "Pension",
    labelEn: "Widow & Senior Pension",
    labelHi: "पेंशन (विधवा / वृद्धा)",
    count: 11,
  },
  {
    id: "Livelihood",
    labelEn: "SHG & Micro-Loans",
    labelHi: "आजीविका एवं ऋण",
    count: 9,
  },
  {
    id: "Health",
    labelEn: "Maternity & Nutrition",
    labelHi: "मातृत्व एवं स्वास्थ्य",
    count: 7,
  },
  {
    id: "Education",
    labelEn: "Girls Education",
    labelHi: "शिक्षा एवं छात्रवृत्ति",
    count: 6,
  },
];

export const HomePage: React.FC = () => {
  const { language } = useLanguage();

  // Filter States
  const [selectedNeed, setSelectedNeed] = useState<string>("All");
  const [selectedDistrict, setSelectedDistrict] =
    useState<string>("All Districts");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Data States
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [totalSchemesCount, setTotalSchemesCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // AI Question Search State
  const [isAskingAi, setIsAskingAi] = useState<boolean>(false);
  const [aiAnswerData, setAiAnswerData] = useState<{
    query: string;
    rulesUsed: string[];
    disclaimer: string;
    helplineOffer: string;
  } | null>(null);

  // Voice Speech Recognition State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Callback Modal State
  const [callbackModal, setCallbackModal] = useState<{
    isOpen: boolean;
    schemeCode?: string;
    schemeName?: string;
  }>({ isOpen: false });

  // 3-Step Donation State
  const [donationFrequency, setDonationFrequency] = useState<
    "ONE_TIME" | "MONTHLY"
  >("ONE_TIME");
  const [donationAmount, setDonationAmount] = useState<number>(1000);
  const [customDonation, setCustomDonation] = useState<string>("");

  // Load Schemes based on Need & District
  const loadSchemes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getSchemes({
        need: selectedNeed !== "All" ? selectedNeed : undefined,
        district:
          selectedDistrict !== "All Districts" ? selectedDistrict : undefined,
        search: searchQuery.trim() || undefined,
        limit: 6,
      });
      setSchemes(res.schemes);
      if (
        selectedNeed === "All" &&
        selectedDistrict === "All Districts" &&
        !searchQuery.trim() &&
        res?.pagination?.total !== undefined
      ) {
        setTotalSchemesCount(res.pagination.total);
      }
    } catch (err: any) {
      console.error("Failed to load schemes:", err);
      setError("योजनाओं की सूची लोड नहीं हो सकी। कृपया पुनः प्रयास करें।");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch initial total published schemes count
  useEffect(() => {
    api
      .getSchemes({ limit: 1 })
      .then((res) => {
        if (res?.pagination?.total !== undefined) {
          setTotalSchemesCount(res.pagination.total);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadSchemes();
  }, [selectedNeed, selectedDistrict]);

  // Handle Natural Language / Spoken Question
  const handleAskQuestion = async (textToSearch?: string) => {
    const q = (textToSearch || searchQuery).trim();
    if (!q || q.length < 2) return;

    setIsAskingAi(true);
    setError(null);
    try {
      const res = await api.askSchemeQuestion({
        question: q,
        district:
          selectedDistrict !== "All Districts" ? selectedDistrict : undefined,
      });

      setSchemes(res.matches || []);
      setAiAnswerData({
        query: res.query,
        rulesUsed: res.rulesUsed,
        disclaimer: res.disclaimer,
        helplineOffer: res.helplineOffer,
      });
    } catch (err: any) {
      console.error("AI question error:", err);
      loadSchemes();
    } finally {
      setIsAskingAi(false);
    }
  };

  // Web Speech API Voice Toggle
  const toggleListening = () => {
    setSpeechError(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        language === "HI"
          ? "आपके ब्राउज़र में बोलकर खोजने की सुविधा उपलब्ध नहीं है। कृपया टाइप करें।"
          : "Voice speech recognition is not supported in this browser. Please type your query.",
      );
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "hi-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
        handleAskQuestion(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          setSpeechError("कृपया माइक्रोफ़ोन की अनुमति प्रदान करें।");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech initialization error:", err);
      setIsListening(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedNeed("All");
    setSelectedDistrict("All Districts");
    setSearchQuery("");
    setAiAnswerData(null);
    setSpeechError(null);
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedNeed !== "All" ||
    selectedDistrict !== "All Districts" ||
    aiAnswerData !== null;

  return (
    <div className="w-full bg-[#FAF9F5] text-[#1A1A1A] font-poppins min-h-screen">
      {/* ===================================================================== */}
      {/* 1. HERO LEAD SECTION (Matching Schemes Directory Top Header)          */}
      {/* ===================================================================== */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-[#EA3C36] font-bold">
                  {language === "HI"
                    ? "उड़ानहर: महिला कल्याण एवं सामाजिक सुरक्षा"
                    : "UDAANHER: WOMEN'S WELFARE DIRECTORY"}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00A3C4] bg-cyan-50 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00A3C4]" />
                  <span>
                    {language === "HI"
                      ? "मध्य प्रदेश शासन से सत्यापित"
                      : "MP State Verified"}
                  </span>
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A1A1A] tracking-tight leading-tight">
                {language === "HI" ? (
                  <>
                    <span className="text-[#000000]">
                      महिलाओं को उड़ने के पंख
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[#000000] font-bold">
                      Giving Women Wings to Fly
                    </span>
                  </>
                )}
              </h1>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl">
                {language === "HI"
                  ? "मध्य प्रदेश के 9 जिलों (भोपाल, सीहोर, रायसेन, राजगढ़, विदिशा, होशंगाबाद, हरदा, बैतूल, गुना) की महिलाओं के लिए सरकारी योजनाओं, विधवा पेंशन, मातृत्व लाभ एवं स्व-सहायता ऋण सहायता का सीधा मंच।"
                  : "Discover, filter, and access government welfare entitlements, widow pensions, maternal benefits, and SHG micro-loans across 9 operational districts of Madhya Pradesh."}
              </p>
            </div>

            {/* Quick Actions Tray */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/eligibility"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#EA3C36] hover:bg-[#D32F2F] text-white text-xs font-bold rounded-lg shadow-xs hover-lift transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>
                  {language === "HI"
                    ? "२ मिनट में पात्रता जांचें"
                    : "2-Min Screener"}
                </span>
              </Link>
              <a
                href="#donate-section"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg border border-gray-200 transition-all cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 text-[#EA3C36] fill-[#EA3C36]" />
                <span>
                  {language === "HI" ? "दान करें (80G छूट)" : "Donate (80G)"}
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. SCHEMES DISCOVERY & SEARCH SECTION (Direct Schemes Page Palette)   */}
      {/* ===================================================================== */}
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
        id="schemes-section"
      >
        {/* Search Bar & Category Filter Strip */}
        <div className="bg-white p-5 sm:p-7 rounded-xl shadow-xs border border-gray-200 space-y-5">
          {/* Natural Language & Voice Search Bar */}
          <div className="relative w-full">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAskQuestion()}
              placeholder={
                language === "HI"
                  ? "बोलकर या लिखकर सवाल पूछें (उदा. 'सीहोर में विधवा पेंशन' या 'स्वयं सहायता समूह लोन')..."
                  : "Search or speak in Hindi/English (e.g. 'widow pension in Sehore', 'SHG loan support')..."
              }
              className="w-full pl-12 pr-32 sm:pr-40 py-3 bg-gray-50 rounded-lg text-sm text-[#1A1A1A] placeholder:text-gray-400 border border-gray-200 focus:bg-white focus:border-[#EA3C36] focus:outline-hidden transition-all shadow-xs"
            />

            {/* Clear Button */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-24 sm:right-28 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}

            {/* Voice Microphone Button */}
            <button
              type="button"
              onClick={toggleListening}
              title="बोलकर सवाल पूछें (Hindi Voice Search)"
              className={`absolute right-12 sm:right-14 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                isListening
                  ? "bg-[#EA3C36] text-white animate-pulse"
                  : "bg-red-50 hover:bg-red-100 text-[#EA3C36]"
              }`}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            {/* Submit Button */}
            <button
              type="button"
              onClick={() => handleAskQuestion()}
              disabled={isAskingAi}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3.5 sm:px-4 py-1.5 bg-[#EA3C36] hover:bg-[#D32F2F] text-white text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer"
            >
              {isAskingAi ? "..." : language === "HI" ? "खोजें" : "Search"}
            </button>
          </div>

          {/* Speech error notice if microphone blocked */}
          {speechError && (
            <p className="text-xs text-[#EA3C36] font-semibold">
              {speechError}
            </p>
          )}

          {/* Category Pills (Exact SchemesPage Styling) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {NEED_CATEGORIES.map((cat) => {
              const isSelected = selectedNeed === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedNeed(cat.id);
                    setAiAnswerData(null);
                  }}
                  className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#EA3C36] text-white shadow-xs"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  <span>{language === "HI" ? cat.labelHi : cat.labelEn}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-gray-200/80 text-gray-600"
                    }`}
                  >
                    {cat.id === "All" && totalSchemesCount !== null
                      ? totalSchemesCount
                      : cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Secondary District Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  {language === "HI" ? "जिला फ़िल्टर:" : "District Filter:"}
                </span>
              </span>
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setAiAnswerData(null);
                }}
                className="px-3.5 py-1.5 bg-gray-50 text-[#1A1A1A] rounded-lg text-xs font-semibold border border-gray-200 focus:border-[#EA3C36] focus:outline-hidden cursor-pointer"
              >
                <option value="All Districts">
                  {language === "HI"
                    ? "सभी 9 जिले (मध्य प्रदेश)"
                    : "All 9 MP Districts"}
                </option>
                {MP_DISTRICTS.slice(1).map((d) => (
                  <option key={d} value={d}>
                    {d} {language === "HI" ? "जिला" : "District"}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[#EA3C36] hover:underline cursor-pointer text-xs font-bold flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>
                  {language === "HI" ? "फ़िल्टर रीसेट करें" : "Reset Filters"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* AI Rule Evaluation Result Banner */}
        {aiAnswerData && (
          <div className="bg-red-50 border-l-4 border-[#EA3C36] p-5 rounded-xl space-y-3 animate-fadeIn text-[#1A1A1A]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#EA3C36]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#EA3C36]">
                    {language === "HI"
                      ? "पात्रता नियम विश्लेषण"
                      : "Eligibility Rule Evaluation"}
                  </span>
                </div>
                <p className="text-sm font-bold text-[#1A1A1A]">
                  "{aiAnswerData.query}"
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAiAnswerData(null)}
                className="text-xs font-bold text-[#EA3C36] hover:underline cursor-pointer"
              >
                ✕ बंद करें
              </button>
            </div>

            <div className="space-y-1 text-xs text-gray-800">
              <span className="font-bold">पहचाने गए नियम एवं शर्तें:</span>
              <ul className="list-disc list-inside space-y-0.5 text-gray-700">
                {aiAnswerData.rulesUsed.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>

            {/* Statutory Disclaimer: NEVER A PROMISE */}
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200/80 text-amber-900 space-y-1">
              <span className="text-xs font-bold flex items-center gap-1.5 text-amber-900">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                महत्वपूर्ण कानूनी अस्वीकरण (Never a Promise / कोई कानूनी वादा नहीं)
              </span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                {aiAnswerData.disclaimer}
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-red-100">
              <span className="text-xs font-semibold text-gray-800">
                {aiAnswerData.helplineOffer}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCallbackModal({
                    isOpen: true,
                    schemeCode: "AI-SEARCH",
                    schemeName: `सवाल: ${aiAnswerData.query}`,
                  })
                }
                className="px-3.5 py-1.5 bg-[#EA3C36] hover:bg-[#D32F2F] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                📞 कॉल-बैक अनुरोध करें
              </button>
            </div>
          </div>
        )}

        {/* Screener Banner Matching SchemesPage Exactly */}
        <div className="w-full bg-[#EA3C36] p-6 sm:p-8 rounded-xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md relative overflow-hidden">
          <div className="space-y-1.5 z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-extrabold text-white/90">
              <Zap className="w-4 h-4 text-white" />
              {language === "HI"
                ? "२ मिनट का सरल पात्रता जांचकर्ता"
                : "2-Minute Eligibility Screener"}
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              {language === "HI"
                ? "क्या आप निश्चित नहीं हैं कि आप किस योजना के पात्र हैं?"
                : "Not sure which programs match your criteria?"}
            </h3>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
              {language === "HI"
                ? "सरल ६ सवालों के जवाब दें और अपनी पात्रता अनुसार सरकारी योजनाएं खोजें। पूर्णतः निःशुल्क एवं गोपनीय।"
                : "Answer 6 simple anonymous questions regarding your household to immediately unlock tailored welfare benefits and documentation checklists."}
            </p>
          </div>

          <Link
            to="/eligibility"
            className="z-10 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-[#EA3C36] text-xs font-bold hover:bg-gray-50 shrink-0 shadow-md transition-all cursor-pointer active:scale-98"
          >
            <span>
              {language === "HI" ? "पात्रता जांच शुरू करें" : "Start Screener"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Schemes Grid Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700">
              {language === "HI"
                ? `प्रदर्शित: ${schemes.length} योजनाएं`
                : `Showing ${schemes.length} Programs`}
            </span>
            {selectedDistrict !== "All Districts" && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                {selectedDistrict} Region
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <SchemeCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center space-y-2">
              <AlertCircle className="w-6 h-6 mx-auto text-[#EA3C36]" />
              <p className="text-sm font-bold">{error}</p>
              <button
                type="button"
                onClick={loadSchemes}
                className="px-4 py-2 bg-[#EA3C36] text-white text-xs font-bold rounded-lg"
              >
                पुनः लोड करें
              </button>
            </div>
          ) : schemes.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center space-y-3 border border-gray-200">
              <HelpCircle className="w-8 h-8 text-gray-400 mx-auto" />
              <h3 className="text-base text-[#1A1A1A] font-bold">
                {language === "HI"
                  ? "कोई योजना नहीं मिली"
                  : "No programs match your search or filter"}
              </h3>
              <p className="text-xs text-gray-500">
                {language === "HI"
                  ? "कृपया अन्य कीवर्ड खोजें अथवा फ़िल्टर रीसेट करें।"
                  : "Try searching with other terms or clearing the active filters."}
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#EA3C36] text-white text-xs font-bold hover:bg-[#D32F2F] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>
                  {language === "HI"
                    ? "सभी योजनाएं देखें"
                    : "Reset All Filters"}
                </span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schemes.map((scheme) => {
                const docCount = Array.isArray(scheme.requiredDocuments)
                  ? scheme.requiredDocuments.length
                  : 3;
                return (
                  <article
                    key={scheme.id}
                    className="bg-white rounded-xl p-6 shadow-xs flex flex-col justify-between hover-lift border border-gray-200 transition-all duration-200 group"
                  >
                    <div className="space-y-4">
                      {/* Code Badge & Verified Tag */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-[#EA3C36] text-xs font-bold border border-red-100">
                          {scheme.schemeCode}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00A3C4] bg-cyan-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified Aid</span>
                        </span>
                      </div>

                      {/* Title & Hindi Subtitle */}
                      <div>
                        <h3 className="text-base font-bold text-[#1A1A1A] mb-1 leading-snug group-hover:text-[#EA3C36] transition-colors">
                          {scheme.name}
                        </h3>
                        {scheme.nameHi && (
                          <p className="text-xs text-[#EA3C36] font-medium font-hindi mb-2">
                            {scheme.nameHi}
                          </p>
                        )}

                        {/* Benefit Highlight Box */}
                        <div className="p-3.5 rounded-lg bg-[#F8F9FA] my-3 border border-gray-200/80">
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                            {language === "HI"
                              ? "योजना से मिलने वाला लाभ"
                              : "Program Benefit"}
                          </p>
                          <p className="text-base sm:text-lg font-extrabold text-[#1A1A1A]">
                            {language === "HI" && scheme.benefitHi
                              ? scheme.benefitHi
                              : scheme.benefit}
                          </p>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-3">
                          {language === "HI" && scheme.descriptionHi
                            ? scheme.descriptionHi
                            : scheme.description}
                        </p>

                        {/* Document Requirement Pill, Official Source Link & Last Checked Date */}
                        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-gray-400" />
                            <span>{docCount} key documents</span>
                          </span>
                          <div className="flex items-center gap-2">
                            {scheme.officialSourceUrl && (
                              <a
                                href={scheme.officialSourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#EA3C36] hover:underline font-bold inline-flex items-center gap-0.5"
                              >
                                <span>Official Notice</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {scheme.lastCheckedAt && (
                              <span className="text-[10px] text-gray-500">
                                Verified:{" "}
                                {new Date(
                                  scheme.lastCheckedAt,
                                ).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Nearest Help Centre */}
                        {scheme.nearestHelpCentre &&
                          scheme.nearestHelpCentre.name && (
                            <div className="pt-3 mt-3 border-t border-gray-100 text-xs text-gray-600 space-y-0.5">
                              <span className="font-semibold text-gray-700 flex items-center gap-1">
                                <Building className="w-3 h-3 text-[#EA3C36]" />
                                <span>
                                  {language === "HI"
                                    ? "निकटतम सहायता केंद्र:"
                                    : "Help Centre:"}
                                </span>
                              </span>
                              <p className="line-clamp-1">
                                {scheme.nearestHelpCentre.name}
                              </p>
                              {scheme.nearestHelpCentre.phone && (
                                <p className="text-[11px] font-semibold text-[#EA3C36]">
                                  📞 {scheme.nearestHelpCentre.phone}
                                </p>
                              )}
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Bottom Actions matching SchemesPage */}
                    <div className="pt-5 mt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                      <Link
                        to={`/schemes/${scheme.slug}`}
                        className="inline-flex items-center justify-center flex-1 py-2 rounded-lg bg-gray-100 text-gray-800 text-xs font-bold hover:bg-[#EA3C36] hover:text-white transition-all shadow-2xs"
                      >
                        <span>
                          {language === "HI"
                            ? "दिशानिर्देश देखें"
                            : "View Guidelines"}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                      <button
                        onClick={() =>
                          setCallbackModal({
                            isOpen: true,
                            schemeCode: scheme.schemeCode,
                            schemeName: scheme.name,
                          })
                        }
                        title="सहायता हेतु कॉल का अनुरोध (Request Assistance)"
                        className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-[#EA3C36] transition-colors cursor-pointer"
                        aria-label="Request Assistance"
                      >
                        <Headphones className="w-4 h-4" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Bottom All Schemes Link */}
          <div className="text-center pt-4">
            <Link
              to="/schemes"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#EA3C36] hover:bg-[#D32F2F] text-white text-xs font-bold shadow-xs hover-lift transition-all"
            >
              <span>
                {language === "HI"
                  ? totalSchemesCount !== null
                    ? `सभी ${totalSchemesCount} योजनाएं देखें`
                    : "सभी योजनाएं एवं सेवाएं देखें"
                  : totalSchemesCount !== null
                    ? `Browse All ${totalSchemesCount} Programs & Services`
                    : "Browse All Programs & Services"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. DONATION SECTION: 3 STEPS AT MOST (Matching Red & Clean White)     */}
      {/* ===================================================================== */}
      <section
        className="bg-white border-t border-gray-200 py-14 px-4 sm:px-6 lg:px-8"
        id="donate-section"
      >
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-wider text-[#EA3C36] font-bold">
              {language === "HI"
                ? "दान करें • २ मिनट में रसीद पाएं"
                : "DONATE ONLINE • INSTANT 80G RECEIPT"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
              {language === "HI"
                ? "महिलाओं को दें आत्मनिर्भरता के पंख"
                : "Your Gift Could Change Someone's Life"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
              {language === "HI"
                ? "धारा 80G के तहत 50% आयकर छूट • तुरंत वैध 80G पीडीएफ रसीद व प्रमाण पत्र डाउनलोड"
                : "100% transparent Section 80G tax-exempt charitable aid. Instant verified PDF certificate."}
            </p>
          </div>

          {/* 3-Step Donation Card */}
          <div className="bg-[#F8F9FA] rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
            {/* Step 1: Frequency & Amount */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#EA3C36] text-white flex items-center justify-center text-xs">
                    1
                  </span>
                  {language === "HI"
                    ? "दान आवृत्ति एवं राशि चुनें"
                    : "Select Frequency & Amount"}
                </span>

                {/* Frequency Toggle */}
                <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-white">
                  <button
                    type="button"
                    onClick={() => setDonationFrequency("ONE_TIME")}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      donationFrequency === "ONE_TIME"
                        ? "bg-[#EA3C36] text-white shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {language === "HI" ? "एक बार (One-Time)" : "One-Time"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDonationFrequency("MONTHLY")}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      donationFrequency === "MONTHLY"
                        ? "bg-[#EA3C36] text-white shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {language === "HI" ? "मासिक (Monthly)" : "Monthly"}
                  </button>
                </div>
              </div>

              {/* Amount Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[500, 1000, 2500, 5000].map((amt) => {
                  const isSelected = donationAmount === amt && !customDonation;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setDonationAmount(amt);
                        setCustomDonation("");
                      }}
                      className={`py-3 px-4 rounded-lg text-sm font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#EA3C36] bg-red-50 text-[#EA3C36] ring-1 ring-[#EA3C36]"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      ₹{amt.toLocaleString("en-IN")}
                      {donationFrequency === "MONTHLY" && (
                        <span className="text-[11px] block font-normal">
                          /mo
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Amount */}
              <input
                type="text"
                placeholder={
                  language === "HI"
                    ? "अन्य राशि दर्ज करें (₹)"
                    : "Custom amount in INR"
                }
                value={customDonation}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setCustomDonation(val);
                  if (val) setDonationAmount(parseInt(val, 10));
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#EA3C36] focus:outline-hidden placeholder:text-gray-400"
              />
            </div>

            {/* Step 2: 80G Tax Benefit Summary */}
            <div className="p-4 bg-white rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-700">
              <div className="space-y-0.5">
                <span className="font-bold text-[#EA3C36] block">
                  {language === "HI"
                    ? "आयकर छूट (धारा 80G):"
                    : "Section 80G Tax Benefit:"}
                </span>
                <span>
                  {language === "HI" ? (
                    <>
                      आपके{" "}
                      <strong>₹{donationAmount.toLocaleString("en-IN")}</strong>{" "}
                      के दान पर ₹
                      {(donationAmount * 0.5).toLocaleString("en-IN")} (50%) की
                      आयकर कटौती अनुमन्य है।
                    </>
                  ) : (
                    <>
                      50% tax deduction on your contribution of{" "}
                      <strong>₹{donationAmount.toLocaleString("en-IN")}</strong>{" "}
                      is ₹{(donationAmount * 0.5).toLocaleString("en-IN")}.
                    </>
                  )}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-[#EA3C36] rounded-lg font-bold border border-red-100 shrink-0">
                <CheckCircle2 className="w-4 h-4 text-[#EA3C36]" />
                <span>80G Certificate Instant</span>
              </div>
            </div>

            {/* Step 3: Checkout Action */}
            <div className="space-y-3">
              <Link
                to={`/donate?amount=${donationAmount}&type=${donationFrequency}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-lg bg-[#EA3C36] hover:bg-[#D32F2F] text-white font-bold text-sm tracking-wide shadow-xs hover-lift transition-all cursor-pointer"
              >
                <span>
                  {language === "HI"
                    ? `₹${donationAmount.toLocaleString("en-IN")} दान करें एवं तुरंत 80G रसीद पाएं`
                    : `Proceed with ₹${donationAmount.toLocaleString("en-IN")} & Get Instant 80G Receipt`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-center gap-2 text-center text-xs text-gray-500 pt-1">
                <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>
                  विदेशी कार्ड / मुद्रा Phase 1 में प्रतिबंधित हैं (FCRA
                  compliance • Domestic INR only)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. STATUTORY FOOTER BANNER                                            */}
      {/* ===================================================================== */}
      <footer className="w-full py-8 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-200 text-xs text-gray-600">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="space-y-1">
            <p className="font-bold text-gray-900">
              उड़ानहर महिला कल्याण एवं सशक्तिकरण चैरिटेबल ट्रस्ट (भोपाल)
            </p>
            <p>
              पंजीकृत कार्यालय: प्लॉट 14, अरेरा हिल्स, भोपाल, म.प्र. - 462011 •
              ट्रस्ट पैन: AAATC1234D • 80G पंजीकरण:
              CIT(E)/BPL/80G/2021-22/A-1089
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <span className="font-bold text-[#EA3C36] flex items-center gap-1.5">
              <Phone className="w-4 h-4" />
              <span>हेल्पलाइन: 1800-233-0000 (टोल-फ्री)</span>
            </span>
          </div>
        </div>
      </footer>

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
