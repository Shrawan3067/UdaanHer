import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { AIReview } from '../../types';

export const AdminAIReviewsPage: React.FC = () => {
  const { language } = useLanguage();

  const [reviews, setReviews] = useState<AIReview[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [isLoading, setIsLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  // In-line editing draft
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editHindiText, setEditHindiText] = useState<string>('');

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
      fetchReviews();
    } catch (err: any) {
      alert('Failed to reject review: ' + err.message);
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto w-full animate-fadeIn">
      {/* Header & Pipeline Status Banner */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-[#E5E7EB] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-caps text-label-caps uppercase font-bold">
              <span className="material-symbols-outlined text-[16px]">psychology_alt</span>
              <span>OpenAI Plain-Hindi Human-in-the-Loop Review Desk</span>
            </div>
            <h1 className="font-headline-md text-headline-md text-primary font-bold">
              Scheme AI Ingestion &amp; Editorial Verification Hub
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Every AI-generated Hindi scheme summary requires human review before being published to beneficiaries.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="inline-flex p-1 bg-surface-container rounded-xl border border-[#E5E7EB]">
            {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg font-label-sm text-xs font-semibold transition-all ${
                  filterStatus === status
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
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
        <div className="p-12 text-center text-on-surface-variant">Loading AI review queue...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-12 text-center space-y-3 border border-[#E5E7EB]">
          <span className="material-symbols-outlined text-4xl text-outline">done_all</span>
          <h3 className="font-title-md text-primary font-bold">Queue Empty</h3>
          <p className="font-body-sm text-on-surface-variant">
            No scheme reviews found for filter: <strong>{filterStatus}</strong>.
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
                className="bg-surface-container-lowest rounded-2xl p-6 lg:p-7 shadow-sm border border-[#E5E7EB] space-y-6"
              >
                {/* Top Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps font-bold">
                      {rev.scheme?.schemeCode || 'SCHEME'}
                    </span>
                    <div>
                      <h3 className="font-title-md text-primary font-bold">{rev.scheme?.name}</h3>
                      <p className="font-body-sm text-xs text-on-surface-variant">
                        Created {new Date(rev.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full font-label-caps text-label-caps font-bold uppercase ${
                        rev.status === 'APPROVED'
                          ? 'bg-primary-fixed text-on-primary-fixed'
                          : rev.status === 'REJECTED'
                          ? 'bg-error-container text-on-error-container'
                          : 'bg-secondary-fixed text-on-secondary-fixed'
                      }`}
                    >
                      {rev.status === 'PENDING' ? 'Requires Sign-Off' : rev.status}
                    </span>
                    <span className="inline-flex items-center gap-1 text-primary bg-primary-fixed/30 px-2 py-0.5 rounded-md font-label-sm text-xs font-semibold">
                      <span className="material-symbols-outlined text-[14px]">auto_awesome</span> 98.4% Confidence
                    </span>
                  </div>
                </div>

                {/* Content Comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  {/* Left: Original Scheme Context */}
                  <div className="space-y-2 p-4 rounded-xl bg-surface-container-low border border-[#E5E7EB]">
                    <span className="font-label-caps text-on-surface-variant uppercase font-semibold">
                      Original Scheme Mandate (Official Source)
                    </span>
                    <p className="font-body-sm text-on-surface leading-relaxed">
                      {rev.scheme?.description}
                    </p>
                    <div className="pt-2 text-xs text-on-surface-variant font-medium">
                      Benefit: <strong className="text-primary">{rev.scheme?.benefit}</strong>
                    </div>
                  </div>

                  {/* Right: AI-Drafted Plain Hindi */}
                  <div className="space-y-3 p-4 rounded-xl bg-surface-container-lowest border-2 border-primary/20 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-label-caps text-secondary font-bold uppercase tracking-wider">
                        Plain-Hindi Draft (Beneficiary-Facing)
                      </span>
                      {!isEditing && rev.status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(rev)}
                          className="font-label-sm text-xs text-primary hover:text-secondary font-semibold flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                          <span>Edit Draft</span>
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          rows={4}
                          value={editHindiText}
                          onChange={(e) => setEditHindiText(e.target.value)}
                          className="w-full p-3 rounded-xl bg-surface text-on-surface font-hindi text-body-md border border-primary focus:outline-hidden"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isActing}
                            onClick={() => handleSaveDraft(rev.id)}
                            className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-xs font-semibold"
                          >
                            Save Updates
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-sm text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="font-body-md text-on-surface leading-relaxed font-hindi">
                        {rev.generatedHindiSummary}
                      </p>
                    )}
                  </div>
                </div>

                {/* Review Action Controls */}
                {rev.status === 'PENDING' && (
                  <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
                    <button
                      type="button"
                      disabled={isActing}
                      onClick={() => handleReject(rev.id)}
                      className="px-4 py-2 rounded-xl bg-error-container text-on-error-container hover:opacity-90 font-label-md text-label-md font-semibold transition-colors disabled:opacity-50"
                    >
                      Reject Draft
                    </button>
                    <button
                      type="button"
                      disabled={isActing}
                      onClick={() => handleApprove(rev.id)}
                      className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold transition-all shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                      <span>Approve &amp; Publish to Public Scheme</span>
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
