import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Campaign } from '../../types';

export const AdminCampaignsPage: React.FC = () => {
  const { language } = useLanguage();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const [form, setForm] = useState({
    title: '',
    category: 'Livelihood',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80',
    goalAmount: 500000,
    status: 'ACTIVE',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminCampaigns();
      setCampaigns(data);
    } catch (err) {
      console.error('Failed to load campaigns', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleOpenCreate = () => {
    setEditingCampaign(null);
    setForm({
      title: '',
      category: 'Livelihood',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80',
      goalAmount: 500000,
      status: 'ACTIVE',
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Campaign) => {
    setEditingCampaign(c);
    setForm({
      title: c.title,
      category: c.category,
      description: c.description,
      imageUrl: c.imageUrl || '',
      goalAmount: c.goalAmount,
      status: c.status,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setIsSaving(true);

    try {
      if (editingCampaign) {
        await api.updateAdminCampaign(editingCampaign.id, form);
      } else {
        await api.createAdminCampaign(form);
      }
      setIsModalOpen(false);
      fetchCampaigns();
    } catch (err: any) {
      setModalError(err.message || 'Failed to save campaign');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto w-full animate-fadeIn">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-label-caps text-label-caps uppercase text-secondary font-bold tracking-wider">
            Philanthropic Governance
          </span>
          <h1 className="font-headline-md text-headline-md text-primary font-bold">
            Impact Campaigns &amp; Cause Funds
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Manage public fundraising drives, targets, and direct community allocations.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md font-semibold transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>+ Create Campaign</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-on-surface-variant">Loading campaigns...</div>
      ) : campaigns.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-12 text-center space-y-2 border border-[#E5E7EB]">
          <span className="material-symbols-outlined text-4xl text-outline">volunteer_activism</span>
          <h4 className="font-title-md text-primary font-bold">No Campaigns Found</h4>
          <p className="font-body-sm text-on-surface-variant">Create a new impact initiative to start fundraising.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c) => {
            const percent = Math.min(100, Math.round((c.collectedAmount / c.goalAmount) * 100));
            return (
              <article
                key={c.id}
                className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-[#E5E7EB] flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-surface-container-high">
                    {c.imageUrl ? (
                      <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-outline">
                        <span className="material-symbols-outlined text-4xl">image</span>
                      </div>
                    )}
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur font-label-sm text-xs font-semibold text-primary">
                      {c.category}
                    </span>
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="font-title-md text-title-md font-bold text-primary">{c.title}</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                      {c.description}
                    </p>

                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between font-label-sm text-xs">
                        <span className="font-bold text-primary">
                          ₹{c.collectedAmount.toLocaleString('en-IN')} raised
                        </span>
                        <span className="text-on-surface-variant font-medium">
                          Goal: ₹{c.goalAmount.toLocaleString('en-IN')} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-[#E5E7EB] flex items-center justify-between gap-2 mt-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-label-sm text-xs font-semibold ${
                      c.status === 'ACTIVE'
                        ? 'bg-primary-fixed text-on-primary-fixed'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    {c.status}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(c)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-xs font-semibold transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">edit</span>
                    <span>Edit Drive</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-xl w-full rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 border border-[#E5E7EB] animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
              <h3 className="font-title-md text-title-md text-primary font-bold">
                {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3.5 rounded-xl bg-error-container text-on-error-container text-xs font-semibold">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="font-label-sm text-xs font-semibold text-on-surface">Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low text-sm border border-[#E5E7EB] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-label-sm text-xs font-semibold text-on-surface">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low text-sm border border-[#E5E7EB] focus:outline-hidden"
                  >
                    <option value="Livelihood">Livelihood &amp; Enterprise</option>
                    <option value="Healthcare">Healthcare &amp; Vans</option>
                    <option value="Education">Education &amp; Skilling</option>
                    <option value="Emergency">Emergency Social Relief</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-label-sm text-xs font-semibold text-on-surface">Goal Amount (INR) *</label>
                  <input
                    type="number"
                    required
                    value={form.goalAmount}
                    onChange={(e) => setForm({ ...form, goalAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low text-sm border border-[#E5E7EB] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-label-sm text-xs font-semibold text-on-surface">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low text-sm border border-[#E5E7EB] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-label-sm text-xs font-semibold text-on-surface">Cover Image URL</label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low text-sm border border-[#E5E7EB] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-label-sm text-xs font-semibold text-on-surface">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low text-sm border border-[#E5E7EB] focus:outline-hidden"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="PAUSED">PAUSED</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-label-md text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-sm font-semibold transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingCampaign ? 'Update Campaign' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
