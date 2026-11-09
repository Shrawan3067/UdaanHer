import React from 'react';

export const SchemeCardSkeleton: React.FC = () => (
  <div className="glass-card rounded-2xl border border-[#E5E7EB] p-6 shadow-xs animate-pulse space-y-4">
    <div className="flex justify-between items-start">
      <div className="h-4 bg-surface-container-high rounded-full w-20"></div>
      <div className="h-5 bg-surface-container-high rounded-full w-24"></div>
    </div>
    <div className="h-6 bg-surface-container-high rounded-md w-3/4"></div>
    <div className="space-y-2">
      <div className="h-3 bg-surface-container-high rounded-sm w-full"></div>
      <div className="h-3 bg-surface-container-high rounded-sm w-5/6"></div>
    </div>
    <div className="p-3.5 bg-surface-container-low rounded-xl space-y-1 border border-[#E5E7EB]">
      <div className="h-3 bg-surface-container-high rounded-sm w-1/3"></div>
      <div className="h-5 bg-surface-container-high rounded-sm w-2/3"></div>
    </div>
    <div className="flex justify-between items-center pt-2">
      <div className="h-3 bg-surface-container-high rounded-sm w-24"></div>
      <div className="h-9 bg-surface-container-high rounded-xl w-28"></div>
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="glass-card rounded-2xl border border-[#E5E7EB] p-5 shadow-xs animate-pulse space-y-3">
    <div className="h-8 bg-surface-container-high rounded-xl w-full mb-4"></div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 py-2.5 border-b border-[#E5E7EB]">
        <div className="h-4 bg-surface-container-high rounded-sm w-1/6"></div>
        <div className="h-4 bg-surface-container-high rounded-sm w-1/4"></div>
        <div className="h-4 bg-surface-container-high rounded-sm w-1/6"></div>
        <div className="h-4 bg-surface-container-high rounded-sm w-1/6"></div>
        <div className="h-4 bg-surface-container-high rounded-sm w-1/6"></div>
      </div>
    ))}
  </div>
);

