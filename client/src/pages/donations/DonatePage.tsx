import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Campaign } from '../../types';
import { Heart, Shield, CheckCircle2, Building, CreditCard, Smartphone, ArrowRight, Lock } from 'lucide-react';

export const DonatePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const campaignParam = searchParams.get('campaign');
  const amountParam = searchParams.get('amount');
  const typeParam = searchParams.get('type');
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [amount, setAmount] = useState<number>(amountParam ? parseInt(amountParam, 10) || 1000 : 1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donationType, setDonationType] = useState<'ONE_TIME' | 'MONTHLY'>('ONE_TIME');

  // Donor Details
  const [donorName, setDonorName] = useState(user?.fullName || 'Ananya Sharma');
  const [donorEmail, setDonorEmail] = useState(user?.email || 'ananya.sharma@example.com');
  const [donorPhone, setDonorPhone] = useState(user?.phone || '9820144521');
  const [donorPAN, setDonorPAN] = useState('ABCPS1234F');
  const [donorAddress, setDonorAddress] = useState('Plot 42, Malviya Nagar, Bhopal, MP - 462003');
  const [simulateForeignCard, setSimulateForeignCard] = useState(false);

  // Flow State
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [createdDonation, setCreatedDonation] = useState<any | null>(null);
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NET_BANKING'>('UPI');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await api.getPublicCampaigns();
        setCampaigns(data);

        if (campaignParam) {
          const match = data.find((c) => c.slug === campaignParam || c.id === campaignParam);
          if (match) {
            setSelectedCampaignId(match.id);
          } else if (data.length > 0) {
            setSelectedCampaignId(data[0].id);
          }
        } else if (data.length > 0) {
          setSelectedCampaignId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load campaigns for donation', err);
      } finally {
        setIsLoadingCampaigns(false);
      }
    };
    fetchCampaigns();
  }, [campaignParam]);

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCustomAmount(val);
    if (val) {
      setAmount(parseInt(val, 10));
    }
  };

  const handleCreateDonationOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedCampaignId) {
      setFormError('Please select an impact campaign');
      return;
    }
    if (amount < 100) {
      setFormError('Minimum donation amount is ₹100');
      return;
    }
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(donorPAN.trim().toUpperCase())) {
      setFormError('Please enter a valid 10-character Indian PAN (e.g. ABCPS1234F)');
      return;
    }
    if (!donorAddress.trim() || donorAddress.trim().length < 5) {
      setFormError('Full postal address is required for 80G tax receipt compliance');
      return;
    }

    if (simulateForeignCard) {
      setFormError(
        'Foreign contributions cannot be accepted through this platform because FCRA processing is outside the current phase. Only domestic Indian INR contributions are allowed.'
      );
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const idempotencyKey = `IDEMP-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const donation = await api.createDonation({
        campaignId: selectedCampaignId,
        amount,
        donationType,
        donorName,
        donorEmail,
        donorPhone,
        donorPAN: donorPAN.trim().toUpperCase(),
        donorAddress,
        idempotencyKey,
        isForeignCard: simulateForeignCard,
      });

      setCreatedDonation(donation);
      setShowSimulatorModal(true);
    } catch (err: any) {
      setFormError(err.message || 'Failed to initiate donation order.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleExecutePaymentSimulation = async (outcome: 'SUCCESS' | 'FAILED' | 'PENDING') => {
    if (!createdDonation) return;
    setIsProcessingPayment(true);
    setFormError(null);

    try {
      await api.processMockPayment({
        donationId: createdDonation.id,
        method: paymentMethod,
        outcome,
        isForeignCard: simulateForeignCard,
      });

      if (outcome === 'SUCCESS') {
        navigate(`/donate/success?donationId=${createdDonation.id}`);
      } else if (outcome === 'FAILED') {
        navigate(`/donate/failed?donationId=${createdDonation.id}`);
      } else {
        alert('Payment marked as PENDING. No receipt will be issued until confirmation.');
        setShowSimulatorModal(false);
      }
    } catch (err: any) {
      setFormError(err.message || 'Payment simulation failed.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Section 80G calculations
  const taxDeduction = Math.round(amount * 0.5);
  const estimatedTaxSaved = Math.round(taxDeduction * 0.312); // ~30% slab + 4% cess

  return (
    <div className="flex flex-col w-full bg-white text-[#1A1A1A]">
      {/* Top Banner Matching PDF */}
      <section className="w-full bg-[#F8F9FA] py-12 px-6 lg:px-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#EA3C36] text-xs uppercase font-bold tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#EA3C36]"></span>
              Ways to Donate • Red Cross Humanitarian Network
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-[#EA3C36]" />
              Section 8 Non-Profit • 80G Tax Exemption
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A1A1A] tracking-tight leading-tight">
                Your Gift Could Change Someone's Life
              </h1>
              <p className="text-gray-600 text-base leading-relaxed max-w-2xl">
                The mission of UdaanHer Charitable Trust is to give women wings to fly: empower Indian women, support families in distress, and provide 100% transparent Section 80G tax-exempt charitable aid across India.
              </p>
            </div>

            {/* Transparency Highlight from PDF */}
            <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-[#EA3C36] font-bold text-sm">
                <Heart className="w-4 h-4 fill-current" />
                <span>Where Your Money Goes</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                <strong className="text-gray-900 font-bold">92% of the donation</strong> will go directly to core humanitarian services, healthcare, and livelihood programs, and the rest 8% to operation, management, and logistics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Donation Container */}
      <main className="w-full px-6 lg:px-12 py-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Form Inputs (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {formError && (
              <div className="p-4 rounded-xl bg-red-50 text-red-700 flex items-start gap-3 border border-red-200">
                <span className="material-symbols-outlined text-[20px] text-red-600 shrink-0 mt-0.5">error</span>
                <p className="text-sm leading-relaxed">{formError}</p>
              </div>
            )}

            {/* Step 1: Campaign Selection */}
            <section className="bg-white p-6 lg:p-8 rounded-xl shadow-xs border border-gray-200 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#EA3C36] font-bold">
                    STEP 01
                  </span>
                  <h2 className="text-xl font-bold text-[#1A1A1A]">
                    Select Campaign &amp; Program
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-red-50 text-[#EA3C36] text-xs font-bold">
                  92% Core Aid
                </span>
              </div>

              {isLoadingCampaigns ? (
                <div className="p-8 text-center text-gray-500">Loading programs...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {campaigns.map((camp) => {
                    const isSelected = selectedCampaignId === camp.id;
                    const percent = Math.min(
                      100,
                      Math.round(((camp.collectedAmount || 0) / (camp.goalAmount || 1)) * 100)
                    );
                    return (
                      <div
                        key={camp.id}
                        onClick={() => setSelectedCampaignId(camp.id)}
                        className={`p-4 rounded-xl cursor-pointer transition-all border flex flex-col justify-between space-y-3 ${
                          isSelected
                            ? 'border-[#EA3C36] bg-red-50/50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                              {camp.category}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-[#EA3C36]" />
                            )}
                          </div>
                          <h3 className="font-bold text-sm text-[#1A1A1A] leading-snug">
                            {camp.title}
                          </h3>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>₹{(camp.collectedAmount || 0).toLocaleString('en-IN')}</span>
                            <span className="font-bold text-[#EA3C36]">{percent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="bg-[#EA3C36] h-full rounded-full" style={{ width: `${percent}%` }}></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Step 2: Donation Amount Card Matching Page 2 of PDF */}
            <section className="bg-white p-6 lg:p-8 rounded-xl shadow-xs border border-gray-200 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#EA3C36] font-bold">
                    STEP 02
                  </span>
                  <h2 className="text-xl font-bold text-[#1A1A1A]">
                    Donation Amount
                  </h2>
                </div>
                {/* Frequency switch */}
                <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100">
                  <button
                    type="button"
                    onClick={() => setDonationType('ONE_TIME')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      donationType === 'ONE_TIME'
                        ? 'bg-[#EA3C36] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    One-Time
                  </button>
                  <button
                    type="button"
                    onClick={() => setDonationType('MONTHLY')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      donationType === 'MONTHLY'
                        ? 'bg-[#EA3C36] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* Currency: Indian Rupee (INR) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700">Currency &amp; Compliance</label>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-[#EA3C36] font-bold text-xs border border-red-200">
                    <span className="w-2 h-2 rounded-full bg-[#EA3C36]" />
                    <span>₹ Indian Rupee (INR)</span>
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium">
                    Domestic Indian contributions only • Section 80G Tax Exemption Eligible
                  </span>
                </div>
              </div>

              {/* Quick Amounts Grid */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700">Select or enter an amount</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[100, 500, 1000, 5000].map((amt) => {
                    const isSelected = amount === amt && !customAmount;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleAmountSelect(amt)}
                        className={`py-3 rounded-lg text-sm font-bold border transition-all cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? 'border-[#EA3C36] bg-red-50 text-[#EA3C36] shadow-xs'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <span>₹{amt.toLocaleString('en-IN')}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Amount */}
                <div className="pt-2">
                  <input
                    type="number"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    placeholder="Custom amount (e.g. 10000)"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#EA3C36] focus:outline-hidden"
                  />
                </div>
              </div>
            </section>

            {/* Step 3: Donor Details for 80G Receipt */}
            <section className="bg-white p-6 lg:p-8 rounded-xl shadow-xs border border-gray-200 space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <span className="text-xs uppercase tracking-wider text-[#EA3C36] font-bold">
                  STEP 03
                </span>
                <h2 className="text-xl font-bold text-[#1A1A1A]">
                  Donor Information &amp; 80G Tax Exemption
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Required under IT Act for Form 10BD submission &amp; 50% deduction certificate.
                </p>
              </div>

              <form onSubmit={handleCreateDonationOrder} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#EA3C36] focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Email Address (for 80G PDF) *</label>
                  <input
                    type="email"
                    required
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#EA3C36] focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#EA3C36] focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">PAN Card Number *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={donorPAN}
                    onChange={(e) => setDonorPAN(e.target.value.toUpperCase())}
                    placeholder="ABCPS1234F"
                    className="w-full uppercase font-mono px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#EA3C36] focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Full Residential Address *</label>
                  <input
                    type="text"
                    required
                    value={donorAddress}
                    onChange={(e) => setDonorAddress(e.target.value)}
                    placeholder="Plot / Flat, Street, City, State, PIN Code"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#EA3C36] focus:outline-hidden"
                  />
                </div>

                {/* FCRA Checkbox Safeguard */}
                <div className="sm:col-span-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={simulateForeignCard}
                      onChange={(e) => setSimulateForeignCard(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-[#EA3C36] rounded focus:ring-[#EA3C36]"
                    />
                    <div>
                      <p className="text-xs font-bold text-gray-800">
                        Simulate Foreign Card / Non-Resident Contribution (Test Mode)
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Simulates statutory FCRA non-acceptance rule. Only domestic contributions accepted.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Big Red Continue CTA Button Matching PDF */}
                <div className="sm:col-span-2 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmittingOrder}
                    className="w-full bg-[#EA3C36] hover:bg-[#D32F2F] text-white font-bold py-4 px-6 rounded-lg text-base shadow-md hover-lift transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>
                      {isSubmittingOrder
                        ? 'Initiating Contribution Order...'
                        : `CONTINUE (₹${amount.toLocaleString('en-IN')})`}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* Right Column: Sticky Summary & Tax Benefit Card (4 cols) */}
          <aside className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-28">
            {/* Contribution Summary */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-[#1A1A1A] border-b border-gray-100 pb-3">
                Donation Summary
              </h3>

              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Program:</span>
                  <span className="font-semibold text-gray-900 text-right max-w-[180px] truncate">
                    {selectedCampaign?.title || 'General Donation'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Frequency:</span>
                  <span className="font-semibold text-gray-900">
                    {donationType === 'MONTHLY' ? 'Monthly' : 'One-Time'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-semibold text-gray-900">₹{amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee:</span>
                  <span className="font-bold text-[#EA3C36]">₹0 (0%)</span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-sm">
                  <span className="font-bold text-[#1A1A1A]">Total Amount:</span>
                  <span className="text-xl font-extrabold text-[#EA3C36]">
                    ₹{amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 80G Tax Benefits Card */}
            <div className="bg-[#1A1A1A] text-white p-6 rounded-xl shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-[#2C2D30] pb-3">
                <span className="text-xs uppercase tracking-wider text-[#EA3C36] font-bold">
                  80G Tax Benefit
                </span>
                <span className="text-[10px] bg-[#EA3C36] text-white font-bold px-2 py-0.5 rounded">
                  50% Deduction
                </span>
              </div>

              <div className="space-y-2 text-xs text-gray-300">
                <div className="flex justify-between">
                  <span>Eligible 50% Deduction:</span>
                  <span className="font-bold text-white">₹{taxDeduction.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax Saved:</span>
                  <span className="font-bold text-[#EA3C36]">₹{estimatedTaxSaved.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-[11px] text-gray-400 pt-2 leading-relaxed">
                  Instant signed vector PDF receipt issued immediately upon donation confirmation.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Payment Simulation Modal */}
      {showSimulatorModal && createdDonation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 border border-gray-200 animate-fadeIn text-[#1A1A1A]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EA3C36] animate-pulse"></span>
                <h3 className="font-bold text-base text-[#1A1A1A]">
                  Select Payment Gateway
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSimulatorModal(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Order Reference</p>
                <p className="font-mono text-xs font-bold text-gray-800">{createdDonation.id.slice(0, 16)}...</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Amount</p>
                <p className="text-lg font-bold text-[#EA3C36]">
                  ₹{createdDonation.amount.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'UPI', label: 'UPI / Wallets', icon: 'smartphone' },
                { id: 'CARD', label: 'Card / Visa', icon: 'credit_card' },
                { id: 'NET_BANKING', label: 'Bank Transfer', icon: 'account_balance' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`p-3 rounded-lg border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === m.id
                      ? 'border-[#EA3C36] bg-red-50 text-[#EA3C36]'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            {/* Simulation Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={() => handleExecutePaymentSimulation('SUCCESS')}
                className="w-full bg-[#EA3C36] hover:bg-[#D32F2F] text-white font-bold py-3 px-4 rounded-lg text-sm shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                Simulate Successful Payment (Issue Receipt)
              </button>
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={() => handleExecutePaymentSimulation('FAILED')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 px-4 rounded-lg text-xs transition-all cursor-pointer disabled:opacity-50"
              >
                Simulate Failed Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
