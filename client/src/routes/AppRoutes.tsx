import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { DonorLayout } from '../layouts/DonorLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Public Pages
import { HomePage } from '../pages/public/HomePage';
import { SchemesPage } from '../pages/public/SchemesPage';
import { SchemeDetailPage } from '../pages/public/SchemeDetailPage';
import { EligibilityPage } from '../pages/public/EligibilityPage';
import { CampaignsPage } from '../pages/public/CampaignsPage';

// Donation Flow Pages
import { DonatePage } from '../pages/donations/DonatePage';
import { DonationSuccessPage } from '../pages/donations/DonationSuccessPage';
import { DonationFailedPage } from '../pages/donations/DonationFailedPage';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

// Donor Portal
import { DonorDashboardPage } from '../pages/donor/DonorDashboardPage';

// Admin Portal
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminSchemesPage } from '../pages/admin/AdminSchemesPage';
import { AdminAIReviewsPage } from '../pages/admin/AdminAIReviewsPage';
import { AdminCampaignsPage } from '../pages/admin/AdminCampaignsPage';
import { AdminDonationsPage } from '../pages/admin/AdminDonationsPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';

import { FileQuestion, Home, Search } from 'lucide-react';

const NotFoundPage: React.FC = () => (
  <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-white font-poppins text-[#1A1A1A]">
    <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl p-8 text-center space-y-6 animate-fadeIn">
      <div className="flex justify-center">
        <img
          src="/assets/images/logo.png"
          alt="UdaanHer Logo"
          className="h-12 w-auto object-contain mix-blend-multiply"
        />
      </div>

      <div className="w-16 h-16 rounded-full bg-red-50 text-[#EA3C36] flex items-center justify-center mx-auto shadow-inner">
        <FileQuestion className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-4xl sm:text-5xl font-extrabold text-[#EA3C36] tracking-tight block">404</span>
        <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">Page Not Found</h1>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
          The requested welfare portal or donation page could not be located or has moved.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#EA3C36] hover:bg-[#D32F2F] text-white text-xs sm:text-sm font-bold rounded-lg shadow-md hover-lift transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Return to Home</span>
        </Link>
        <Link
          to="/schemes"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs sm:text-sm font-bold rounded-lg border border-gray-200 transition-all"
        >
          <Search className="w-4 h-4 text-gray-600" />
          <span>Browse Programs</span>
        </Link>
      </div>
    </div>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/schemes" element={<SchemesPage />} />
        <Route path="/schemes/:slug" element={<SchemeDetailPage />} />
        <Route path="/eligibility" element={<EligibilityPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />

        {/* Donation Flow */}
        <Route path="/donate" element={<DonatePage />} />
        <Route path="/donate/:campaignSlug" element={<DonatePage />} />
        <Route path="/donate/success" element={<DonationSuccessPage />} />
        <Route path="/donate/failed" element={<DonationFailedPage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 404 catch-all within public layout */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Donor Protected Routes */}
      <Route element={<DonorLayout />}>
        <Route path="/donor/dashboard" element={<DonorDashboardPage />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/schemes" element={<AdminSchemesPage />} />
        <Route path="/admin/ai-reviews" element={<AdminAIReviewsPage />} />
        <Route path="/admin/campaigns" element={<AdminCampaignsPage />} />
        <Route path="/admin/donations" element={<AdminDonationsPage />} />
        <Route path="/admin/reports" element={<AdminReportsPage />} />
      </Route>
    </Routes>
  );
};

