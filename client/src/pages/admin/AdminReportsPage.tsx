import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import {
  FileSpreadsheet,
  Download,
  ShieldCheck,
  Layers,
  Coins,
  CheckCircle2,
  Users,
  Building,
  Calendar,
} from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const { language } = useLanguage();

  const [form10bdRecords, setForm10bdRecords] = useState<any[]>([]);
  const [campaignReports, setCampaignReports] = useState<any[]>([]);
  const [financialYear, setFinancialYear] = useState('2026-27');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'form10bd'>('campaigns');

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const [f10bd, campaigns] = await Promise.all([
          api.getForm10BDReport(financialYear),
          api.getCampaignsReport(),
        ]);
        setForm10bdRecords(f10bd);
        setCampaignReports(campaigns);
      } catch (err) {
        console.error('Failed to load reports', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, [financialYear]);

  const handleExportCsv = () => {
    const url = api.getForm10BDCsvUrl(financialYear);
    window.open(url, '_blank');
  };

  const totalAmount = form10bdRecords.reduce((sum, r) => sum + Number(r.donationAmount), 0);
  const totalCampaignCollected = campaignReports.reduce((sum, c) => sum + Number(c.collectedAmount), 0);
  const totalCampaignGoal = campaignReports.reduce((sum, c) => sum + Number(c.goalAmount), 0);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto w-full animate-fadeIn font-poppins text-[#1A1A1A]">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white shadow-2xs border border-gray-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold text-[#EA3C36] tracking-wider">
              Statutory Reporting &amp; Audit
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-gray-500 font-semibold">CBDT Rule 18AB</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
            {language === 'HI' ? 'लेखा रिपोर्ट एवं फॉर्म 10BD' : 'Accounts Reports & Form 10BD'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mt-0.5">
            Accounts reports by campaign and statutory Form 10BD statements for the Income Tax Department filing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
          <select
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            className="px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 cursor-pointer focus:outline-hidden focus:bg-white focus:border-[#EA3C36]"
          >
            <option value="2026-27">FY 2026-27 (Current)</option>
            <option value="2025-26">FY 2025-26</option>
          </select>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EA3C36] hover:bg-[#D32F2F] text-white text-xs sm:text-sm font-bold shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Form 10BD (CSV)</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200/90">
        <button
          type="button"
          onClick={() => setActiveTab('campaigns')}
          className={`pb-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all cursor-pointer ${
            activeTab === 'campaigns'
              ? 'border-[#EA3C36] text-[#EA3C36]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          {language === 'HI' ? 'अभियानवार लेखा रिपोर्ट (Campaign Accounts)' : 'Campaign Accounts Report'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('form10bd')}
          className={`pb-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all cursor-pointer ${
            activeTab === 'form10bd'
              ? 'border-[#EA3C36] text-[#EA3C36]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          {language === 'HI' ? 'फॉर्म 10BD दाता अनुसूची (Form 10BD)' : 'Form 10BD Donor Schedule'}
        </button>
      </div>

      {/* TAB 1: Accounts Reports by Campaign */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-1 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#EA3C36]"></div>
              <span className="text-[11px] uppercase font-bold text-gray-500 tracking-wider">
                Total Campaign Mobilization
              </span>
              <p className="text-2xl font-black text-[#1A1A1A]">
                ₹{totalCampaignCollected.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-500">
                Target: ₹{totalCampaignGoal.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-1 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-sky-500"></div>
              <span className="text-[11px] uppercase font-bold text-gray-500 tracking-wider">
                Total Campaigns Tracked
              </span>
              <p className="text-2xl font-black text-sky-900">
                {campaignReports.length}
              </p>
              <p className="text-xs text-gray-500">Across Livelihood &amp; Health</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-1 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
              <span className="text-[11px] uppercase font-bold text-gray-500 tracking-wider">
                80G Verified Statement
              </span>
              <p className="text-2xl font-black text-emerald-800">
                ₹{totalAmount.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-500">FY {financialYear} Certified Receipts</p>
            </div>
          </div>

          {/* Campaign Accounts Breakdown Table */}
          <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Campaign-wise Accounts &amp; Donor Allocations
                </h3>
                <p className="text-xs text-gray-500">
                  Financial tracking and direct grassroots program mobilization.
                </p>
              </div>
              <span className="text-xs font-bold text-gray-600 px-2.5 py-1 bg-gray-100 rounded-lg">
                {campaignReports.length} Active Causes
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-500 text-[11px] uppercase tracking-wider border-b border-gray-200/80 font-bold">
                    <th className="py-3 px-6">Campaign Title</th>
                    <th className="py-3 px-6">Category</th>
                    <th className="py-3 px-6">Goal (INR)</th>
                    <th className="py-3 px-6">Collected (INR)</th>
                    <th className="py-3 px-6">Progress</th>
                    <th className="py-3 px-6">Donors</th>
                    <th className="py-3 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                  {campaignReports.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-gray-900 max-w-[240px] truncate">
                        {c.title}
                      </td>
                      <td className="py-3.5 px-6 text-xs text-gray-600">
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 font-semibold text-gray-700">
                          {c.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-gray-700">
                        ₹{Number(c.goalAmount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-6 font-extrabold text-[#EA3C36]">
                        ₹{Number(c.collectedAmount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-[#EA3C36] h-full rounded-full"
                              style={{ width: `${Math.min(100, c.percentage)}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-700">{c.percentage}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 font-bold text-gray-800">
                        {c.donorCount || 0}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {campaignReports.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-gray-500">
                        No active campaigns found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Form 10BD Statement */}
      {activeTab === 'form10bd' && (
        <div className="space-y-6">
          {/* Statutory Notice Card */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200/60 flex items-center justify-center text-[#EA3C36] font-bold shrink-0">
                <ShieldCheck className="w-6 h-6 text-[#EA3C36]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Form 10BD Electronic Filing Statement (FY {financialYear})
                </h3>
                <p className="text-xs text-gray-500">
                  Trust 80G Reg: CIT(E)/BPL/80G/2021-22/A-1089 • Trust PAN: AAATC1234D • Headquarters: Bhopal, MP
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 text-left sm:text-right">
              <div>
                <span className="text-[11px] text-gray-500 font-bold uppercase block tracking-wider">
                  Eligible Donors
                </span>
                <span className="text-xl font-black text-gray-900">{form10bdRecords.length}</span>
              </div>
              <div>
                <span className="text-[11px] text-gray-500 font-bold uppercase block tracking-wider">
                  Declared Value
                </span>
                <span className="text-xl font-black text-[#EA3C36]">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Form 10BD Table */}
          <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Schedule of Donors (Rule 18AB Electronic Specification)
                </h3>
                <p className="text-xs text-gray-500">
                  Annual statement of donations to be filed before 31st May with Income Tax Department.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                {form10bdRecords.length} Verified Records
              </span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-xs text-gray-500 font-semibold">
                Compiling statutory statement...
              </div>
            ) : form10bdRecords.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <FileSpreadsheet className="w-10 h-10 text-gray-400 mx-auto" />
                <h4 className="text-base font-bold text-gray-900">No Records for FY {financialYear}</h4>
                <p className="text-xs text-gray-500">No qualifying donations recorded for this financial period.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[780px]">
                  <thead>
                    <tr className="bg-gray-50/80 text-gray-500 text-[11px] uppercase tracking-wider border-b border-gray-200/80 font-bold">
                      <th className="py-3 px-6">Sl. No.</th>
                      <th className="py-3 px-6">Unique ID (PAN)</th>
                      <th className="py-3 px-6">Donor Name</th>
                      <th className="py-3 px-6">Address</th>
                      <th className="py-3 px-6">Donation Type</th>
                      <th className="py-3 px-6">Amount (INR)</th>
                      <th className="py-3 px-6">Receipt Number</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                    {form10bdRecords.map((r, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3.5 px-6 font-mono text-xs text-gray-500">{idx + 1}</td>
                        <td className="py-3.5 px-6 font-mono text-xs font-bold text-gray-900">
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-800">
                            {r.uniqueIdNumber}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 font-bold text-gray-900">{r.donorName}</td>
                        <td className="py-3.5 px-6 text-xs text-gray-600 max-w-[200px] truncate">
                          {r.address}
                        </td>
                        <td className="py-3.5 px-6 text-xs text-gray-600">
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 font-semibold text-gray-700">
                            {r.typeOfDonation}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 font-extrabold text-[#EA3C36]">
                          ₹{Number(r.donationAmount).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-6 font-mono text-xs font-bold text-gray-700">
                          {r.receiptNumber}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
