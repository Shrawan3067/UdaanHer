import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { api } from "../../services/api";
import { Scheme } from "../../types";
import { CallbackModal } from "../../components/common/CallbackModal";
import { SchemeCardSkeleton } from "../../components/common/LoadingSkeleton";
import {
  Search,
  RotateCcw,
  Zap,
  ArrowRight,
  CheckCircle2,
  Headphones,
  FileText,
  X,
  Filter,
  Mic,
  MicOff,
  ExternalLink,
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

const CATEGORIES = [
  { id: "All", label: "All Programs", count: 38 },
  { id: "Social Security", label: "First Aid & Health Aid", count: 11 },
  { id: "Livelihood & Finance", label: "Livelihood & Self-Help", count: 9 },
  { id: "Healthcare & Nutrition", label: "Maternal & Emergency", count: 7 },
  { id: "Education & Training", label: "Youth & Skilling", count: 6 },
];

export const SchemesPage: React.FC = () => {
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(
    searchParams.get("category") || "All",
  );
  const [district, setDistrict] = useState(
    searchParams.get("district") || "All Districts",
  );
  const [page, setPage] = useState(1);

  // Callback Modal state
  const [callbackModal, setCallbackModal] = useState<{
    isOpen: boolean;
    schemeCode?: string;
    schemeName?: string;
  }>({ isOpen: false });

  // Hindi Voice Recognition State
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = React.useRef<any>(null);

  const toggleListening = () => {
    setSpeechError(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        language === "HI"
          ? "ब्राउज़र में बोलकर खोजने की सुविधा उपलब्ध नहीं है।"
          : "Voice speech recognition is not supported in this browser."
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
        setSearch(transcript);
        setIsListening(false);
        // Instant search with speech query
        setIsLoading(true);
        api.getSchemes({
          search: transcript.trim() || undefined,
          category: category !== "All" ? category : undefined,
          district: district !== "All Districts" ? district : undefined,
          page: 1,
          limit: 6,
        }).then((res) => {
          setSchemes(res.schemes);
          setPagination(res.pagination);
        }).finally(() => {
          setIsLoading(false);
        });
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const fetchSchemes = async () => {
    setIsLoading(true);
    try {
      const res = await api.getSchemes({
        search: search.trim() || undefined,
        category: category !== "All" ? category : undefined,
        district: district !== "All Districts" ? district : undefined,
        page,
        limit: 6,
      });
      setSchemes(res.schemes);
      setPagination(res.pagination);
    } catch (err: any) {
      console.error("Failed to load schemes", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [category, district, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSchemes();
  };

  const clearSearch = () => {
    setSearch("");
    setPage(1);
  };

  const clearAllFilters = () => {
    setSearch("");
    setCategory("All");
    setDistrict("All Districts");
    setPage(1);
  };

  const hasActiveFilters =
    search.trim() !== "" || category !== "All" || district !== "All Districts";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn text-[#1A1A1A]">
      {/* Top Header */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <span className="text-xs uppercase tracking-wider text-[#EA3C36] font-bold">
              WHAT WE ARE ACTIVE ON
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
              Programs &amp; Services Directory
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              Discover, filter, and access humanitarian relief, welfare
              entitlements, healthcare, and livelihood support across our
              operational districts.
            </p>
          </div>
        </div>
      </section>

      {/* Search Bar & Category Filter Strip */}
      <section className="bg-white p-5 sm:p-7 rounded-xl shadow-xs border border-gray-200 space-y-5">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by program name, keywords or speak in Hindi (e.g. 'विधवा पेंशन', 'maternity', 'loan')..."
            className="w-full pl-12 pr-36 sm:pr-40 py-3 bg-gray-50 rounded-lg text-sm text-[#1A1A1A] placeholder:text-gray-400 border border-gray-200 focus:bg-white focus:border-[#EA3C36] focus:outline-hidden transition-all shadow-xs"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={toggleListening}
              title={isListening ? "Listening in Hindi... Click to Stop" : "Click to Speak in Hindi (बोलकर खोजें)"}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                isListening
                  ? "bg-[#EA3C36] text-white animate-pulse shadow-xs"
                  : "bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-[#EA3C36]"
              }`}
              aria-label="Speak search in Hindi"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              type="submit"
              className="px-4 sm:px-5 py-1.5 bg-[#EA3C36] hover:bg-[#D32F2F] text-white text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>
        {speechError && (
          <p className="text-xs text-red-600 font-semibold">{speechError}</p>
        )}

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategory(cat.id);
                  setPage(1);
                }}
                className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#EA3C36] text-white shadow-xs"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-gray-200/80 text-gray-600"
                  }`}
                >
                  {cat.id === "All" && pagination.total > 0
                    ? pagination.total
                    : cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <span>District Filter:</span>
            </span>
            <select
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-1.5 bg-gray-50 text-[#1A1A1A] rounded-lg text-xs font-semibold border border-gray-200 focus:border-[#EA3C36] focus:outline-hidden cursor-pointer"
            >
              {MP_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <button
                onClick={clearAllFilters}
                className="text-[#EA3C36] hover:underline cursor-pointer text-xs font-bold flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Screener Banner Matching Red Cross Red */}
      <div className="w-full bg-[#EA3C36] p-6 sm:p-8 rounded-xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md relative overflow-hidden">
        <div className="space-y-1.5 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-extrabold text-white/90">
            <Zap className="w-4 h-4 text-white" />
            2-Minute Eligibility Screener
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Not sure which programs match your criteria?
          </h3>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            Answer 6 simple anonymous questions regarding your household to
            immediately unlock tailored welfare benefits and documentation
            checklists.
          </p>
        </div>
        <Link
          to="/eligibility"
          className="z-10 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-[#EA3C36] text-xs font-bold hover:bg-gray-50 shrink-0 shadow-md transition-all cursor-pointer active:scale-98"
        >
          <span>Start Screener</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Schemes Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-700">
            Showing {schemes.length} of {pagination.total} Programs
          </span>
          {district !== "All Districts" && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              Region: {district}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SchemeCardSkeleton key={i} />
            ))}
          </div>
        ) : schemes.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center space-y-3 border border-gray-200">
            <span className="material-symbols-outlined text-4xl text-gray-400">
              search_off
            </span>
            <h3 className="text-base text-[#1A1A1A] font-bold">
              No programs match your search or filter
            </h3>
            <p className="text-xs text-gray-500">
              Try searching with other terms or clearing the active filters.
            </p>
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#EA3C36] text-white text-xs font-bold hover:bg-[#D32F2F] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
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
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-[#EA3C36] text-xs font-bold border border-red-100">
                        {scheme.schemeCode}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00A3C4] bg-cyan-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified Aid
                      </span>
                    </div>

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
                          Program Benefit
                        </p>
                        <p className="text-base sm:text-lg font-extrabold text-[#1A1A1A]">
                          {scheme.benefit.split("(")[0] || "Direct Allowance"}
                        </p>
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-3">
                        {scheme.description}
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
                              Verified: {new Date(scheme.lastCheckedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Nearest Help Centre (Mandated by Brief) */}
                      {scheme.nearestHelpCentre && scheme.nearestHelpCentre.name && (
                        <div className="pt-2 text-[11px] text-gray-600 space-y-0.5 border-t border-gray-100 mt-2">
                          <span className="font-semibold text-gray-700 block line-clamp-1">
                            📍 {scheme.nearestHelpCentre.name}
                          </span>
                          {scheme.nearestHelpCentre.phone && (
                            <span className="text-[#EA3C36] font-bold block">
                              📞 {scheme.nearestHelpCentre.phone}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/schemes/${scheme.slug}`}
                      className="inline-flex items-center justify-center flex-1 py-2 rounded-lg bg-gray-100 text-gray-800 text-xs font-bold hover:bg-[#EA3C36] hover:text-white transition-all shadow-2xs"
                    >
                      <span>View Guidelines</span>
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
                      title="Request Assistance from UdaanHer Volunteer"
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold disabled:opacity-40 cursor-pointer transition-colors"
            >
              Previous
            </button>
            <span className="text-xs text-gray-600 font-medium">
              Page <span className="font-bold text-[#1A1A1A]">{page}</span> of{" "}
              <span className="font-bold text-[#1A1A1A]">
                {pagination.totalPages}
              </span>
            </span>
            <button
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={page === pagination.totalPages}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold disabled:opacity-40 cursor-pointer transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </section>

      {/* Callback Modal */}
      <CallbackModal
        isOpen={callbackModal.isOpen}
        onClose={() => setCallbackModal({ isOpen: false })}
        schemeCode={callbackModal.schemeCode}
        schemeName={callbackModal.schemeName}
      />
    </div>
  );
};
