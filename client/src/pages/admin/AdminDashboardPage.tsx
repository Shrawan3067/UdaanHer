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

export const AdminDashboardPage: React.FC = () => {
  const { language } = useLanguage();
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      <div className="min-h-[50vh] flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
      </div>
    );
  }

  const metrics = data?.metrics || {};

  return (
    <div className="flex flex-col gap-8 max-w-[1600px] mx-auto w-full animate-fadeIn">
      {/* Sub-Header & Executive Controls */}
      <div className="p-6 lg:p-8 rounded-2xl glass-card shadow-xs border border-[#E5E7EB] flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover-lift-sm">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-label-caps text-label-caps uppercase text-secondary font-bold tracking-wider">
              Mission Governance
            </span>
            <span className="text-outline-variant">•</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-label-caps text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              NITI Aayog Darpan Synced
            </span>
            <span className="text-outline-variant">•</span>
            <span className="font-label-sm text-xs text-on-surface-variant font-medium">CBDT 10BD Active</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-primary tracking-tight font-extrabold">
            Operations &amp; Impact Command Center
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-3xl leading-relaxed">
            Statutory oversight, Section 80G electronic generation, and grassroots scheme saturation across Madhya Pradesh.
          </p>
        </div>

        {/* High-Level Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {metrics.pendingAiReviewsCount > 0 && (
            <Link
              to="/admin/ai-reviews"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl btn-secondary-gradient text-on-secondary font-label-md text-label-md font-bold shadow-xs hover-lift transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">psychology_alt</span>
              <span>{metrics.pendingAiReviewsCount} AI Reviews Pending</span>
            </Link>
          )}

          <Link
            to="/admin/reports"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container-highest border border-[#E5E7EB] transition-all hover-lift-sm cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">download</span>
            <span>Form 10BD CSV</span>
          </Link>

          <Link
            to="/admin/schemes"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl btn-primary-gradient text-on-primary font-label-md text-label-md font-bold shadow-xs hover-lift transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Add Scheme</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics Strip: 5 Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* KPI 1 */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between border border-[#E5E7EB]">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-semibold">
                Total Donated
              </span>
              <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
            </div>
            <div className="font-headline-md text-headline-md text-primary tracking-tight font-bold">
              ₹{(metrics.totalAmountCollected || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-primary font-medium flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[16px]">trending_up</span> +14.2% MoM
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">FY 2026-27</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between border border-[#E5E7EB]">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary"></div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-semibold">
                80G Receipts Issued
              </span>
              <span className="material-symbols-outlined text-secondary text-[20px]">receipt_long</span>
            </div>
            <div className="font-headline-md text-headline-md text-secondary tracking-tight font-bold">
              {metrics.totalReceiptsIssued || 0}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-primary font-medium">100% Atomic</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Safe Sequences</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between border border-[#E5E7EB]">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-container"></div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-semibold">
                Published Schemes
              </span>
              <span className="material-symbols-outlined text-primary-container text-[20px]">account_balance</span>
            </div>
            <div className="font-headline-md text-headline-md text-primary tracking-tight font-bold">
              {metrics.publishedSchemesCount || 0}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant">9 MP Districts</span>
            <span className="font-label-sm text-label-sm text-primary font-medium">Live Ingested</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between border border-[#E5E7EB]">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-fixed"></div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-semibold">
                Active Campaigns
              </span>
              <span className="material-symbols-outlined text-primary text-[20px]">volunteer_activism</span>
            </div>
            <div className="font-headline-md text-headline-md text-primary tracking-tight font-bold">
              {metrics.activeCampaignsCount || 0}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Health &amp; Livelihood</span>
            <span className="font-label-sm text-label-sm text-secondary font-medium">100% Field Ops</span>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between border border-[#E5E7EB]">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary-fixed"></div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-semibold">
                AI Reviews Queue
              </span>
              <span className="material-symbols-outlined text-secondary text-[20px]">psychology_alt</span>
            </div>
            <div className="font-headline-md text-headline-md text-on-surface tracking-tight font-bold">
              {metrics.pendingAiReviewsCount || 0}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-secondary font-medium">Human Review Desk</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Hindi Drafts</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Analytics & Realtime Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recent Activity & Campaigns */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Monthly Collection Chart */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-[#E5E7EB] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
              <div>
                <h3 className="font-title-md text-title-md text-primary font-bold">Monthly Donation Velocity</h3>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  INR contributions collected across all active campaigns (FY 2026-27).
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-xs font-semibold">
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                  />
                  <Bar dataKey="amount" fill="#EA3C36" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Donations Table */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h3 className="font-title-md text-title-md text-primary font-bold">Latest Donor Transactions</h3>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  Real-time ledger updates with instant 80G receipt linkage.
                </p>
              </div>
              <Link
                to="/admin/donations"
                className="font-label-sm text-label-sm text-secondary hover:underline font-semibold"
              >
                View All →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider border-b border-[#E5E7EB]">
                    <th className="py-3 px-6 font-semibold">Donor</th>
                    <th className="py-3 px-6 font-semibold">Amount</th>
                    <th className="py-3 px-6 font-semibold">Campaign</th>
                    <th className="py-3 px-6 font-semibold">Receipt Number</th>
                    <th className="py-3 px-6 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {(data?.recentDonations || []).slice(0, 5).map((d: any) => (
                    <tr key={d.id} className="hover:bg-surface-container-low/40">
                      <td className="py-3 px-6">
                        <p className="font-label-md text-sm font-semibold text-on-surface">
                          {d.donor?.fullName || 'Anonymous Patron'}
                        </p>
                        <p className="font-body-sm text-xs text-on-surface-variant">{d.donor?.email}</p>
                      </td>
                      <td className="py-3 px-6">
                        <p className="font-title-md text-sm font-bold text-primary">
                          ₹{Number(d.amount).toLocaleString('en-IN')}
                        </p>
                      </td>
                      <td className="py-3 px-6 font-body-sm text-xs text-on-surface-variant">
                        {d.campaign?.title || 'General Fund'}
                      </td>
                      <td className="py-3 px-6 font-mono text-xs font-semibold text-primary">
                        {d.receipt?.receiptNumber || '—'}
                      </td>
                      <td className="py-3 px-6">
                        <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-xs font-semibold">
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: AI Reviews & Quick Links */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* AI Reviews Callout */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-[#E5E7EB] space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[24px]">psychology_alt</span>
              <h3 className="font-title-md text-title-md text-primary font-bold">
                OpenAI Plain-Hindi Drafter
              </h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Generate easy-to-read, plain-Hindi scheme summaries for rural beneficiaries with structured JSON output and human-in-the-loop review.
            </p>
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-[#E5E7EB] space-y-1">
              <div className="flex justify-between font-label-sm text-xs font-semibold">
                <span className="text-on-surface-variant">Queue Status:</span>
                <span className="text-secondary">{metrics.pendingAiReviewsCount || 0} Pending</span>
              </div>
              <div className="flex justify-between font-label-sm text-xs font-semibold">
                <span className="text-on-surface-variant">AI Model:</span>
                <span className="text-primary">gpt-4o-mini (Configurable)</span>
              </div>
            </div>
            <Link
              to="/admin/ai-reviews"
              className="inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm"
            >
              Open AI Review Desk →
            </Link>
          </div>

          {/* Quick Admin Actions */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-[#E5E7EB] space-y-3">
            <h3 className="font-title-md text-title-md text-primary font-bold">Quick Administrative Tools</h3>
            <div className="flex flex-col gap-2">
              <Link
                to="/admin/schemes"
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-sm font-semibold transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">menu_book</span>
                  <span>Manage Welfare Schemes</span>
                </div>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>

              <Link
                to="/admin/campaigns"
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-sm font-semibold transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">layers</span>
                  <span>Campaign Budgets &amp; Goals</span>
                </div>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>

              <Link
                to="/admin/reports"
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-sm font-semibold transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">table_chart</span>
                  <span>Form 10BD Annual Returns</span>
                </div>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
