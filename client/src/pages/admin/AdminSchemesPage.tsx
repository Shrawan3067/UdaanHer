import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Scheme } from '../../types';

export const AdminSchemesPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingAiId, setGeneratingAiId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Search & Status filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'>('ALL');

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);
  const [modalForm, setModalForm] = useState({
    schemeCode: '',
    name: '',
    nameHi: '',
    category: 'Social Security',
    need: 'Pension',
    description: '',
    descriptionHi: '',
    benefit: '',
    benefitHi: '',
    officialSourceUrl: 'https://socialjustice.mp.gov.in',
    status: 'PUBLISHED',
  });
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSchemes = async () => {
    setIsLoading(true);
    try {
      const res = await api.getSchemes({ limit: 50 });
      setSchemes(res.schemes);
    } catch (err) {
      console.error('Failed to load schemes for admin', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingScheme(null);
    setModalForm({
      schemeCode: `SCH-0${Math.floor(70 + Math.random() * 29)}`,
      name: '',
      nameHi: '',
      category: 'Social Security',
      need: 'Livelihood',
      description: '',
      descriptionHi: '',
      benefit: '',
      benefitHi: '',
      officialSourceUrl: 'https://mp.gov.in',
      status: 'PUBLISHED',
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (scheme: Scheme) => {
    setEditingScheme(scheme);
    setModalForm({
      schemeCode: scheme.schemeCode,
      name: scheme.name,
      nameHi: scheme.nameHi || '',
      category: scheme.category,
      need: scheme.need,
      description: scheme.description,
      descriptionHi: scheme.descriptionHi || '',
      benefit: scheme.benefit,
      benefitHi: scheme.benefitHi || '',
      officialSourceUrl: scheme.officialSourceUrl || '',
      status: scheme.status,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSaveScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setIsSaving(true);

    try {
      if (editingScheme) {
        await api.updateAdminScheme(editingScheme.id, modalForm);
        setSuccessToast(`Scheme ${modalForm.schemeCode} updated successfully.`);
      } else {
        await api.createAdminScheme(modalForm);
        setSuccessToast(`Scheme ${modalForm.schemeCode} published successfully.`);
      }
      setIsModalOpen(false);
      fetchSchemes();
    } catch (err: any) {
      setModalError(err.message || 'Failed to save scheme.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateAiSummary = async (schemeId: string) => {
    setGeneratingAiId(schemeId);
    try {
      await api.generateAISummary(schemeId);
      setSuccessToast('AI Plain-Hindi summary generated! Review in AI Review Desk.');
      fetchSchemes();
    } catch (err: any) {
      alert('Failed to generate AI summary: ' + err.message);
    } finally {
      setGeneratingAiId(null);
    }
  };

  const filteredSchemes = schemes.filter((s) => {
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.schemeCode.toLowerCase().includes(q) ||
        (s.nameHi && s.nameHi.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto w-full animate-fadeIn">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-between border border-primary/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span className="font-label-md font-semibold">{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="font-bold text-sm">
            ✕
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-label-caps text-label-caps uppercase text-secondary font-bold tracking-wider">
            Content Management
          </span>
          <h1 className="font-headline-md text-headline-md text-primary font-bold">
            Welfare Schemes Directory Management
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Create, edit, archive government schemes and trigger OpenAI plain-Hindi summary generation.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md font-semibold transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>+ Create New Scheme</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:w-auto">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code, scheme title, or Hindi name..."
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low rounded-xl font-body-sm text-body-sm text-on-surface border border-[#E5E7EB] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {(['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-label-sm text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-on-surface-variant">Loading scheme registry...</div>
        ) : filteredSchemes.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <span className="material-symbols-outlined text-4xl text-outline">search_off</span>
            <h4 className="font-title-md text-primary font-bold">No schemes match filter</h4>
            <p className="font-body-sm text-on-surface-variant">Try adjusting search or status criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider border-b border-[#E5E7EB]">
                  <th className="py-3 px-6 font-semibold">Code &amp; Title</th>
                  <th className="py-3 px-6 font-semibold">Category</th>
                  <th className="py-3 px-6 font-semibold">Benefit Entitlement</th>
                  <th className="py-3 px-6 font-semibold">AI Summary</th>
                  <th className="py-3 px-6 font-semibold">Status</th>
                  <th className="py-3 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredSchemes.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary bg-primary-container/20 px-2 py-0.5 rounded">
                          {s.schemeCode}
                        </span>
                        <Link
                          to={`/schemes/${s.slug}`}
                          target="_blank"
                          className="font-title-md text-sm font-bold text-on-surface hover:text-primary transition-colors"
                        >
                          {s.name}
                        </Link>
                      </div>
                      {s.nameHi && (
                        <p className="font-hindi text-xs text-secondary font-medium mt-0.5">{s.nameHi}</p>
                      )}
                    </td>

                    <td className="py-4 px-6 font-label-sm text-xs text-on-surface-variant font-medium">
                      {s.category}
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-label-sm text-xs text-primary font-bold">{s.benefit}</p>
                    </td>

                    <td className="py-4 px-6">
                      <button
                        type="button"
                        disabled={generatingAiId === s.id}
                        onClick={() => handleGenerateAiSummary(s.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[15px] text-secondary">
                          psychology_alt
                        </span>
                        <span>{generatingAiId === s.id ? 'Drafting...' : 'Generate AI Hindi'}</span>
                      </button>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-label-sm text-xs font-semibold ${
                          s.status === 'PUBLISHED'
                            ? 'bg-primary-fixed text-on-primary-fixed'
                            : s.status === 'DRAFT'
                            ? 'bg-surface-container-high text-on-surface-variant'
                            : 'bg-error-container text-on-error-container'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(s)}
                          className="p-1.5 rounded-lg hover:bg-surface-container text-primary transition-colors"
                          title="Edit Scheme"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <Link
                          to={`/schemes/${s.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors"
                          title="View Public Page"
                        >
                          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT SCHEME MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-2xl w-full rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 border border-[#E5E7EB] max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
              <h3 className="font-title-md text-title-md text-primary font-bold">
                {editingScheme ? `Edit Scheme: ${editingScheme.schemeCode}` : 'Create New Welfare Scheme'}
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

            <form onSubmit={handleSaveScheme} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-label-sm text-xs font-semibold text-on-surface">Scheme Code *</label>
                  <input
                    type="text"
                    required
                    value={modalForm.schemeCode}
                    onChange={(e) => setModalForm({ ...modalForm, schemeCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low font-mono text-sm border border-[#E5E7EB] focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-sm text-xs font-semibold text-on-surface">Status</label>
                  <select
                    value={modalForm.status}
                    onChange={(e) => setModalForm({ ...modalForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low text-sm border border-[#E5E7EB] focus:outline-hidden"
                  >
                    <option value="PUBLISHED">PUBLISHED (Live)</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-label-sm text-xs font-semibold text-on-surface">Scheme Name (English) *</label>
                <input
                  type="text"
                  required
                  value={modalForm.name}
                  onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                  placeholder="e.g. State Kalyani Pension Scheme"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low text-sm border border-[#E5E7EB] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-label-sm text-xs font-semibold text-on-surface">योजना का नाम (हिंदी)</label>
                <input
                  type="text"
                  value={modalForm.nameHi}
                  onChange={(e) => setModalForm({ ...modalForm, nameHi: e.target.value })}
                  placeholder="उदा. मध्यप्रदेश कल्याणी सहायता योजना"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low text-sm font-hindi border border-[#E5E7EB] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-label-sm text-xs font-semibold text-on-surface">Category</label>
                  <input
                    type="text"
                    value={modalForm.category}
                    onChange={(e) => setModalForm({ ...modalForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low text-sm border border-[#E5E7EB] focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-sm text-xs font-semibold text-on-surface">Need Type</label>
                  <input
                    type="text"
                    value={modalForm.need}
                    onChange={(e) => setModalForm({ ...modalForm, need: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low text-sm border border-[#E5E7EB] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-label-sm text-xs font-semibold text-on-surface">Benefit Entitlement *</label>
                <input
                  type="text"
                  required
                  value={modalForm.benefit}
                  onChange={(e) => setModalForm({ ...modalForm, benefit: e.target.value })}
                  placeholder="e.g. ₹600 / month direct transfer"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low text-sm border border-[#E5E7EB] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-label-sm text-xs font-semibold text-on-surface">Description (English) *</label>
                <textarea
                  rows={3}
                  required
                  value={modalForm.description}
                  onChange={(e) => setModalForm({ ...modalForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low text-sm border border-[#E5E7EB] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-label-sm text-xs font-semibold text-on-surface">Official Source URL</label>
                <input
                  type="url"
                  value={modalForm.officialSourceUrl}
                  onChange={(e) => setModalForm({ ...modalForm, officialSourceUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low text-sm border border-[#E5E7EB] focus:outline-hidden"
                />
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
                  {isSaving ? 'Saving...' : editingScheme ? 'Update Scheme' : 'Publish Scheme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
