import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Campaign } from '../../types';
import {
  HeartHandshake,
  Plus,
  Edit3,
  ExternalLink,
  Target,
  Users,
  Coins,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
} from 'lucide-react';

export const AdminCampaignsPage: React.FC = () => {
  const { language } = useLanguage();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

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
        setSuccessToast(`Campaign "${form.title}" updated successfully.`);
      } else {
        await api.createAdminCampaign(form);
        setSuccessToast(`Campaign "${form.title}" launched successfully.`);
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

      {/* Header */}
      <div className="p-6 rounded-2xl bg-white shadow-2xs border border-gray-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold text-[#EA3C36] tracking-wider">
              Philanthropic Governance
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-gray-500 font-semibold">100% Tax Deductible 80G</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
            Impact Campaigns &amp; Cause Funds
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mt-0.5">
            Manage public fundraising drives, targets, and direct community allocations across Madhya Pradesh.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EA3C36] hover:bg-[#D32F2F] text-white text-xs sm:text-sm font-bold shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Campaign</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-gray-500 font-semibold">
          Loading campaigns...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center space-y-3 border border-gray-200/90 shadow-2xs">
          <HeartHandshake className="w-10 h-10 text-gray-400 mx-auto" />
          <h4 className="text-base font-bold text-gray-900">No Campaigns Found</h4>
          <p className="text-xs text-gray-500">Create a new impact initiative to start fundraising.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c) => {
            const percent = Math.min(100, Math.round((c.collectedAmount / c.goalAmount) * 100));
            return (
              <article
                key={c.id}
                className="bg-white rounded-2xl overflow-hidden shadow-2xs border border-gray-200/90 flex flex-col justify-between hover:shadow-md transition-shadow group"
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-gray-100">
                    {c.imageUrl ? (
                      <img
                        src={c.imageUrl}
                        alt={c.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Layers className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[#EA3C36] text-[10px] font-extrabold uppercase shadow-xs">
                        {c.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                          c.status === 'ACTIVE'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-800 text-white'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-bold text-gray-900 line-clamp-1 group-hover:text-[#EA3C36] transition-colors">
                      {c.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>

                    {/* Funding Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[#EA3C36] font-extrabold">
                          ₹{c.collectedAmount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-gray-500">
                          Target: ₹{c.goalAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-[#EA3C36] rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold pt-0.5">
                        <span>{percent}% mobilized</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{c.donorCount || (c as any)._count?.donations || 0} donors</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between">
                  <Link
                    to={`/donate/${c.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#EA3C36] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Public View</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(c)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-red-50 text-xs font-bold text-[#EA3C36] border border-gray-200 hover:border-red-200 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Campaign</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5 border border-gray-200 max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingCampaign ? 'Edit Impact Campaign' : 'Create New Campaign'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3.5 rounded-xl bg-red-50 text-red-800 text-xs font-semibold border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Rural Widows Livelihood & Skills Fund"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 text-xs sm:text-sm border border-gray-200 focus:outline-hidden focus:bg-white focus:border-[#EA3C36]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 text-xs sm:text-sm border border-gray-200 focus:outline-hidden focus:bg-white focus:border-[#EA3C36]"
                  >
                    <option value="Livelihood">Livelihood &amp; Skills</option>
                    <option value="Healthcare">Healthcare &amp; Nutrition</option>
                    <option value="Education">Girl Child Education</option>
                    <option value="Emergency Relief">Emergency Relief</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Goal Amount (INR ₹) *</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={form.goalAmount}
                    onChange={(e) => setForm({ ...form, goalAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 text-xs sm:text-sm border border-gray-200 focus:outline-hidden focus:bg-white focus:border-[#EA3C36]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 text-xs sm:text-sm border border-gray-200 focus:outline-hidden focus:bg-white focus:border-[#EA3C36]"
                >
                  <option value="ACTIVE">ACTIVE (Fundraising Live)</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="PAUSED">PAUSED</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detailed breakdown of impact, grassroots operations, and direct benefits."
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 text-xs sm:text-sm border border-gray-200 focus:outline-hidden focus:bg-white focus:border-[#EA3C36]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Cover Image URL</label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 text-xs sm:text-sm border border-gray-200 focus:outline-hidden focus:bg-white focus:border-[#EA3C36]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs sm:text-sm font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#EA3C36] hover:bg-[#D32F2F] text-white text-xs sm:text-sm font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSaving ? 'Saving...' : editingCampaign ? 'Update Campaign' : 'Launch Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
