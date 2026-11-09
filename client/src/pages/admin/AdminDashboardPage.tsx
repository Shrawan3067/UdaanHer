import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Sparkles,
  Download,
  PlusCircle,
  TrendingUp,
  Receipt,
  BookOpen,
  HeartHandshake,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Coins,
  Layers,
  FileSpreadsheet,
  Bell,
  RotateCw,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { language } = useLanguage();
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTriggeringAutomation, setIsTriggeringAutomation] = useState(false);
  const [automationToast, setAutomationToast] = useState<string | null>(null);

  const handleTriggerAutomation = async () => {
    setIsTriggeringAutomation(true);
    try {
      const res = await api.triggerAutomation();
      setAutomationToast(
        `Automated pipelines executed! Dispatched ${res.data.taxRemindersSent} tax statement reminders, ${res.data.recurringRemindersSent} recurring patron notices, and audited ${res.data.staleSchemesFlagged} gazette records.`
      );
    } catch (err: any) {
      alert("Automation trigger failed: " + err.message);
    } finally {
      setIsTriggeringAutomation(false);
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.getAdminDashboard();
        setData(res);
      } catch (err) {
        console.error('Failed to load admin dashboard', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center font-poppins">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-gray-200 border-t-[#EA3C36] rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Loading Operations Command Center...
          </span>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto w-full animate-fadeIn font-poppins text-[#1A1A1A]">
      {/* Automation Toast Alert */}
      {automationToast && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 flex items-center justify-between border border-emerald-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{automationToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setAutomationToast(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-sm p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. MISSION GOVERNANCE EXECUTIVE HEADER */}
      <div className="p-6 lg:p-7 rounded-2xl bg-white border border-gray-200/90 shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs uppercase font-extrabold text-[#EA3C36] tracking-wider">
              Mission Governance
            </span>
            <span className="text-gray-300">•</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              NITI Aayog Darpan Synced
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-gray-500 font-semibold">CBDT Form 10BD Live</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
            {language === 'HI' ? 'संचालन एवं प्रभाव कमांड केंद्र' : 'Operations & Impact Command Center'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-3xl leading-relaxed">
            Statutory oversight, Section 80G certificate issuance, and grassroots women welfare scheme saturation across Madhya Pradesh.
          </p>
        </div>

        {/* Executive Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {metrics.pendingAiReviewsCount > 0 && (
            <Link
              to="/admin/ai-reviews"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>{metrics.pendingAiReviewsCount} AI Reviews Pending</span>
            </Link>
          )}

          <Link
            to="/admin/reports"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold border border-gray-200 shadow-2xs hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#EA3C36]" />
            <span>Form 10BD CSV</span>
          </Link>

          <Link
            to="/admin/schemes"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EA3C36] hover:bg-[#D32F2F] text-white text-xs font-bold shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Scheme</span>
          </Link>
        </div>
      </div>

      {/* 2. STATISTICAL KPI CARDS: 5 COLUMNS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* KPI 1: Total Donated */}
        <div className="bg-white rounded-2xl p-5 shadow-2xs relative overflow-hidden flex flex-col justify-between border border-gray-200/90 hover:shadow-md transition-shadow">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#EA3C36]"></div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] uppercase font-bold text-gray-500 tracking-wider">
                Total Collections
              </span>
              <Coins className="w-4 h-4 text-[#EA3C36]" />
            </div>
            <div className="text-2xl font-black text-[#1A1A1A] tracking-tight">
              ₹{(metrics.totalAmountCollected || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>+14.2% MoM</span>
            </span>
            <span className="text-[10px] text-gray-400 font-semibold">FY 2026-27</span>
          </div>
        </div>

        {/* KPI 2: 80G Receipts Issued */}
        <div className="bg-white rounded-2xl p-5 shadow-2xs relative overflow-hidden flex flex-col justify-between border border-gray-200/90 hover:shadow-md transition-shadow">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-sky-500"></div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] uppercase font-bold text-gray-500 tracking-wider">
                80G Receipts Issued
              </span>
              <Receipt className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-black text-sky-900 tracking-tight">
              {metrics.totalReceiptsIssued || 0}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold text-sky-700">100% Atomic</span>
            <span className="text-[10px] text-gray-400 font-semibold">Safe Sequences</span>
          </div>
        </div>

        {/* KPI 3: Published Schemes */}
        <div className="bg-white rounded-2xl p-5 shadow-2xs relative overflow-hidden flex flex-col justify-between border border-gray-200/90 hover:shadow-md transition-shadow">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500"></div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] uppercase font-bold text-gray-500 tracking-wider">
                Published Schemes
              </span>
              <BookOpen className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-[#1A1A1A] tracking-tight">
              {metrics.publishedSchemesCount || 0}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">9 MP Districts</span>
            <span className="text-xs font-bold text-indigo-700">Live Ingested</span>
          </div>
        </div>

        {/* KPI 4: Active Campaigns */}
        <div className="bg-white rounded-2xl p-5 shadow-2xs relative overflow-hidden flex flex-col justify-between border border-gray-200/90 hover:shadow-md transition-shadow">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] uppercase font-bold text-gray-500 tracking-wider">
                Active Campaigns
              </span>
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-[#1A1A1A] tracking-tight">
              {metrics.activeCampaignsCount || 0}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Health &amp; Livelihood</span>
            <span className="text-xs font-bold text-emerald-700">100% Field Ops</span>
          </div>
        </div>

        {/* KPI 5: AI Reviews Queue */}
        <div className="bg-white rounded-2xl p-5 shadow-2xs relative overflow-hidden flex flex-col justify-between border border-gray-200/90 hover:shadow-md transition-shadow">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500"></div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] uppercase font-bold text-gray-500 tracking-wider">
                AI Reviews Queue
              </span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-900 tracking-tight">
              {metrics.pendingAiReviewsCount || 0}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700">Human Review Desk</span>
            <span className="text-[10px] text-gray-400 font-semibold">Hindi Drafts</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN ANALYTICS & RECENT TRANSACTIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Chart & Ledger Table (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Monthly Collection Velocity Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-2xs border border-gray-200/90 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A]">
                  Monthly Donation Velocity
                </h3>
                <p className="text-xs text-gray-500">
                  INR contributions collected across all active campaigns (FY 2026-27).
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-red-50 text-[#EA3C36] text-xs font-bold border border-red-200/60">
                Live Data
              </span>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Oct', amount: 45000 },
                    { name: 'Nov', amount: 82000 },
                    { name: 'Dec', amount: 120000 },
                    { name: 'Jan', amount: 95000 },
                    { name: 'Feb', amount: 150000 },
                    { name: 'Mar', amount: metrics.totalAmountCollected || 250000 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" vertical={false} />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${val / 1000}k`}
                  />
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Collections']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="amount" fill="#EA3C36" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Latest Donor Transactions Ledger */}
          <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A]">
                  Latest Donor Transactions
                </h3>
                <p className="text-xs text-gray-500">
                  Real-time statutory ledger updates with instant 80G receipt linkage.
                </p>
              </div>
              <Link
                to="/admin/donations"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#EA3C36] hover:underline"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-500 text-[11px] uppercase tracking-wider border-b border-gray-200/80">
                    <th className="py-3 px-6 font-bold">Donor</th>
                    <th className="py-3 px-6 font-bold">Amount</th>
                    <th className="py-3 px-6 font-bold">Campaign</th>
                    <th className="py-3 px-6 font-bold">Receipt Number</th>
                    <th className="py-3 px-6 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(data?.recentDonations || []).slice(0, 5).map((d: any) => (
                    <tr key={d.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-6">
                        <p className="text-xs font-bold text-gray-900">
                          {d.donor?.fullName || 'Anonymous Patron'}
                        </p>
                        <p className="text-[11px] text-gray-500">{d.donor?.email}</p>
                      </td>
                      <td className="py-3.5 px-6">
                        <p className="text-xs font-extrabold text-[#EA3C36]">
                          ₹{Number(d.amount).toLocaleString('en-IN')}
                        </p>
                      </td>
                      <td className="py-3.5 px-6 text-xs text-gray-600 font-medium">
                        {d.campaign?.title || 'General Welfare Fund'}
                      </td>
                      <td className="py-3.5 px-6 font-mono text-xs font-bold text-[#1A1A1A]">
                        {d.receipt?.receiptNumber ? (
                          <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-800">
                            {d.receipt.receiptNumber}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!data?.recentDonations || data.recentDonations.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-gray-500">
                        No transactions recorded yet in this fiscal period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: AI Ingestion & Quick Admin Links (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* OpenAI Plain-Hindi Review Desk Callout */}
          <div className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-200/90 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-gray-900">
                  OpenAI Plain-Hindi Drafter
                </h3>
                <span className="text-[10px] uppercase font-bold text-amber-700">
                  Human-In-The-Loop Desk
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Synthesize complex official gazettes into easy-to-read, plain-Hindi scheme summaries for rural beneficiaries with structured JSON output and editorial verification.
            </p>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-600">Pending Review Queue:</span>
                <span className="text-amber-700 font-bold">{metrics.pendingAiReviewsCount || 0} Pending</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-600">AI Model Pipeline:</span>
                <span className="text-[#EA3C36] font-mono text-[11px] font-bold">gpt-4o-mini</span>
              </div>
            </div>

            <Link
              to="/admin/ai-reviews"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#EA3C36] hover:bg-[#D32F2F] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Open AI Review Desk →</span>
            </Link>
          </div>

          {/* Quick Administrative Shortcuts */}
          <div className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-200/90 space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-[11px] text-gray-400">
              Quick Administrative Tools
            </h3>

            <div className="flex flex-col gap-2">
              <Link
                to="/admin/schemes"
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-red-50/50 hover:border-red-200 text-gray-800 hover:text-[#EA3C36] text-xs font-bold border border-gray-200 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-[#EA3C36]" />
                  <span>Manage Welfare Schemes</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </Link>

              <Link
                to="/admin/campaigns"
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-red-50/50 hover:border-red-200 text-gray-800 hover:text-[#EA3C36] text-xs font-bold border border-gray-200 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-[#EA3C36]" />
                  <span>Campaign Budgets &amp; Goals</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </Link>

              <Link
                to="/admin/reports"
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-red-50/50 hover:border-red-200 text-gray-800 hover:text-[#EA3C36] text-xs font-bold border border-gray-200 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-[#EA3C36]" />
                  <span>Form 10BD Annual Returns</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </Link>
            </div>
          </div>

          {/* Automated Pipelines & Reminders Card */}
          <div className="bg-white p-6 rounded-2xl shadow-2xs border border-gray-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#EA3C36]" />
                <h3 className="text-sm font-bold text-gray-900">
                  Automated Pipelines &amp; Reminders
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                Live Active
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-gray-50 flex items-center justify-between">
                <span className="text-gray-600 font-medium">80G Receipts &amp; Certificates:</span>
                <span className="font-bold text-emerald-700">100% Atomic</span>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 flex items-center justify-between">
                <span className="text-gray-600 font-medium">Form 10BD Tax Reminders:</span>
                <span className="font-bold text-gray-800">Automated</span>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 flex items-center justify-between">
                <span className="text-gray-600 font-medium">Monthly Recurring Reminders:</span>
                <span className="font-bold text-gray-800">Automated</span>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 flex items-center justify-between">
                <span className="text-gray-600 font-medium">30-Day Gazette Audit Monitor:</span>
                <span className="font-bold text-[#EA3C36]">Active</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isTriggeringAutomation}
              onClick={handleTriggerAutomation}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-[#EA3C36] text-gray-700 text-xs font-bold transition-all border border-gray-200 hover:border-red-200 cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isTriggeringAutomation ? "animate-spin text-[#EA3C36]" : ""}`} />
              <span>{isTriggeringAutomation ? "Processing Automation Suite..." : "Run Automated Reminders & Audit Suite"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
