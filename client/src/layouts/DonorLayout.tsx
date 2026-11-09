import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';

export const DonorLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <span className="material-symbols-outlined text-4xl text-[#EA3C36] animate-spin">refresh</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1A1A1A]">
      <Navbar />
      <main className="flex-1 pt-16 md:pt-[106px]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
