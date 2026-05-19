import { useState, useEffect } from "react";
import { Search, Filter, Download, Eye, FileText, Clock } from "lucide-react";
import api from "../api/client";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

// Badge 그대로
const Badge = ({ children, variant = 'gray' }) => {
  const variants = {
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-100 text-blue-700',
    red: 'bg-red-100 text-red-700',
    green: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase ${variants[variant]}`}>
      {children}
    </span>
  );
};

export default function ApprovedReports() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState("reports");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ---------------- API LOAD ----------------
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get("/reports");

        const data = (res.data || []).filter(r => r.status === 'resolved');

        const mapped = data.map((r) => ({
          id: r.id,
          date: new Date(r.createdAt).toLocaleString(),
          party: r.partyName || r.driver || "",
          type: r.accidentType || r.type,
          status: r.status,
          officer: r.officer || "Unassigned"
        }));

        setLogs(mapped);

      } catch (err) {
        console.log(err?.response?.data || err);
        setLogs([]);
      }
    };

    fetchLogs();
  }, []);

  // ---------------- STATUS BADGE ----------------
  const getStatusVariant = (status) => {
    if (status === 'resolved') return 'green';
    if (status === 'rejected') return 'red';
    if (status === 'submitted') return 'blue';
    if (status === 'under_review') return 'gray';
    return 'gray';
  };

  // ---------------- FILTER (SAFE ONLY) ----------------
  const filteredLogs = logs.filter((log) => {
    const q = searchTerm.toLowerCase();

    return (
      String(log.id ?? "").toLowerCase().includes(q) ||
      String(log.party ?? "").toLowerCase().includes(q)
    );
  });

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
          searchQuery={searchTerm} 
          setSearchQuery={setSearchTerm} 
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className="h-full bg-gray-50/50 p-4 lg:p-8 font-sans animate-fade-in overflow-y-auto" dir="ltr">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 animate-slide-up gap-4" style={{ animationDelay: '0.1s' }}>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1 tracking-tight">System Logs & Reports</h1>
              <p className="text-xs lg:text-sm text-gray-500 font-medium">Manage and review all processed incident reports.</p>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all active:scale-95">
                <Filter className="w-4 h-4 text-gray-400" /> Filter
              </button>

              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#1a4b7c] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#133b63] transition-all active:scale-95">
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-[24px] shadow-sm overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>

            <div className="p-4 lg:p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white gap-4">
              <div className="relative w-full sm:w-80 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1a4b7c] transition-colors" />
                <input
                  type="text"
                  placeholder="Search by ID or Party name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                />
              </div>

              <div className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest">
                {filteredLogs.length} Records Found
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Report ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date & Time</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Involved Party</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-blue-50/30 transition-colors group">

                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{log.id}</span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        <Clock className="w-3.5 h-3.5 inline mr-2 text-gray-400" />
                        {log.date}
                      </td>

                      <td className="px-6 py-4 text-sm font-bold text-gray-800">
                        {log.party}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {log.type}
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant={getStatusVariant(log.status)}>
                          {log.status}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-gray-400 hover:text-[#1a4b7c] hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}