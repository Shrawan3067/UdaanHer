import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';

export const PublicLayout: React.FC = () => {
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
