import React, { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  HeartHandshake,
  Receipt,
  FileSpreadsheet,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  User,
  Activity,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, isLoading, logout } = useAuth();
  const { language } = useLanguage();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] font-poppins">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-gray-200 border-t-[#EA3C36] rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Loading Operations Portal...
          </span>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const menuItems = [
    {
      href: '/admin',
      label: language === 'HI' ? 'डैशबोर्ड अवलोकन' : 'Overview Dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: '/admin/schemes',
      label: language === 'HI' ? 'योजनाएं CMS' : 'Schemes Directory',
      icon: BookOpen,
    },
    {
      href: '/admin/ai-reviews',
      label: language === 'HI' ? 'AI सारांश समीक्षा' : 'AI Summary Review',
      icon: Sparkles,
      badge: 'Review Desk',
    },
    {
      href: '/admin/campaigns',
      label: language === 'HI' ? 'अभियान व फंड' : 'Campaigns & Funds',
      icon: HeartHandshake,
    },
    {
      href: '/admin/donations',
      label: language === 'HI' ? 'दान और 80G' : 'Donations & 80G Filings',
      icon: Receipt,
    },
    {
      href: '/admin/reports',
      label: language === 'HI' ? 'Form 10BD और ऑडिट' : 'Audit & Form 10BD',
      icon: FileSpreadsheet,
    },
  ];

  const isActive = (item: (typeof menuItems)[0]) => {
    if (item.exact) return location.pathname === item.href;
    return location.pathname.startsWith(item.href);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-poppins">
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-white z-50 flex-col justify-between border-r border-gray-200/90 shadow-xs">
        <div className="flex flex-col">
          {/* Brand & Emblem */}
          <div className="h-18 px-6 flex items-center justify-between border-b border-gray-100">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/assets/images/logo.png"
                alt="UdaanHer Logo"
                className="h-10 w-auto object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base text-[#1A1A1A] tracking-tight group-hover:text-[#EA3C36] transition-colors">
                    UdaanHer
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-red-100 text-[#EA3C36]">
                    Admin
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  Executive Console
                </span>
              </div>
            </Link>
          </div>

          {/* Sync & Environment Strip */}
          <div className="px-4 py-3">
            <div className="px-3.5 py-2 rounded-xl bg-gray-50 flex items-center justify-between border border-gray-200/70">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-gray-600 font-semibold">NIC Portal Synced</span>
              </div>
              <span className="text-[10px] text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full font-bold">
                Live Active
              </span>
            </div>
          </div>

          {/* Section Divider */}
          <div className="px-6 pt-2 pb-1.5">
            <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">
              Operations &amp; Compliance
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 flex flex-col gap-1">
            {menuItems.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                    active
                      ? 'bg-red-50 text-[#EA3C36] font-bold border border-red-200/70 shadow-2xs'
                      : 'text-gray-700 hover:bg-gray-100/80 hover:text-[#EA3C36]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#EA3C36]' : 'text-gray-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] uppercase font-bold shadow-2xs">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Public Portal Shortcut */}
          <div className="px-3 pt-4">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-[#EA3C36] hover:bg-gray-50 border border-dashed border-gray-200 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                <span>View Public Site</span>
              </span>
              <span className="text-[10px] text-gray-400">Open ↗</span>
            </Link>
          </div>
        </div>

        {/* Bottom User Card & Sign Out */}
        <div className="p-4 border-t border-gray-100 space-y-3 bg-gray-50/60">
          <div className="p-3 rounded-xl bg-white flex items-center gap-3 border border-gray-200/80 shadow-2xs">
            <div className="w-9 h-9 rounded-full bg-red-100 text-[#EA3C36] flex items-center justify-center font-bold text-xs shrink-0 border border-red-200">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-gray-900 truncate">{user.fullName || 'Administrator'}</span>
              <span className="text-[10px] text-gray-500 font-medium truncate">{user.email}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-gray-600 hover:text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer border border-transparent hover:border-red-200"
          >
            <LogOut className="w-4 h-4 text-gray-500 group-hover:text-red-600" />
            <span>Sign Out from Admin</span>
          </button>
        </div>
      </aside>

      {/* 2. TOP HEADER BAR */}
      <div className="lg:pl-72">
        <header className="sticky top-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-gray-200 z-40 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer shrink-0"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-[#EA3C36] text-[11px] font-bold border border-red-200/60 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Statutory 80G Certified</span>
              </span>
              <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <span>•</span>
                <span>CBDT Form 10BD Active</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <LanguageSwitcher />

            <div className="h-5 w-[1px] bg-gray-200"></div>

            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-gray-900 leading-tight">
                  {user.fullName || 'Admin Director'}
                </span>
                <span className="text-[10px] text-gray-500 font-medium">Mission Operations</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#EA3C36] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* 3. MAIN CONTENT VIEW */}
        <main className="w-full p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>

      {/* 4. MOBILE SIDEBAR DRAWER */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>
          <div className="relative w-72 bg-white h-full shadow-2xl flex flex-col justify-between p-4 z-10 border-r border-gray-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <img
                    src="/assets/images/logo.png"
                    alt="UdaanHer"
                    className="h-8 w-auto object-contain mix-blend-multiply"
                  />
                  <div className="flex flex-col">
                    <span className="font-extrabold text-sm text-[#1A1A1A]">UdaanHer Admin</span>
                    <span className="text-[10px] text-[#EA3C36] font-bold">Executive Console</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="pt-4 flex flex-col gap-1">
                {menuItems.map((item) => {
                  const active = isActive(item);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        active
                          ? 'bg-red-50 text-[#EA3C36] font-bold border border-red-200/60'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${active ? 'text-[#EA3C36]' : 'text-gray-500'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[9px] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2">
              <div className="px-2 text-xs text-gray-500">
                Signed in as <strong className="text-gray-800">{user.email}</strong>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileSidebarOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold transition-colors cursor-pointer border border-red-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
