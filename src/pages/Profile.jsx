import { useState, useEffect } from "react";
import { User, Mail, Phone, Shield, LogOut, Calendar, Hash, Activity } from "lucide-react";

import api from "../api/client";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Profile({ onLogout }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("profile");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
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
    <div className="flex h-screen bg-[#f1f5f9] font-sans overflow-hidden text-slate-800" dir="ltr">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className="flex-1 p-4 lg:p-8 overflow-y-auto animate-fade-in bg-gray-50/50">

          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 tracking-tight">Account Settings</h1>
            <p className="text-xs lg:text-sm text-gray-500 font-medium mb-8">Manage your profile information and system preferences.</p>

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
                    <h2 className="text-xl font-bold text-gray-900">{user.fullName || "Unknown User"}</h2>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-3 py-1 rounded-full mt-2 inline-flex items-center gap-1.5">
                      <Shield size={12} /> {user.role}
                    </span>
                    <p className="text-gray-500 text-sm mt-4 font-medium px-4">
                      Active authorized personnel within the SAIR central system.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      if (onLogout) onLogout();
                      else window.location.href = "/login";
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3.5 px-4 rounded-2xl transition-colors border border-red-100 shadow-sm"
                  >
                    <LogOut size={18} /> Secure Logout
                  </button>
                </div>

                {/* Right Column: Detailed Info */}
                <div className="md:col-span-2 space-y-6">

                  <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                      <Hash className="text-gray-400" size={20} /> Personal Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Full Name</span>
                        <div className="flex items-center gap-3 text-gray-800 font-medium">
                          <User size={16} className="text-[#1a4b7c]" />
                          {user.fullName || "N/A"}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Email Address</span>
                        <div className="flex items-center gap-3 text-gray-800 font-medium">
                          <Mail size={16} className="text-[#1a4b7c]" />
                          {user.email || "N/A"}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Phone Number</span>
                        <div className="flex items-center gap-3 text-gray-800 font-medium">
                          <Phone size={16} className="text-[#1a4b7c]" />
                          <span dir="ltr">{user.phone || "N/A"}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">National ID</span>
                        <div className="flex items-center gap-3 text-gray-800 font-medium">
                          <Hash size={16} className="text-[#1a4b7c]" />
                          {user.nationalId || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                      <Activity className="text-gray-400" size={20} /> System Records
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Account Created</span>
                        <div className="flex items-center gap-3 text-gray-800 font-medium">
                          <Calendar size={16} className="text-[#1a4b7c]" />
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "N/A"}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">System ID</span>
                        <div className="flex items-center gap-3 text-gray-800 font-medium text-sm">
                          <Shield size={16} className="text-[#1a4b7c]" />
                          {user.id || "N/A"}
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