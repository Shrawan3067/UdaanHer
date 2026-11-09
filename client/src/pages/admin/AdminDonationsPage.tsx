import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';

export const AdminDonationsPage: React.FC = () => {
  const { language } = useLanguage();

  const [donations, setDonations] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);

  const fetchDonations = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminDonations({
        search: search.trim() || undefined,
        status: status || undefined,
        page,
        limit: 10,
      });
      setDonations(res.donations);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to load donations', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [status, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDonations();
  };

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
      alert('Failed to download receipt: ' + err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto w-full animate-fadeIn">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-label-caps text-label-caps uppercase text-secondary font-bold tracking-wider">
            Financial Ledger &amp; Compliance
          </span>
          <h1 className="font-headline-md text-headline-md text-primary font-bold">
            Donations &amp; Section 80G Receipts Registry
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Audit-grade record of all incoming contributions, atomic sequence numbers, and donor PAN data.
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-surface-container-lowest rounded-2xl border border-[#E5E7EB] p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by donor name, email, PAN, receipt..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-surface-container-low rounded-xl border border-[#E5E7EB] focus:outline-hidden"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 text-sm bg-surface-container-low border border-[#E5E7EB] rounded-xl font-label-md font-semibold text-on-surface cursor-pointer focus:outline-hidden"
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="PENDING">PENDING</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-on-surface-variant">Loading donation registry...</div>
        ) : donations.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <span className="material-symbols-outlined text-4xl text-outline">receipt_long</span>
            <h4 className="font-title-md text-primary font-bold">No Donations Found</h4>
            <p className="font-body-sm text-on-surface-variant">No contributions match your filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider border-b border-[#E5E7EB]">
                  <th className="py-3 px-6 font-semibold">Receipt &amp; Date</th>
                  <th className="py-3 px-6 font-semibold">Donor Details</th>
                  <th className="py-3 px-6 font-semibold">PAN</th>
                  <th className="py-3 px-6 font-semibold">Amount</th>
                  <th className="py-3 px-6 font-semibold">Campaign</th>
                  <th className="py-3 px-6 font-semibold">Status</th>
                  <th className="py-3 px-6 font-semibold text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-3.5 px-6">
                      <p className="font-mono text-xs font-bold text-primary">
                        {d.receipt?.receiptNumber || 'PENDING'}
                      </p>
                      <p className="font-body-sm text-xs text-on-surface-variant">
                        {new Date(d.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </td>

                    <td className="py-3.5 px-6">
                      <p className="font-label-md text-sm font-semibold text-on-surface">
                        {d.donor?.fullName || 'Anonymous Patron'}
                      </p>
                      <p className="font-body-sm text-xs text-on-surface-variant">{d.donor?.email}</p>
                    </td>

                    <td className="py-3.5 px-6 font-mono text-xs font-semibold text-on-surface">
                      {d.receipt?.donorPAN || '—'}
                    </td>

                    <td className="py-3.5 px-6">
                      <p className="font-title-md text-sm font-bold text-primary">
                        ₹{Number(d.amount).toLocaleString('en-IN')}
                      </p>
                      <p className="font-body-sm text-[11px] text-on-surface-variant">
                        {d.donationType === 'MONTHLY' ? 'Monthly' : 'One-Time'}
                      </p>
                    </td>

                    <td className="py-3.5 px-6 font-body-sm text-xs text-on-surface-variant">
                      {d.campaign?.title || 'General Welfare'}
                    </td>

                    <td className="py-3.5 px-6">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-label-sm text-xs font-semibold ${
                          d.status === 'SUCCESS'
                            ? 'bg-primary-fixed text-on-primary-fixed'
                            : d.status === 'FAILED'
                            ? 'bg-error-container text-on-error-container'
                            : 'bg-surface-container-high text-on-surface-variant'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      {d.receipt ? (
                        <button
                          type="button"
                          disabled={downloadingId === d.receipt.id}
                          onClick={() => handleDownloadPdf(d.receipt!.id, d.receipt!.receiptNumber)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-[16px] text-secondary">
                            picture_as_pdf
                          </span>
                          <span>{downloadingId === d.receipt.id ? 'Loading...' : 'PDF'}</span>
                        </button>
                      ) : (
                        <span className="text-xs text-on-surface-variant">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-[#E5E7EB] flex items-center justify-between">
            <span className="font-label-sm text-xs text-on-surface-variant">
              Page {page} of {pagination.totalPages} ({pagination.total} donations)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-sm text-xs disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page === pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-sm text-xs disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
