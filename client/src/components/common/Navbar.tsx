import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import {
  Menu,
  X,
  User as UserIcon,
  ShieldCheck,
  LogOut,
  Phone,
  Heart,
  ChevronRight,
  HelpCircle,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const { language } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Close mobile drawer on route change or Escape key
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Subtle shadow transition on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: language === "HI" ? "होम" : "Home" },
    {
      href: "/schemes",
      label: language === "HI" ? "कार्यक्रम और सेवाएं" : "Programs & Services",
    },
    {
      href: "/eligibility",
      label: language === "HI" ? "पात्रता खोजें" : "Find My Scheme",
    },
    {
      href: "/campaigns",
      label: language === "HI" ? "अभियान व प्रभाव" : "Our Impact",
    },
    {
      href: "/donate",
      label: language === "HI" ? "सहयोग करें" : "Ways to Donate",
    },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full transition-all font-poppins">
        {/* 1. TOP MINI UTILITY BAR (Exact Red Cross Specification) */}
        <div className="bg-[#F8F9FA] border-b border-gray-200/90 text-xs hidden md:block font-poppins">
          <div className="max-w-7xl mx-auto h-9 px-4 sm:px-6 lg:px-8 flex items-center justify-between font-poppins">
            {/* Left: Trust Mission Indicator */}
            <div className="flex items-center gap-3 text-gray-600 font-poppins">
              <span className="flex items-center gap-2 font-medium text-[11px] text-gray-600 font-poppins">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EA3C36] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EA3C36]"></span>
                </span>
                <span>
                  {language === "HI"
                    ? "उड़ानहर: महिलाओं को उड़ने के पंख • आयकर धारा 80G प्रमाणित (भारत)"
                    : "UdaanHer: Giving women wings to fly • 80G Certified Non-Profit (India)"}
                </span>
              </span>
            </div>

            {/* Right: Contact Hotline & Language Toggle */}
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#EA3C36]" />
                <a
                  href="tel:+917552551234"
                  className="font-semibold text-gray-700 hover:text-[#EA3C36] tracking-tight transition-colors text-[11px] focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#EA3C36] rounded px-0.5"
                >
                  +91-755-2551234
                </a>
                <span className="text-gray-300">|</span>
                <a
                  href="tel:+919826012345"
                  className="font-semibold text-gray-700 hover:text-[#EA3C36] tracking-tight transition-colors text-[11px] focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#EA3C36] rounded px-0.5"
                >
                  +91 98260 12345
                </a>
              </div>

              <span className="text-gray-300">|</span>

              <Link
                to="/eligibility"
                className="inline-flex items-center gap-1 text-[#EA3C36] font-extrabold uppercase tracking-wider hover:underline text-[11px] transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#EA3C36] rounded px-0.5"
              >
                <HelpCircle className="w-3 h-3" />
                <span>NEED HELP ?</span>
              </Link>

              <span className="text-gray-300">|</span>

              <LanguageSwitcher />
            </div>
          </div>
        </div>

        {/* 2. MAIN NAVIGATION BAR */}
        <div
          className={`bg-white/95 backdrop-blur-md border-b border-gray-200/90 transition-all duration-200 font-poppins ${
            isScrolled ? "shadow-sm bg-white/98" : "shadow-2xs"
          }`}
        >
          <div className="max-w-7xl mx-auto h-16 md:h-[70px] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 font-poppins">
            {/* Left: Brand Logo & Emblem */}
            <div className="flex items-center gap-4 lg:gap-8 font-poppins">
              <Link
                to="/"
                className="flex items-center gap-3 group shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#EA3C36] rounded-lg p-0.5 font-poppins"
              >
                {/* UdaanHer Official Brand Logo */}
                <img
                  src="/assets/images/logo.png"
                  alt="UdaanHer Logo"
                  className="h-10 sm:h-12 w-auto object-contain mix-blend-multiply group-hover:scale-[1.03] transition-transform duration-200"
                />

                {/* Brand Typography */}
                <div className="flex flex-col font-poppins">
                  <span className="text-lg sm:text-[21px] font-extrabold text-[#1A1A1A] tracking-tight leading-none group-hover:text-[#EA3C36] transition-colors font-poppins">
                    {language === "HI" ? "उड़ानहर" : "UdaanHer"}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#EA3C36] mt-0.5 leading-none font-poppins">
                    {language === "HI"
                      ? "महिलाओं को उड़ने के पंख"
                      : "Giving women wings to fly"}
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation Links */}
              <nav
                className="hidden lg:flex items-center gap-1 xl:gap-1.5 ml-2 font-poppins"
                aria-label="Main Navigation"
              >
                {navLinks.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={`relative px-3.5 py-2 rounded-lg text-sm transition-all duration-150 font-semibold whitespace-nowrap focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#EA3C36] font-poppins ${
                        active
                          ? "text-[#EA3C36] bg-red-50/90 font-bold shadow-2xs"
                          : "text-gray-700 hover:text-[#EA3C36] hover:bg-gray-50"
                      }`}
                    >
                      {link.label}
                      {active && (
                        <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-[#EA3C36] rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Actions: Session, CTA & Mobile Toggle */}
            <div className="flex items-center gap-2.5 sm:gap-3 font-poppins">
              {/* Mobile language switch */}
              <div className="md:hidden">
                <LanguageSwitcher />
              </div>

              {/* Authenticated Controls */}
              {user ? (
                <div className="hidden sm:flex items-center gap-2 font-poppins">
                  {isAdmin ? (
                    <Link
                      to="/admin"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-[#EA3C36] text-xs font-bold hover:bg-red-100 transition-colors border border-red-200/60 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#EA3C36] font-poppins"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Admin</span>
                    </Link>
                  ) : (
                    <Link
                      to="/donor/dashboard"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#EA3C36] font-poppins"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-[#EA3C36]" />
                      <span>Dashboard</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={logout}
                    title="Log out"
                    className="p-2 text-gray-500 hover:text-[#EA3C36] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#EA3C36] font-poppins"
                    aria-label="Log out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center justify-center text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-900 px-3.5 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#EA3C36] font-poppins"
                >
                  {language === "HI" ? "लॉग इन" : "Log In"}
                </Link>
              )}

              {/* Red Cross "Donate Now" CTA Button */}
              <Link
                to="/donate"
                className="inline-flex items-center justify-center gap-1.5 bg-[#EA3C36] hover:bg-[#D32F2F] active:scale-[0.98] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#EA3C36] focus-visible:ring-offset-2 font-poppins"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>{language === "HI" ? "दान करें" : "Donate Now"}</span>
              </Link>

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:text-[#EA3C36] hover:bg-gray-100 rounded-lg transition-colors focus:outline-hidden cursor-pointer"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 3. MOBILE SLIDE-DOWN DRAWER */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-gray-200 shadow-xl px-5 py-4 space-y-4 animate-fadeIn">
            {/* Navigation Links */}
            <nav
              className="flex flex-col space-y-1"
              aria-label="Mobile Navigation"
            >
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      active
                        ? "bg-red-50 text-[#EA3C36] font-bold"
                        : "text-gray-700 hover:text-[#EA3C36] hover:bg-gray-50"
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight
                      className={`w-4 h-4 ${active ? "text-[#EA3C36]" : "text-gray-400"}`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Auth & Contact Strip */}
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2.5">
              {user ? (
                <div className="flex items-center justify-between pt-1">
                  <Link
                    to={isAdmin ? "/admin" : "/donor/dashboard"}
                    className="text-xs font-bold text-[#EA3C36] hover:underline"
                  >
                    {isAdmin ? "Admin Console" : "My Donor Dashboard"}
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    className="text-center py-2 text-xs font-bold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="text-center py-2 text-xs font-bold text-white bg-[#EA3C36] hover:bg-[#D32F2F] rounded-lg transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Contact Helpline Callout */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-gray-500">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#EA3C36]" />
                  <span>+91-755-2551234</span>
                </span>
                <Link
                  to="/eligibility"
                  className="text-[#EA3C36] font-bold uppercase hover:underline"
                >
                  NEED HELP ?
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Dimmed backdrop when mobile menu is open */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};
