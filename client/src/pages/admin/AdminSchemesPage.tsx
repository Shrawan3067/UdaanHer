import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Scheme } from '../../types';
import {
  Search,
  Plus,
  Edit3,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  X,
  AlertCircle,
  BookOpen,
  Filter,
} from 'lucide-react';

export const AdminSchemesPage: React.FC = () => {
  const { language } = useLanguage();

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
      setSuccessToast('AI Plain-Hindi summary generated! Review it in the AI Review Desk.');
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

      {/* Header Bar */}
      <div className="p-6 rounded-2xl bg-white shadow-2xs border border-gray-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold text-[#EA3C36] tracking-wider">
              Content Management
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-gray-500 font-semibold">9 MP Districts Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
            Welfare Schemes Directory Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mt-0.5">
            Create, edit, archive government schemes and trigger OpenAI plain-Hindi summary generation for rural beneficiaries.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EA3C36] hover:bg-[#D32F2F] text-white text-xs sm:text-sm font-bold shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Scheme</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-2xs border border-gray-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code, scheme title, or Hindi name..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-xs sm:text-sm text-gray-900 border border-gray-200 focus:outline-hidden focus:bg-white focus:border-[#EA3C36] transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-start sm:justify-end">
          {(['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#EA3C36] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Table */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-gray-500">Loading scheme registry...</div>
        ) : filteredSchemes.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <BookOpen className="w-8 h-8 text-gray-400 mx-auto" />
            <h4 className="text-base font-bold text-gray-800">No schemes match filter</h4>
            <p className="text-xs text-gray-500">Try adjusting your search query or status criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-[11px] uppercase tracking-wider border-b border-gray-200/80">
                  <th className="py-3 px-6 font-bold">Code &amp; Title</th>
                  <th className="py-3 px-6 font-bold">Category</th>
                  <th className="py-3 px-6 font-bold">Benefit Entitlement</th>
                  <th className="py-3 px-6 font-bold">AI Summary</th>
                  <th className="py-3 px-6 font-bold">Status</th>
                  <th className="py-3 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSchemes.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#EA3C36] bg-red-50 border border-red-200/60 px-2 py-0.5 rounded">
                          {s.schemeCode}
                        </span>
                        <Link
                          to={`/schemes/${s.slug}`}
                          target="_blank"
                          className="text-xs sm:text-sm font-bold text-gray-900 hover:text-[#EA3C36] transition-colors"
                        >
                          {s.name}
                        </Link>
                      </div>
                      {s.nameHi && (
                        <p className="font-hindi text-xs text-gray-500 font-medium mt-0.5">{s.nameHi}</p>
                      )}
                    </td>

                    <td className="py-4 px-6 text-xs text-gray-600 font-semibold">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700">
                        {s.category}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <p className="text-xs font-bold text-[#EA3C36]">{s.benefit}</p>
                    </td>

                    <td className="py-4 px-6">
                      <button
                        type="button"
                        disabled={generatingAiId === s.id}
                        onClick={() => handleGenerateAiSummary(s.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>{generatingAiId === s.id ? 'Drafting...' : 'Generate AI Hindi'}</span>
                      </button>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          s.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : s.status === 'DRAFT'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(s)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-[#EA3C36] transition-colors cursor-pointer"
                          title="Edit Scheme"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/schemes/${s.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                          title="View Public Page"
                        >
                          <ExternalLink className="w-4 h-4" />
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 border border-gray-200 max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingScheme ? `Edit Scheme: ${editingScheme.schemeCode}` : 'Create New Welfare Scheme'}
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

            <form onSubmit={handleSaveScheme} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Scheme Code *</label>
                  <input
                    type="text"
                    required
                    value={modalForm.schemeCode}
                    onChange={(e) => setModalForm({ ...modalForm, schemeCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 font-mono text-xs sm:text-sm border border-gray-200 focus:outline-hidden focus:bg-white focus:border-[#EA3C36]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Status</label>
                  <select
                    value={modalForm.status}
                    onChange={(e) => setModalForm({ ...modalForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 text-xs sm:text-sm border border-gray-200 focus:outline-hidden focus:bg-white focus:border-[#EA3C36]"
                  >
                    <option value="PUBLISHED">PUBLISHED (Live)</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Scheme Name (English) *</label>
                <input
                  type="text"
                  required
                  value={modalForm.name}
                  onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                  placeholder="e.g. State Kalyani Pension Scheme"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 text-xs sm:text-sm border border-gray-200 focus:outline-hidden focus:bg-white focus:border-[#EA3C36]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">योजना का नाम (हिंदी)</label>
                <input
                  type="text"
                  value={modalForm.nameHi}
                  onChange={(e) => setModalForm({ ...modalForm, nameHi: e.target.value })}
                  placeholder="उदा. मध्यप्रदेश कल्याणी सहायता योजना"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 text-xs sm:text-sm font-hindi border border-gray-200 focus:outline-hidden focus:bg-white focus:border-[#EA3C36]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Category</label>
                  <input
                    type="text"
                    value={modalForm.category}
                    onChange={(e) => setModalForm({ ...modalForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 text-xs sm:text-sm border border-gray-200 focus:outline-hidden focus:bg-white focus:border-[#EA3C36]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Need Type</label>
                  <input
                    type="text"
                    value={modalForm.need}
                    onChange={(e) => setModalForm({ ...modalForm, need: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 text-xs sm:text-sm border border-gray-200 focus:outline-hidden focus:bg-white focus:border-[#EA3C36]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Benefit Entitlement *</label>
                <input
                  type="text"
                  required
                  value={modalForm.benefit}
                  onChange={(e) => setModalForm({ ...modalForm, benefit: e.target.value })}
                  placeholder="e.g. ₹600 / month direct transfer"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 text-xs sm:text-sm border border-gray-200 focus:outline-hidden focus:bg-white focus:border-[#EA3C36]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Description (English) *</label>
                <textarea
                  rows={3}
                  required
                  value={modalForm.description}
                  onChange={(e) => setModalForm({ ...modalForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 text-xs sm:text-sm border border-gray-200 focus:outline-hidden focus:bg-white focus:border-[#EA3C36]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Official Source URL</label>
                <input
                  type="url"
                  value={modalForm.officialSourceUrl}
                  onChange={(e) => setModalForm({ ...modalForm, officialSourceUrl: e.target.value })}
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
