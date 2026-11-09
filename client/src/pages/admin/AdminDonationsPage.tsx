import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import {
  Search,
  Download,
  Receipt,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  CreditCard,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

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
    <div className="space-y-6 max-w-[1600px] mx-auto w-full animate-fadeIn font-poppins text-[#1A1A1A]">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white shadow-2xs border border-gray-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold text-[#EA3C36] tracking-wider">
              Financial Ledger &amp; Compliance
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-gray-500 font-semibold">Atomic Sequences</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
            Donations &amp; Section 80G Receipts Registry
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mt-0.5">
            Audit-grade record of all incoming contributions, atomic sequence numbers, and donor PAN data compliant with CBDT Form 10BD.
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by donor name, email, PAN, receipt..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden focus:bg-white focus:border-[#EA3C36] transition-colors"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 cursor-pointer focus:outline-hidden focus:bg-white focus:border-[#EA3C36]"
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">SUCCESS (Verified)</option>
            <option value="PENDING">PENDING</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-gray-500 font-semibold">
            Loading donation registry...
          </div>
        ) : donations.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Receipt className="w-10 h-10 text-gray-400 mx-auto" />
            <h4 className="text-base font-bold text-gray-900">No Donations Found</h4>
            <p className="text-xs text-gray-500">No contributions match your filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-[11px] uppercase tracking-wider border-b border-gray-200/80">
                  <th className="py-3 px-6 font-bold">Receipt &amp; Date</th>
                  <th className="py-3 px-6 font-bold">Donor Details</th>
                  <th className="py-3 px-6 font-bold">PAN / ID</th>
                  <th className="py-3 px-6 font-bold">Amount</th>
                  <th className="py-3 px-6 font-bold">Campaign</th>
                  <th className="py-3 px-6 font-bold">Status</th>
                  <th className="py-3 px-6 font-bold text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-mono text-xs font-bold text-gray-900">
                        {d.receipt?.receiptNumber ? (
                          <span className="px-2 py-0.5 rounded bg-red-50 border border-red-200/60 text-[#EA3C36]">
                            {d.receipt.receiptNumber}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>
                          {new Date(d.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </p>
                    </td>

                    <td className="py-4 px-6">
                      <p className="text-xs sm:text-sm font-bold text-gray-900">
                        {d.donor?.fullName || 'Anonymous Patron'}
                      </p>
                      <p className="text-xs text-gray-500">{d.donor?.email}</p>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-gray-100 rounded text-gray-700">
                        {d.donor?.pan || 'Not Provided'}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <p className="text-xs sm:text-sm font-extrabold text-[#EA3C36]">
                        ₹{Number(d.amount).toLocaleString('en-IN')}
                      </p>
                    </td>

                    <td className="py-4 px-6 text-xs text-gray-700 font-medium">
                      {d.campaign?.title || 'General Welfare Fund'}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          d.status === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : d.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-red-50 text-red-800 border-red-200'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      {d.receipt ? (
                        <button
                          type="button"
                          disabled={downloadingId === d.receipt.id}
                          onClick={() => handleDownloadPdf(d.receipt.id, d.receipt.receiptNumber)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-red-50 hover:border-red-200 text-xs font-bold text-[#EA3C36] border border-gray-200 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{downloadingId === d.receipt.id ? 'Fetching...' : '80G PDF'}</span>
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/60">
            <span className="text-xs text-gray-500 font-semibold">
              Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} records)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setPage(pagination.page - 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage(pagination.page + 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
