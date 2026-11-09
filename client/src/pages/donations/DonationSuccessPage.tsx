import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { CheckCircle2, Download, ArrowRight, ShieldCheck } from 'lucide-react';

export const DonationSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const donationId = searchParams.get('donationId');
  const { language } = useLanguage();

  const [donation, setDonation] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDonation = async () => {
      if (!donationId) {
        setError('No donation ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.getDonationById(donationId);
        setDonation(data);
      } catch (err: any) {
        setError(err.message || 'Failed to retrieve donation confirmation');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonation();
  }, [donationId]);

  const handleDownloadPdf = async () => {
    if (!donation?.receipt?.id) return;
    setIsDownloading(true);
    try {
      const blob = await api.downloadReceiptPdfBlob(donation.receipt.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `UdaanHer_80G_Receipt_${donation.receipt.receiptNumber.replace(/\//g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Failed to download PDF: ' + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-[#EA3C36] animate-spin">refresh</span>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center space-y-4">
        <h2 className="text-xl text-[#EA3C36] font-bold">Donation Confirmation Error</h2>
        <p className="text-sm text-gray-600">{error || 'Could not locate your donation order.'}</p>
        <Link
          to="/donate"
          className="inline-block px-5 py-2.5 bg-[#EA3C36] text-white font-semibold rounded-lg"
        >
          Back to Donation Page
        </Link>
      </div>
    );
  }

  const receipt = donation.receipt;

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-12 py-12 space-y-8 animate-fadeIn text-[#1A1A1A]">
      {/* Success Hero Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs uppercase font-bold tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>Donation Successfully Confirmed</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
          Thank You For Your Gracious Support!
        </h1>
        <p className="text-sm text-gray-600 max-w-lg mx-auto">
          Your voluntary contribution has been safely credited to our direct community fund with zero administrative broker deductions.
        </p>
      </div>

      {/* 80G Receipt Voucher Card */}
      {receipt && (
        <div className="bg-white rounded-xl border-2 border-red-100 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
            <div>
              <span className="text-xs uppercase text-[#EA3C36] font-bold tracking-wider">
                Official Section 80G Certificate
              </span>
              <p className="font-mono text-base font-bold text-[#1A1A1A] mt-1">{receipt.receiptNumber}</p>
            </div>
            <div className="sm:text-right">
              <span className="text-xs text-gray-500 font-medium">Issued Date</span>
              <p className="text-sm font-bold text-[#1A1A1A]">
                {new Date(receipt.issuedAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200 space-y-1">
              <span className="text-[11px] text-gray-500 uppercase font-bold">Donor Legal Name</span>
              <p className="text-sm font-bold text-[#1A1A1A]">{receipt.donorName}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200 space-y-1">
              <span className="text-[11px] text-gray-500 uppercase font-bold">Donor PAN</span>
              <p className="font-mono text-sm font-bold text-[#1A1A1A]">{receipt.donorPAN || 'Not Supplied'}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200 space-y-1">
              <span className="text-[11px] text-gray-500 uppercase font-bold">Donation Amount</span>
              <p className="text-2xl font-extrabold text-[#EA3C36]">
                ₹{Number(receipt.donationAmount).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200 space-y-1">
              <span className="text-[11px] text-gray-500 uppercase font-bold">
                Section 80G Eligible Deduction
              </span>
              <p className="text-2xl font-extrabold text-[#00A3C4]">
                ₹{Math.round(Number(receipt.donationAmount) * 0.5).toLocaleString('en-IN')} (50%)
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="w-full sm:flex-1 py-3 px-6 rounded-lg bg-[#EA3C36] hover:bg-[#D32F2F] text-white font-bold text-sm shadow-md hover-lift transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Downloading Vector PDF...' : 'Download Official 80G PDF'}</span>
            </button>

            <Link
              to="/donor/dashboard"
              className="w-full sm:w-auto py-3 px-6 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#1A1A1A] font-bold text-sm transition-all flex items-center justify-center gap-1.5"
            >
              <span>Donor Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Trust reassurance */}
      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 flex items-center gap-3 text-gray-600 text-xs">
        <ShieldCheck className="w-5 h-5 text-[#EA3C36] shrink-0" />
        <span>
          A digital copy of this 80G certificate has been logged in our electronic CBDT return registry for Form 10BD annual verification.
        </span>
      </div>
    </div>
  );
};
