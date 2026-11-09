import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { AIReview } from '../../types';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Edit3,
  Save,
  BookOpen,
  Clock,
  AlertCircle,
  FileText,
  Filter,
  Plus,
  X,
  UploadCloud,
} from 'lucide-react';

export const AdminAIReviewsPage: React.FC = () => {
  const { language } = useLanguage();

  const [reviews, setReviews] = useState<AIReview[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [isLoading, setIsLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // In-line editing draft
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editHindiText, setEditHindiText] = useState<string>('');

  // Ingest Notice Modal State
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [availableSchemes, setAvailableSchemes] = useState<any[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState('');
  const [noticeText, setNoticeText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const openIngestModal = async () => {
    setIsIngestModalOpen(true);
    if (availableSchemes.length === 0) {
      try {
        const res = await api.getSchemes({ limit: 100 });
        setAvailableSchemes(res.schemes || []);
      } catch (err) {
        console.error('Failed to load schemes for ingestion modal', err);
      }
    }
  };

  const handleIngestAndDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchemeId) {
      alert('Please select a target government scheme.');
      return;
    }
    setIsGenerating(true);
    try {
      await api.generateAISummary(selectedSchemeId, { officialNoticeText: noticeText });
      setIsIngestModalOpen(false);
      setSelectedSchemeId('');
      setNoticeText('');
      setSuccessToast('AI plain-Hindi summary draft created successfully from official notice!');
      setFilterStatus('PENDING');
      fetchReviews();
    } catch (err: any) {
      alert('Failed to generate summary: ' + (err.message || 'Error occurred'));
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const data = await api.listAIReviews(filterStatus !== 'ALL' ? filterStatus : undefined);
      setReviews(data);
    } catch (err) {
      console.error('Failed to load AI reviews', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filterStatus]);

  const handleStartEdit = (review: AIReview) => {
    setEditingId(review.id);
    setEditHindiText(review.generatedHindiSummary);
  };

  const handleSaveDraft = async (id: string) => {
    setActingId(id);
    try {
      await api.updateAIReviewDraft(id, { generatedHindiSummary: editHindiText });
      setEditingId(null);
      setSuccessToast('Draft updated successfully.');
      fetchReviews();
    } catch (err: any) {
      alert('Failed to save draft: ' + err.message);
    } finally {
      setActingId(null);
    }
  };

  const handleApprove = async (id: string) => {
    setActingId(id);
    try {
      await api.approveAIReview(id);
      setSuccessToast('Summary approved and published to public portal!');
      fetchReviews();
    } catch (err: any) {
      alert('Failed to approve review: ' + err.message);
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Reject this AI generated draft?')) return;
    setActingId(id);
    try {
      await api.rejectAIReview(id);
      setSuccessToast('AI review draft rejected.');
      fetchReviews();
    } catch (err: any) {
      alert('Failed to reject review: ' + err.message);
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto w-full animate-fadeIn font-poppins text-[#1A1A1A]">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 flex items-center justify-between border border-emerald-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-sm p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & Pipeline Status Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-2xs border border-gray-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Human-In-The-Loop Editorial Desk</span>
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-gray-500 font-semibold">gpt-4o-mini</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
            Scheme AI Ingestion &amp; Editorial Verification Hub
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mt-0.5">
            Every AI-generated Hindi scheme summary requires human editorial review before being published to beneficiaries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={openIngestModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EA3C36] hover:bg-[#D32F2F] text-white text-xs font-bold transition-all shadow-xs cursor-pointer hover:-translate-y-0.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ingest Notice &amp; Draft AI</span>
          </button>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200">
            {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === status
                    ? 'bg-[#EA3C36] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-gray-500 font-semibold">
          Loading AI review queue...
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center space-y-3 border border-gray-200/90 shadow-2xs">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">Queue Clean &amp; Clear</h3>
          <p className="text-xs text-gray-500">
            No scheme reviews found matching status: <strong className="text-gray-800">{filterStatus}</strong>.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reviews.map((rev) => {
            const isEditing = editingId === rev.id;
            const isActing = actingId === rev.id;

            return (
              <article
                key={rev.id}
                className="bg-white rounded-2xl p-6 lg:p-7 shadow-2xs border border-gray-200/90 space-y-5 hover:shadow-md transition-shadow"
              >
                {/* Top Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-red-50 text-[#EA3C36] font-mono text-xs font-extrabold border border-red-200/60">
                      {rev.scheme?.schemeCode || 'SCH-CODE'}
                    </span>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-gray-900">
                        {rev.scheme?.name || 'Welfare Scheme Title'}
                      </h3>
                      {rev.scheme?.nameHi && (
                        <p className="text-xs text-gray-500 font-hindi font-medium">{rev.scheme.nameHi}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        rev.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : rev.status === 'REJECTED'
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {rev.status}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Side-by-Side: Official Scheme Description vs AI Plain-Hindi Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Left: Official Gazette Summary */}
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <FileText className="w-3.5 h-3.5 text-gray-500" />
                      <span>Official Scheme Specification (English)</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {rev.scheme?.description || 'No official description registered.'}
                    </p>
                    <div className="pt-2 border-t border-gray-200/80 text-xs">
                      <span className="font-bold text-gray-700">Benefit: </span>
                      <span className="text-[#EA3C36] font-bold">{rev.scheme?.benefit || '—'}</span>
                    </div>
                  </div>

                  {/* Right: AI-Generated Plain-Hindi Draft */}
                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>AI Plain-Hindi Draft (Beneficiary View)</span>
                      </div>
                      {!isEditing && rev.status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(rev)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#EA3C36] hover:underline cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit Text</span>
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          rows={5}
                          value={editHindiText}
                          onChange={(e) => setEditHindiText(e.target.value)}
                          className="w-full p-3 rounded-lg bg-white border border-amber-300 text-xs sm:text-sm font-hindi focus:outline-hidden focus:ring-1 focus:ring-[#EA3C36] leading-relaxed"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={isActing}
                            onClick={() => handleSaveDraft(rev.id)}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-2xs"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Draft</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-gray-800 font-hindi leading-relaxed bg-white/70 p-3 rounded-lg border border-amber-100">
                        {rev.generatedHindiSummary}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons for Pending Reviews */}
                {rev.status === 'PENDING' && (
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      disabled={isActing}
                      onClick={() => handleReject(rev.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 text-xs font-bold transition-colors cursor-pointer border border-gray-200 hover:border-red-200 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Draft</span>
                    </button>

                    <button
                      type="button"
                      disabled={isActing}
                      onClick={() => handleApprove(rev.id)}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isActing ? 'Publishing...' : 'Approve & Publish to Public'}</span>
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Ingest Official Notice Modal */}
      {isIngestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-2xl border border-gray-200 shadow-2xl overflow-hidden animate-scaleIn">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#EA3C36] flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Ingest Official Notice &amp; Draft Plain-Hindi Summary
                  </h3>
                  <p className="text-xs text-gray-500">
                    Al synthesizes plain Hindi drafts strictly from official notices. Editorial approval required.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsIngestModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIngestAndDraft} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Target Government Scheme *
                </label>
                <select
                  required
                  value={selectedSchemeId}
                  onChange={(e) => setSelectedSchemeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-1 focus:ring-[#EA3C36]"
                >
                  <option value="">-- Select Target Scheme --</option>
                  {availableSchemes.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.schemeCode}] {s.name} ({s.nameHi || s.need})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Official Notice / MP Gazette Notification Text
                  </label>
                  <span className="text-[11px] text-gray-400 font-medium">Optional (Will use scheme record if blank)</span>
                </div>
                <textarea
                  rows={6}
                  value={noticeText}
                  onChange={(e) => setNoticeText(e.target.value)}
                  placeholder="Paste official notification text, eligibility paragraphs, or gazette notice extract here..."
                  className="w-full p-3.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-mono focus:outline-hidden focus:ring-1 focus:ring-[#EA3C36] leading-relaxed"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Strict Editorial Guardrail:</strong> Output will be queued as <strong>PENDING</strong> draft. It will not be published to rural beneficiaries until an editor approves it.
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsIngestModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || !selectedSchemeId}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EA3C36] hover:bg-[#D32F2F] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGenerating ? 'Generating AI Draft...' : 'Draft Plain-Hindi Summary'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
