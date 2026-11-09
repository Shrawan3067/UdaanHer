import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Donation } from '../../types';

export const DonorDashboardPage: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'receipts' | 'updates' | 'pledges' | 'settings'>('receipts');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.getMyDonations();
        setDonations(data);
      } catch (err) {
        console.error('Failed to load donor history', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDownloadPdf = async (receiptId: string, receiptNumber: string) => {
    setDownloadingId(receiptId);
    try {
      const blob = await api.downloadReceiptPdfBlob(receiptId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `UdaanHer_80G_${receiptNumber.replace(/\//g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Failed to download receipt PDF: ' + err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const successfulDonations = donations.filter((d) => d.status === 'SUCCESS');
  const totalDonated = successfulDonations.reduce((sum, d) => sum + Number(d.amount), 0);
  const taxDeductionsTotal = Math.round(totalDonated * 0.5);

  const filteredDonations = donations.filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const rNum = d.receipt?.receiptNumber?.toLowerCase() || '';
    const campTitle = d.campaign?.title?.toLowerCase() || '';
    const payRef = d.paymentReference?.toLowerCase() || '';
    return rNum.includes(q) || campTitle.includes(q) || payRef.includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-10 w-full animate-fadeIn">
      {/* Top Navigation & Dashboard Meta Header */}
      <div className="flex flex-col gap-6">
        {/* Welcome Banner & Quick Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span>Active Verified Patron • Section 80G Certified</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
              Welcome back, {user?.fullName || 'Ananya Sharma'}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Track your philanthropic impact, access annual Section 80G certificates for tax filing, and follow project updates verified directly by local Gram Panchayats in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/donate"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-primary-gradient text-on-primary font-label-md text-label-md font-bold hover-lift shadow-xs transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Make a New Contribution</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Key Impact & Financial Summary Cards (Bento Grid of 4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat 1: Total Donated */}
        <div className="glass-card rounded-2xl p-6 shadow-xs flex flex-col justify-between border border-[#E5E7EB] hover-lift">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider font-bold">
                Total Donated
              </span>
              <div className="font-headline-md text-headline-md text-primary pt-1 font-extrabold">
                ₹{totalDonated.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-fixed/50 flex items-center justify-center text-primary shadow-xs">
              <span className="material-symbols-outlined text-[22px]">payments</span>
            </div>
          </div>
          <div className="pt-4 mt-2 flex items-center justify-between border-t border-[#E5E7EB]">
            <span className="font-body-sm text-xs text-on-surface-variant font-medium">
              Across {successfulDonations.length} contributions
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-[11px] font-bold">
              Live
            </span>
          </div>
        </div>

        {/* Stat 2: Section 80G Deductions */}
        <div className="glass-card rounded-2xl p-6 shadow-xs flex flex-col justify-between border border-[#E5E7EB] hover-lift">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider font-bold">
                80G Tax Deductions
              </span>
              <div className="font-headline-md text-headline-md text-secondary pt-1 font-extrabold">
                ₹{taxDeductionsTotal.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-secondary-fixed/50 flex items-center justify-center text-secondary shadow-xs">
              <span className="material-symbols-outlined text-[22px]">verified_user</span>
            </div>
          </div>
          <div className="pt-4 mt-2 flex items-center justify-between border-t border-[#E5E7EB]">
            <span className="font-body-sm text-xs text-on-surface-variant font-medium">50% IT Deduction</span>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-[11px] font-bold">
              Form 10BE Ready
            </span>
          </div>
        </div>

        {/* Stat 3: Supported Causes */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col justify-between border border-[#E5E7EB]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider font-semibold">
                Impact Outreach
              </span>
              <div className="font-headline-md text-headline-md text-primary pt-1 font-bold">
                {successfulDonations.length > 0 ? `${successfulDonations.length} Drives` : '9 Districts'}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">diversity_3</span>
            </div>
          </div>
          <div className="pt-4 mt-2 border-t border-[#E5E7EB]">
            <span className="font-body-sm text-body-sm text-on-surface-variant truncate block">
              Handlooms, Health Vans, Digital Pods
            </span>
          </div>
        </div>

        {/* Stat 4: Fund Utilization */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col justify-between border border-[#E5E7EB]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider font-semibold">
                Fund Deployment
              </span>
              <div className="font-headline-md text-headline-md text-primary pt-1 font-bold">100% Deployed</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">account_balance</span>
            </div>
          </div>
          <div className="pt-4 mt-2 flex items-center justify-between border-t border-[#E5E7EB]">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Zero platform deductions</span>
            <span className="font-label-sm text-label-sm text-secondary font-semibold">Audited</span>
          </div>
        </div>
      </div>

      {/* Interactive Navigation Tabs */}
      <div className="bg-surface-container-lowest p-2 rounded-2xl shadow-sm border border-[#E5E7EB]">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('receipts')}
            className={`px-4 py-2.5 rounded-xl font-label-md text-label-md transition-all flex items-center gap-2 ${
              activeTab === 'receipts'
                ? 'bg-primary text-on-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>Donation History &amp; Receipts</span>
            <span className="px-1.5 py-0.2 rounded-full bg-primary-container text-on-primary-container text-[11px] font-semibold">
              {donations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('updates')}
            className={`px-4 py-2.5 rounded-xl font-label-md text-label-md transition-all flex items-center gap-2 ${
              activeTab === 'updates'
                ? 'bg-primary text-on-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">satellite_alt</span>
            <span>Live Field Impact &amp; Photos</span>
            <span className="px-1.5 py-0.2 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-semibold">
              3
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pledges')}
            className={`px-4 py-2.5 rounded-xl font-label-md text-label-md transition-all flex items-center gap-2 ${
              activeTab === 'pledges'
                ? 'bg-primary text-on-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">event_repeat</span>
            <span>Recurring Pledges</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Donation History & Receipts */}
      {activeTab === 'receipts' && (
        <div className="flex flex-col gap-6">
          {/* Search, Filter Toolbar */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 border border-[#E5E7EB]">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                  search
                </span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by receipt number, campaign, or transaction ID..."
                  className="w-full pl-11 pr-4 py-2.5 bg-surface-container-low rounded-xl font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/70 border border-[#E5E7EB] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Receipts Table */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-[#E5E7EB]">
            {isLoading ? (
              <div className="p-12 text-center text-on-surface-variant">Loading contribution history...</div>
            ) : filteredDonations.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <span className="material-symbols-outlined text-4xl text-outline">receipt_long</span>
                <h4 className="font-title-md text-title-md text-primary font-bold">No Donations Found</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  You haven't made any donations yet, or no receipts match your search.
                </p>
                <Link
                  to="/donate"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md"
                >
                  Make a Donation
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider border-b border-[#E5E7EB]">
                      <th className="py-4 px-6 font-semibold">Receipt &amp; Date</th>
                      <th className="py-4 px-6 font-semibold">Cause / Campaign</th>
                      <th className="py-4 px-6 font-semibold">Contribution</th>
                      <th className="py-4 px-6 font-semibold">Status</th>
                      <th className="py-4 px-6 font-semibold text-right">80G Certificate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {filteredDonations.map((d) => (
                      <tr key={d.id} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-mono text-xs font-bold text-primary">
                            {d.receipt?.receiptNumber || 'PENDING'}
                          </p>
                          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                            {new Date(d.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-title-md text-[14px] font-semibold text-on-surface">
                            {d.campaign?.title || 'General Women Welfare Fund'}
                          </p>
                          <p className="font-body-sm text-xs text-on-surface-variant">
                            {d.donationType === 'MONTHLY' ? 'Monthly Pledge' : 'One-Time'}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-headline-sm text-headline-sm font-bold text-primary">
                            ₹{Number(d.amount).toLocaleString('en-IN')}
                          </p>
                          <p className="font-body-sm text-[11px] text-secondary font-medium">
                            ₹{Math.round(Number(d.amount) * 0.5).toLocaleString('en-IN')} 80G deductible
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          {d.status === 'SUCCESS' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-xs font-semibold">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span> Success
                            </span>
                          ) : d.status === 'FAILED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-xs font-semibold">
                              <span className="material-symbols-outlined text-[14px]">cancel</span> Failed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-xs font-semibold">
                              <span className="material-symbols-outlined text-[14px]">schedule</span> Pending
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {d.receipt ? (
                            <button
                              onClick={() => handleDownloadPdf(d.receipt!.id, d.receipt!.receiptNumber)}
                              disabled={downloadingId === d.receipt.id}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container text-primary font-label-sm text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-[16px] text-secondary">
                                picture_as_pdf
                              </span>
                              <span>{downloadingId === d.receipt.id ? 'Downloading...' : 'PDF Receipt'}</span>
                            </button>
                          ) : (
                            <span className="font-body-sm text-xs text-on-surface-variant">—</span>
                          )}
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

      {/* TAB 2: Live Field Impact & Photos */}
      {activeTab === 'updates' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-[#E5E7EB]">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0yZrBNsf5tCCWRpEqyvrgn7PynsUcqw1WFExML40GciCuOiN06sO1rfju4R2iL7i1q_tCDL9ugpZq8w4mgTC9_MhNQBEC53p2guBzH5WgPF1xZ1xESy-19KpghEa-BLI_BkFvmEgoN2V_VmEL-36v0cx_ctdYRlIk81O_UOcVEZ1KQ4-Z-tO9312ChFihJTFw88k-9ZshDLic-DZtouos9GVoCsQwlUPe5lRLf9sH"
              alt="Health van in Sehore"
              className="w-full h-44 object-cover"
            />
            <div className="p-5 space-y-2">
              <span className="font-label-caps text-secondary font-semibold uppercase">Sehore District</span>
              <h3 className="font-title-md text-primary font-bold">Diagnostic Van Field Round #18 Completed</h3>
              <p className="font-body-sm text-on-surface-variant">
                142 women screened for maternal hemoglobin levels with instant calcium &amp; folate delivery.
              </p>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-[#E5E7EB]">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAujDufzPHzuINJT1kSBH6Ld-ks3XFpe5_7aESEsQ2woEtmBNM6GD8Mw5701Uh2bFuaOR2Ltv2rpJjj70tvYKIMg1uXykFfnv6Pt-ve50-P67c8GkvhO77qZAHESQFvoJmG2y1tSJi6WXOiVuPeELTid2ViRamIr57FmbwCOZr6gMqePYzCSpIRFH2ixXjYWe8dI6VhtKuQjVsiKGcxqeiZjQ0UFgp9QfghczzYS5pp"
              alt="Artisan loom training"
              className="w-full h-44 object-cover"
            />
            <div className="p-5 space-y-2">
              <span className="font-label-caps text-secondary font-semibold uppercase">Hoshangabad Cluster</span>
              <h3 className="font-title-md text-primary font-bold">New Organic Handloom Batch Dispatched</h3>
              <p className="font-body-sm text-on-surface-variant">
                30 women from the Maa Narmada SHG delivered 400 meters of traditional fabric to fair-trade buyers.
              </p>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-[#E5E7EB]">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnGMmSC1b7YlbL4MlJGkMysFCz8FOLz-IMsIEHfGU3XPMaCx8Z_V73HN1KaXXORkuRh7Jl1kQ3iydvAcTVE6PLAlcrlWj7oals0LYKjAQJgz1z-CVGxEw-Z7fqxUOJWVZoXTI3BC9aNyfyudSgU0Ep9p2LfUMBufdCvULP0MmgWxbNTv10SkqGWS6wkUFcmroqK_lpHpxJCOcKtA217Aq6VS1Whrk8BgvQPsTS-WYM"
              alt="Digital literacy pods"
              className="w-full h-44 object-cover"
            />
            <div className="p-5 space-y-2">
              <span className="font-label-caps text-secondary font-semibold uppercase">Raisen Village</span>
              <h3 className="font-title-md text-primary font-bold">Solar Tablet Learning Pod Inaugurated</h3>
              <p className="font-body-sm text-on-surface-variant">
                First batch of 45 adolescent girls completed introductory computer education modules.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Recurring Pledges */}
      {activeTab === 'pledges' && (
        <div className="bg-surface-container-lowest rounded-2xl p-8 text-center space-y-4 border border-[#E5E7EB] animate-fadeIn">
          <span className="material-symbols-outlined text-4xl text-primary">event_repeat</span>
          <h3 className="font-headline-sm text-primary font-bold">Monthly Guardian Program</h3>
          <p className="font-body-md text-on-surface-variant max-w-lg mx-auto">
            Become a sustained monthly guardian of rural women's independence. Predictable monthly contributions enable us to plan long-term village visits and mobile health routes.
          </p>
          <Link
            to="/donate"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-on-secondary font-label-md font-semibold hover:bg-[#B56C4A] shadow-sm transition-colors"
          >
            Start a Monthly Pledge
          </Link>
        </div>
      )}
    </div>
  );
};
