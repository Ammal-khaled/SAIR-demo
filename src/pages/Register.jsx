import { useState } from "react";
import { registerUser } from "../api/auth";
import { useNavigate } from "react-router-dom";
import {
  User, Lock, ArrowRight, Shield,
  Globe, Building
} from "lucide-react";

import Logo from "../components/ui/Logo";

const registerStyles = `
  @keyframes slideUp { 
    from { opacity: 0; transform: translateY(20px); } 
    to { opacity: 1; transform: translateY(0); } 
  }
  .animate-slide-up { 
    animation: slideUp 0.6s ease-out forwards; 
  }
`;

export default function Register({ onNavigateToLogin }) {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        fullName: `${firstName} ${lastName}`,
        email,
        phone: "0790000000",
        password,
        role: "citizen",
        department
      };

      const res = await registerUser(payload);

      const success =
        res?.data?.id ||
        res?.data?.user?.id ||
        res?.data?.message;

      if (success) {
        navigate("/login");
      } else {
        setError("Something went wrong");
        alert("Something went wrong");
      }

    } catch (err) {
      console.log("REGISTER ERROR:", err?.response?.data || err);

      setError(
        err?.response?.data?.message ||
        "Register failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    onNavigateToLogin?.();
    navigate("/login");
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col relative font-sans text-slate-800">
      <style>{registerStyles}</style>

      <div className="flex-1 flex items-center justify-center p-4">

        <div className="w-full max-w-[480px] bg-white rounded-[32px] p-6 lg:p-8 shadow-2xl border border-slate-100 animate-slide-up">

          {/* HEADER */}
          <div className="flex flex-col items-center mb-6 lg:mb-8 text-center">
            <div className="mb-2">
              <Logo />
            </div>
            <h1 className="text-xl lg:text-2xl font-serif font-bold text-[#002855]">
              Portal Access Request
            </h1>
            <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              SAER Public Safety Portal
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="text-xs font-bold text-[#1a4b7c]">
                Full Name
              </label>
              <div className="grid grid-cols-2 gap-4 mt-1">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm"
                  required
                />

                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            {/* EMAIL (NEW MAIN FIELD) */}
            <div>
              <label className="text-xs font-bold text-[#1a4b7c]">
                Email
              </label>

              <div className="relative mt-1">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="text-xs font-bold text-[#1a4b7c]">
                Department / Unit
              </label>

              <div className="relative mt-1">
                <Building className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm appearance-none"
                  required
                >
                  <option value="">Select unit...</option>
                  <option value="traffic">Traffic Control</option>
                  <option value="patrol">Highway Patrol</option>
                  <option value="dispatch">Dispatch</option>
                </select>
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-xs font-bold text-[#1a4b7c]">
                Password
              </label>

              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* SUBMIT */}
            <button
              disabled={loading}
              className="w-full bg-[#1a4b7c] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              {loading ? "Submitting..." : "Submit Access Request"}
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* LOGIN */}
            <div className="text-center pt-2">
              Already have an account?{" "}
              <button
                type="button"
                onClick={goToLogin}
                className="text-[#1a4b7c] font-bold hover:underline"
              >
                Return to Login
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