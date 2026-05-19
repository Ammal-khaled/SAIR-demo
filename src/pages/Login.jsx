import { useState } from "react";
import { loginUser } from "../api/auth";
import { useNavigate } from "react-router-dom";
import {
  User, Lock, ArrowRight, Shield, ShieldCheck,
  Globe, Info
} from "lucide-react";

import Logo from "../components/ui/Logo";

const loginStyles = `
  @keyframes slideUp { 
    from { opacity: 0; transform: translateY(20px); } 
    to { opacity: 1; transform: translateY(0); } 
  }
  .animate-slide-up { 
    animation: slideUp 0.6s ease-out forwards; 
  }
`;

export default function Login({ onLogin, onNavigateToRegister }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("API URL:", import.meta.env.VITE_API_URL);

    setLoading(true);
    setError(null);

    try {
      const res = await loginUser({
        email,
        password
      });

      const token = res?.data?.token;

      if (!token) {
        setError("No token received from server");
        return;
      }

      localStorage.setItem("token", token);

      if (res?.data?.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      onLogin?.(res.data);
      navigate("/dashboard");

    } catch (err) {
      console.log(err?.response?.data || err);

      setError(
        err?.response?.data?.message ||
        "Login failed. Check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col relative font-sans text-slate-800">
      <style>{loginStyles}</style>

      {/* Info */}
      <div className="absolute bottom-6 left-6 z-20 hidden md:block">
        <button className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-[#1a4b7c]">
          <Info className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">

        <div className="w-full max-w-[420px] bg-white rounded-[32px] p-6 lg:p-8 shadow-2xl border border-slate-100 animate-slide-up">

          {/* HEADER */}
          <div className="flex flex-col items-center mb-6 lg:mb-8 text-center">
            <div className="mb-2">
              <Logo />
            </div>
            <h1 className="text-xl lg:text-2xl font-serif font-bold text-[#002855]">
              Officer Login
            </h1>
            <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              SAER Public Safety Portal
            </p>
          </div>

          {/* SECURITY */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 mb-8">
            <ShieldCheck className="w-5 h-5 text-[#1a4b7c]" />
            <p className="text-xs text-blue-900">
              Encryption active. All access is monitored.
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="text-xs font-bold text-[#1a4b7c]">
                Email
              </label>

              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-[#1a4b7c]">
                  Password
                </label>

                <button
                  type="button"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Forgot?
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* BUTTON */}
            <button
              disabled={loading}
              className="w-full bg-[#1a4b7c] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              {loading ? "Authenticating..." : "Secure Login"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>

            {/* REGISTER */}
            <div className="text-center pt-2">
              Don't have access?{" "}
              <button
                type="button"
                onClick={() => {
                  onNavigateToRegister?.();
                  navigate("/register");
                }}
                className="text-[#1a4b7c] font-bold hover:underline"
              >
                Request Access
              </button>
            </div>

          </form>

          {/* FOOTER */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                System Status: Optimal
              </span>
            </div>

            <div className="px-2 py-1 bg-slate-100 text-slate-500 text-[9px] font-bold rounded-md">
              v4.2.0-SEC
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}