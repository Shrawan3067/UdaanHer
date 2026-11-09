import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Campaign } from '../../types';
import { Heart, ArrowRight } from 'lucide-react';

export const CampaignsPage: React.FC = () => {
  const { language } = useLanguage();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await api.getPublicCampaigns();
        setCampaigns(data);
      } catch (err) {
        console.error('Failed to load campaigns', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-10 animate-fadeIn text-[#1A1A1A]">
      {/* Page Header */}
      <div className="space-y-3">
        <span className="text-xs uppercase tracking-wider text-[#EA3C36] font-bold">
          PHILANTHROPIC INITIATIVES
        </span>
        <h1 className="text-3xl lg:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
          Active Humanitarian Campaigns
        </h1>
        <p className="text-sm text-gray-600 max-w-3xl leading-relaxed">
          Every contribution routed through UdaanHer undergoes real-time expenditure verification. 92% of funds enter directly into verified field relief, first aid supplies, and livelihood toolkits.
        </p>
      </div>

      {isLoading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-[#EA3C36] animate-spin">refresh</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {campaigns.map((camp) => {
            const percent = Math.min(100, Math.round((camp.collectedAmount / camp.goalAmount) * 100));
            return (
              <div
                key={camp.id}
                className="bg-white rounded-xl overflow-hidden shadow-xs border border-gray-200 flex flex-col justify-between hover-lift"
              >
                <div>
                  <div className="relative h-52 w-full overflow-hidden bg-gray-100 group">
                    {camp.imageUrl ? (
                      <img src={camp.imageUrl} alt={camp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="material-symbols-outlined text-4xl">image</span>
                      </div>
                    )}
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/95 text-xs font-bold text-[#EA3C36] shadow-xs">
                      {camp.category}
                    </span>
                  </div>

                  <div className="p-6 space-y-4">
                    <h3 className="text-base font-bold text-[#1A1A1A] leading-snug">
                      {camp.title}
                    </h3>

                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                      {camp.description}
                    </p>

                    {/* Progress bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-[#EA3C36]">
                          ₹{camp.collectedAmount.toLocaleString('en-IN')} raised
                        </span>
                        <span className="text-gray-500 font-medium">
                          Goal: ₹{camp.goalAmount.toLocaleString('en-IN')} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#EA3C36] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-gray-100 mt-4">
                  <Link
                    to={`/donate?campaign=${camp.slug || camp.id}`}
                    className="inline-flex items-center justify-center w-full py-2.5 rounded-lg bg-[#EA3C36] hover:bg-[#D32F2F] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Donate to this Cause
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
