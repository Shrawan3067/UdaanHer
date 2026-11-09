import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';

export const AdminReportsPage: React.FC = () => {
  const { language } = useLanguage();

  const [form10bdRecords, setForm10bdRecords] = useState<any[]>([]);
  const [financialYear, setFinancialYear] = useState('2026-27');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      try {
        const data = await api.getForm10BDReport(financialYear);
        setForm10bdRecords(data);
      } catch (err) {
        console.error('Failed to load Form 10BD report', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [financialYear]);

  const handleExportCsv = () => {
    const url = api.getForm10BDCsvUrl(financialYear);
    window.open(url, '_blank');
  };

  const totalAmount = form10bdRecords.reduce((sum, r) => sum + Number(r.donationAmount), 0);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto w-full animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-label-caps text-label-caps uppercase font-bold mb-1">
            <span className="material-symbols-outlined text-[16px]">account_balance</span>
            <span>Statutory NGO Return Filing Suite</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-primary font-bold">
            {language === 'HI' ? 'फॉर्म 10BD अनुपालन एवं रिपोर्ट' : 'Form 10BD Electronic Filing Report'}
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Compiled statement of donations for electronic submission to the Income Tax Department under Rule 18AB.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            className="px-3.5 py-2 text-sm bg-surface-container-low border border-[#E5E7EB] rounded-xl font-label-md font-semibold text-on-surface cursor-pointer focus:outline-hidden"
          >
            <option value="2026-27">FY 2026-27 (Current)</option>
            <option value="2025-26">FY 2025-26</option>
          </select>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-container text-on-primary font-label-md text-sm font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Export Form 10BD (CSV)</span>
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="bg-surface-container-lowest rounded-2xl border border-[#E5E7EB] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary font-bold">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
          <div>
            <h3 className="font-title-md text-title-md font-bold text-primary">Form 10BD Annual Donor Statement</h3>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Trust 80G Reg: CIT(E)/BPL/80G/2021-22/A-1089 • Trust PAN: AAATC1234D
            </p>
          </div>
        </div>

        <div className="flex gap-8 sm:text-right">
          <div>
            <span className="font-label-caps text-label-caps text-on-surface-variant font-semibold uppercase block">
              Total Verified Donors
            </span>
            <span className="font-headline-sm text-headline-sm font-bold text-primary">{form10bdRecords.length}</span>
          </div>
          <div>
            <span className="font-label-caps text-label-caps text-on-surface-variant font-semibold uppercase block">
              Statement Aggregate Value
            </span>
            <span className="font-headline-sm text-headline-sm font-bold text-secondary">
              ₹{totalAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Form 10BD Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
        <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
          <h3 className="font-title-md text-title-md text-primary font-bold">
            Schedule of Donors (Form 10BD Electronic Specification)
          </h3>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {form10bdRecords.length} records ready for filing
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-on-surface-variant">Compiling Form 10BD statement...</div>
        ) : form10bdRecords.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <span className="material-symbols-outlined text-4xl text-outline">table_chart</span>
            <h4 className="font-title-md text-primary font-bold">No Records for Selected Financial Year</h4>
            <p className="font-body-sm text-on-surface-variant">No successful donations recorded for FY {financialYear}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider border-b border-[#E5E7EB]">
                  <th className="py-3 px-6 font-semibold">Sl. No.</th>
                  <th className="py-3 px-6 font-semibold">Unique ID (PAN)</th>
                  <th className="py-3 px-6 font-semibold">Donor Name</th>
                  <th className="py-3 px-6 font-semibold">Address</th>
                  <th className="py-3 px-6 font-semibold">Donation Type</th>
                  <th className="py-3 px-6 font-semibold">Amount (INR)</th>
                  <th className="py-3 px-6 font-semibold">Receipt Number</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {form10bdRecords.map((r, idx) => (
                  <tr key={idx} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-3 px-6 font-mono text-xs text-on-surface-variant">{idx + 1}</td>
                    <td className="py-3 px-6 font-mono text-xs font-bold text-primary">{r.uniqueIdNumber}</td>
                    <td className="py-3 px-6 font-label-md text-sm font-semibold text-on-surface">{r.donorName}</td>
                    <td className="py-3 px-6 font-body-sm text-xs text-on-surface-variant max-w-[200px] truncate">
                      {r.address}
                    </td>
                    <td className="py-3 px-6 font-label-sm text-xs text-on-surface-variant">
                      <span className="px-2 py-0.5 rounded-md bg-surface-container font-semibold">
                        {r.typeOfDonation}
                      </span>
                    </td>
                    <td className="py-3 px-6 font-title-md text-sm font-bold text-primary">
                      ₹{Number(r.donationAmount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-6 font-mono text-xs font-semibold text-secondary">{r.receiptNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
