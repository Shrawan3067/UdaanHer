import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await login({ email, password });
      if (email.includes("admin")) {
        navigate("/admin");
      } else {
        navigate(from === "/" ? "/donor/dashboard" : from);
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillAdminDemo = () => {
    setEmail("admin@udaanher.org");
    setPassword("Admin@123456");
    setError(null);
  };

  const fillDonorDemo = () => {
    setEmail("priya.sharma@example.com");
    setPassword("Donor@123456");
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-white text-[#1A1A1A]">
      <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-xl p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-1">
            <img
              src="/assets/images/logo.png"
              alt="UdaanHer Logo"
              className="h-14 sm:h-16 w-auto object-contain mix-blend-multiply"
            />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            {language === "HI" ? "उड़ानहर पोर्टल लॉगिन" : "Log In to UdaanHer"}
          </h1>
          <p className="text-xs text-gray-500">
            Access your donor 80G receipts or trust administration desk.
          </p>
        </div>

        {/* Quick-fill demo credentials bar */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block text-center">
            Quick-Fill Demo Credentials
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillAdminDemo}
              className="py-1.5 px-2 bg-white border border-gray-200 rounded-md text-xs font-semibold text-gray-800 hover:border-[#EA3C36] hover:text-[#EA3C36] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[15px] text-[#EA3C36]">
                shield
              </span>
              <span>Admin Demo</span>
            </button>
            <button
              type="button"
              onClick={fillDonorDemo}
              className="py-1.5 px-2 bg-white border border-gray-200 rounded-md text-xs font-semibold text-gray-800 hover:border-[#EA3C36] hover:text-[#EA3C36] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[15px] text-[#EA3C36]">
                person
              </span>
              <span>Donor Demo</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs flex items-center gap-2 border border-red-200">
            <span className="material-symbols-outlined text-[16px] text-red-600">
              error
            </span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 bg-white rounded-lg text-sm text-[#1A1A1A] border border-gray-300 focus:border-[#EA3C36] focus:outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-white rounded-lg text-sm text-[#1A1A1A] border border-gray-300 focus:border-[#EA3C36] focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-[#EA3C36] hover:bg-[#D32F2F] text-white font-bold text-sm rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Don't have an account yet?{" "}
            <Link
              to="/register"
              className="text-[#EA3C36] font-bold hover:underline"
            >
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
