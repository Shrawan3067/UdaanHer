import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import {
  Phone,
  Mail,
  MapPin,
  ChevronUp,
  ShieldCheck,
  Heart,
  Send,
  CheckCircle2,
} from "lucide-react";

export const Footer: React.FC = () => {
  const { language } = useLanguage();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail("");
    setTimeout(() => setNewsletterSubscribed(false), 5000);
  };

  return (
    <footer className="w-full bg-[#1A1A1A] text-white relative mt-auto border-t-4 border-[#EA3C36]">
      {/* 1. TOP CONTACT STRIP */}
      <div className="border-b border-[#2C2D30] py-6 px-6 lg:px-12 bg-[#202124]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-12 w-full lg:w-auto">
            {/* Phone Number */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#EA3C36] flex items-center justify-center text-white shrink-0 shadow-sm">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">
                  Emergency &amp; Support Phone
                </p>
                <p className="text-sm font-semibold text-white tracking-tight">
                  +91-755-2551234, +91 98260 12345
                </p>
              </div>
            </div>

            {/* Email Address */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#EA3C36] flex items-center justify-center text-white shrink-0 shadow-sm">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">
                  Humanitarian Helpdesk Email
                </p>
                <p className="text-sm font-semibold text-white tracking-tight">
                  support@udaanher.org, info@udaanher.org
                </p>
              </div>
            </div>

            {/* Office Address */}
            <div className="flex items-center gap-3.5 sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 rounded-full bg-[#EA3C36] flex items-center justify-center text-white shrink-0 shadow-sm">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">
                  Headquarters Address
                </p>
                <p className="text-sm font-semibold text-white tracking-tight">
                  Plot 14, Arera Hills, Bhopal, Madhya Pradesh - 462011, India
                </p>
              </div>
            </div>
          </div>

          {/* Red Donate Now Button */}
          <Link
            to="/donate"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#EA3C36] hover:bg-[#D32F2F] text-white font-bold px-8 py-3 rounded-lg text-sm shadow-md transition-all hover-lift shrink-0 active:scale-[0.98]"
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>{language === "HI" ? "दान करें" : "Donate Now"}</span>
          </Link>
        </div>
      </div>

      {/* 2. EMERGENCY WOMEN SAFETY & 80G REGULATORY STRIP */}
      <div className="bg-[#141414] border-b border-[#2C2D30] py-3.5 px-6 lg:px-12 text-xs text-gray-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 text-[11px]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2A2B2E] text-white font-semibold border border-[#3A3B3E]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00A3C4]" />
              <span>Section 80G Tax Exemption Certified</span>
            </span>
            <span className="text-gray-400">
              80G Reg: CIT(E)/BPL/80G/2021-22/A-1089
            </span>
            <span className="text-gray-600 hidden sm:inline">•</span>
            <span className="text-gray-400">PAN: AAATC1234D</span>
          </div>

          {/* Women Helplines Banner */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px]">
            <span className="text-red-400 font-bold uppercase tracking-wider">
              Women Safety 24x7:
            </span>
            <span className="bg-red-950/70 text-red-300 px-2 py-0.5 rounded border border-red-800/60 font-bold">
              181 (Women in Distress)
            </span>
            <span className="bg-red-950/70 text-red-300 px-2 py-0.5 rounded border border-red-800/60 font-bold">
              1091 (Police Helpline)
            </span>
          </div>
        </div>
      </div>

      {/* 3. MAIN 5-COLUMN FOOTER */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Column 1 & 2: Brand Mission & Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/images/logo.png"
                alt="UdaanHer Logo"
                className="h-10 w-auto bg-white rounded-lg p-1 object-contain shrink-0"
              />
              <div className="flex flex-col">
                <span className="text-lg text-white font-bold leading-tight">
                  UdaanHer Charitable Foundation
                </span>
                <span className="text-xs text-[#EA3C36] font-semibold">
                  Giving women wings to fly • India
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              The mission of UdaanHer is to give women wings to fly: empower
              Indian women, eradicate poverty, and foster economic autonomy
              through community Self-Help Groups (SHGs), direct government
              welfare scheme navigation, and verified grassroots humanitarian
              relief across India.
            </p>

            {/* Newsletter Subscription Box */}
            <div className="pt-2 max-w-sm">
              <p className="text-xs text-gray-300 font-semibold mb-2">
                Subscribe for humanitarian updates &amp; welfare reports:
              </p>
              {newsletterSubscribed ? (
                <div className="flex items-center gap-2 p-2.5 bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs rounded-lg">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Thank you for subscribing to UdaanHer updates!</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="flex-1 bg-[#252629] border border-[#3C3D42] rounded-lg px-3 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-hidden focus:border-[#EA3C36] transition-colors"
                  />
                  <button
                    type="submit"
                    className="bg-[#EA3C36] hover:bg-[#D32F2F] text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    aria-label="Subscribe to newsletter"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href="#facebook"
                className="w-8 h-8 rounded-md bg-[#2B2C2F] hover:bg-[#EA3C36] flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <span className="text-xs font-bold">f</span>
              </a>
              <a
                href="#twitter"
                className="w-8 h-8 rounded-md bg-[#2B2C2F] hover:bg-[#EA3C36] flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <span className="text-xs font-bold">t</span>
              </a>
              <a
                href="#youtube"
                className="w-8 h-8 rounded-md bg-[#2B2C2F] hover:bg-[#EA3C36] flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <span className="text-xs font-bold">▶</span>
              </a>
            </div>
          </div>

          {/* Column 3: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/schemes"
                  className="hover:text-white transition-colors"
                >
                  Programs &amp; Services
                </Link>
              </li>
              <li>
                <Link
                  to="/eligibility"
                  className="hover:text-white transition-colors"
                >
                  Eligibility Calculator
                </Link>
              </li>
              <li>
                <Link
                  to="/campaigns"
                  className="hover:text-white transition-colors"
                >
                  Campaigns &amp; Impact
                </Link>
              </li>
              <li>
                <Link
                  to="/donate"
                  className="hover:text-white transition-colors"
                >
                  Tax-Deductible Donations
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Welfare Services */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wide">
              Welfare Initiatives
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link
                  to="/schemes?category=Healthcare+%26+Nutrition"
                  className="hover:text-white transition-colors"
                >
                  Maternal Healthcare
                </Link>
              </li>
              <li>
                <Link
                  to="/schemes?category=Livelihood+%26+Finance"
                  className="hover:text-white transition-colors"
                >
                  SHG Micro-Enterprises
                </Link>
              </li>
              <li>
                <Link
                  to="/schemes?category=Social+Security"
                  className="hover:text-white transition-colors"
                >
                  Widow Pension Support
                </Link>
              </li>
              <li>
                <Link
                  to="/schemes?category=Education+%26+Training"
                  className="hover:text-white transition-colors"
                >
                  Digital Rights Caravan
                </Link>
              </li>
              <li>
                <Link
                  to="/eligibility"
                  className="hover:text-white transition-colors"
                >
                  Free Assistance Request
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: For Donors & Volunteers */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wide">
              For Donors
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link
                  to="/donate"
                  className="hover:text-white transition-colors"
                >
                  Online Donation (UPI/Card)
                </Link>
              </li>
              <li>
                <Link
                  to="/donor/dashboard"
                  className="hover:text-white transition-colors"
                >
                  Download 80G Receipts
                </Link>
              </li>
              <li>
                <Link
                  to="/campaigns"
                  className="hover:text-white transition-colors"
                >
                  Fund Raisers &amp; Audit Logs
                </Link>
              </li>
              <li>
                <Link
                  to="/donate"
                  className="hover:text-white transition-colors"
                >
                  Donation FAQs &amp; FCRA Rules
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="hover:text-white transition-colors"
                >
                  Donor Portal Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Support Hotline Text */}
        <div className="pt-6 border-t border-[#2C2D30] text-center">
          <p className="text-xs text-gray-400">
            Need help with your donation or welfare guidance? Please call{" "}
            <a
              href="tel:+917552551234"
              className="text-white font-semibold hover:underline"
            >
              +91-755-2551234
            </a>{" "}
            or{" "}
            <a
              href="tel:+919826012345"
              className="text-white font-semibold hover:underline"
            >
              +91 98260 12345
            </a>
          </p>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-6 pt-4 border-t border-[#252628] flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-2">
          <p>
            © 2026 UdaanHer Charitable Trust (Bhopal, India). Section 80G IT Act
            Compliant. All rights reserved.
          </p>
          <p className="text-gray-400">
            Giving women wings to fly • Built with ISO-standard audit trails
            &amp; instant 80G tax receipt compliance.
          </p>
        </div>
      </div>

      {/* Floating Scroll to Top Red Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-11 h-11 rounded-full bg-[#EA3C36] hover:bg-[#D32F2F] text-white flex items-center justify-center shadow-lg transition-all hover-lift z-40 cursor-pointer active:scale-95"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </footer>
  );
};
