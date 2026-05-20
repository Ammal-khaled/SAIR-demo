import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Shield,
  LogOut,
  Calendar,
  Hash,
  Activity,
  RotateCcw,
  LayoutDashboard,
  Database,
  KeyRound,
} from "lucide-react";

import api from "../api/client";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { clearAuthState, getDemoUser } from "../utils/demoAuth";
import { resetDemoReports } from "../data/reports";

export default function Profile({ onLogout }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("profile");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const demoUser = getDemoUser();
        if (demoUser) {
          setUser({
            ...demoUser,
            fullName: "Demo Administrator",
            createdAt: "2026-05-01T09:00:00.000Z",
            id: "SAIR-DEMO-ADMIN",
          });
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
          setLoading(false);
          return;
        }

        const res = await api.get("/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(res.data);
      } catch (err) {
        console.log(err?.response?.data || err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <div
      className="flex h-screen overflow-hidden bg-[#F4F7FB] font-sans text-slate-800"
      dir="ltr"
    >
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 animate-fade-in bg-[#F4F7FB]">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-[#102033] mb-2 tracking-tight">
                  Account Settings
                </h1>
                <p className="text-xs lg:text-sm text-[#64748B] font-medium">
                  Demo administrator controls and system access overview.
                </p>
              </div>
              <span className="w-fit text-[10px] font-bold uppercase tracking-widest text-[#3BAE75] bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg">
                Demo mode
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4b7c]"></div>
              </div>
            ) : !user ? (
              <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex items-center justify-center font-medium">
                No user data found or session expired.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Quick Info */}
                <div className="md:col-span-1 space-y-6">
                  <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-200 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-[#1a4b7c] to-[#2e74c0]"></div>
                    <div className="w-28 h-28 bg-white rounded-full p-2 relative z-10 shadow-lg mt-6 mb-4">
                      <div className="w-full h-full bg-blue-50 rounded-full flex items-center justify-center text-[#1a4b7c]">
                        <User size={48} strokeWidth={1.5} />
                      </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {user.fullName || "Unknown User"}
                    </h2>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-3 py-1 rounded-full mt-2 inline-flex items-center gap-1.5">
                      <Shield size={12} /> {user.role}
                    </span>
                    <p className="text-gray-500 text-sm mt-4 font-medium px-4">
                      Admin role for the portfolio-safe SAIR Demo environment.
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full flex items-center justify-center gap-2 bg-[#102033] hover:bg-[#0B1624] text-white font-bold py-3.5 px-4 rounded-2xl transition-colors border border-[#102033] shadow-sm"
                  >
                    <LayoutDashboard size={18} /> Back to Dashboard
                  </button>

                  <button
                    onClick={() => {
                      clearAuthState();
                      if (onLogout) onLogout();
                      else window.location.href = "/login";
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3.5 px-4 rounded-2xl transition-colors border border-red-100 shadow-sm"
                  >
                    <LogOut size={18} /> Secure Logout
                  </button>

                  <button
                    onClick={() => {
                      resetDemoReports();
                      setResetMessage(
                        "Demo reports restored to their original fictional data.",
                      );
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#102033] font-bold py-3.5 px-4 rounded-2xl transition-colors border border-slate-200 shadow-sm"
                  >
                    <RotateCcw size={18} /> Reset Demo Data
                  </button>

                  {resetMessage && (
                    <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                      {resetMessage}
                    </p>
                  )}
                </div>

                {/* Right Column: Detailed Info */}
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                      <Hash className="text-gray-400" size={20} /> Personal
                      Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                          Full Name
                        </span>
                        <div className="flex items-center gap-3 text-gray-800 font-medium">
                          <User size={16} className="text-[#1a4b7c]" />
                          {user.fullName || "N/A"}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                          Email Address
                        </span>
                        <div className="flex items-center gap-3 text-gray-800 font-medium">
                          <Mail size={16} className="text-[#1a4b7c]" />
                          {user.email || "N/A"}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                          Phone Number
                        </span>
                        <div className="flex items-center gap-3 text-gray-800 font-medium">
                          <Phone size={16} className="text-[#1a4b7c]" />
                          <span dir="ltr">{user.phone || "N/A"}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                          National ID
                        </span>
                        <div className="flex items-center gap-3 text-gray-800 font-medium">
                          <Hash size={16} className="text-[#1a4b7c]" />
                          {user.nationalId || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                      <Activity className="text-gray-400" size={20} /> System
                      Records
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                          Account Created
                        </span>
                        <div className="flex items-center gap-3 text-gray-800 font-medium">
                          <Calendar size={16} className="text-[#1a4b7c]" />
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )
                            : "N/A"}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                          System ID
                        </span>
                        <div className="flex items-center gap-3 text-gray-800 font-medium text-sm">
                          <Shield size={16} className="text-[#1a4b7c]" />
                          {user.id || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                      <KeyRound className="text-[#2563EB]" size={20} /> System
                      Access
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-[#F4F7FB] border border-[#D8E0EA] rounded-2xl p-4">
                        <span className="text-xs font-bold text-[#64748B] uppercase tracking-widest block mb-1.5">
                          Last Login
                        </span>
                        <div className="text-[#102033] font-bold">
                          Demo session
                        </div>
                      </div>

                      <div className="bg-[#F4F7FB] border border-[#D8E0EA] rounded-2xl p-4">
                        <span className="text-xs font-bold text-[#64748B] uppercase tracking-widest block mb-1.5">
                          Data Source
                        </span>
                        <div className="flex items-center gap-2 text-[#102033] font-bold">
                          <Database size={16} className="text-[#3BAE75]" />
                          Fictional demo data
                        </div>
                      </div>

                      <div className="bg-[#F4F7FB] border border-[#D8E0EA] rounded-2xl p-4">
                        <span className="text-xs font-bold text-[#64748B] uppercase tracking-widest block mb-1.5">
                          Access Level
                        </span>
                        <div className="text-[#102033] font-bold">
                          Admin dashboard
                        </div>
                      </div>

                      <div className="bg-[#F4F7FB] border border-[#D8E0EA] rounded-2xl p-4">
                        <span className="text-xs font-bold text-[#64748B] uppercase tracking-widest block mb-1.5">
                          Environment
                        </span>
                        <div className="text-[#102033] font-bold">
                          Portfolio demo
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
