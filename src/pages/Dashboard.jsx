import { useState, useEffect, useRef } from 'react';
import api from "../api/client";
import {
  Clock, AlertCircle, CheckCircle, FileText,
  Check, X
} from 'lucide-react';

// External component imports
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import ReportCard from "../components/ReportCard";

// --- Global Styles ---
const dashboardStyles = `
  @keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideInLeft { from { opacity: 0; transform: translateX(-15px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  
  .animate-slide-up { animation: slideUp 0.4s ease-out forwards; opacity: 0; }
  .animate-slide-in-left { animation: slideInLeft 0.3s ease-out forwards; opacity: 0; }
  .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; opacity: 0; }
  
  .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`;

export default function Dashboard() {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState('active');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [leftWidth, setLeftWidth] = useState(35);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);
  const total = incidents.length;

  const pending = incidents.filter(
    i => i.status === "submitted"
  ).length;

  const underReview = incidents.filter(
    i => i.status === "under_review"
  ).length;

  const approved = incidents.filter(
    i => i.status === "resolved"
  ).length;
  // ---------------- API LOAD ----------------
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res = await api.get("/reports");

        setIncidents(res.data);
        setSelectedIncident(res.data[0] || null);

      } catch (err) {
        console.error(err);
        setIncidents([]);
      }
    };

    fetchIncidents();
  }, []);

  // ---------------- STATUS UPDATE ----------------
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/reports/${id}/status`, {
        status: newStatus
      });

      setIncidents(prev =>
        prev.map(inc =>
          inc.id === id
            ? { ...inc, status: newStatus }
            : inc
        )
      );

      if (selectedIncident?.id === id) {
        setSelectedIncident(prev =>
          prev ? { ...prev, status: newStatus } : prev
        );
      }

    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- RESIZE ----------------
  const startResizing = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const newWidthPercent = ((e.clientX - rect.left) / rect.width) * 100;

      if (newWidthPercent > 25 && newWidthPercent < 55) {
        setLeftWidth(newWidthPercent);
      }
    };

    const stopResizing = () => setIsResizing(false);

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', stopResizing);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResizing);
      document.body.style.cursor = 'auto';
      document.body.style.userSelect = 'auto';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing]);

  // ---------------- FILTER ----------------
  const statuses = [
    { id: 'all', label: 'All Cases' },
    { id: 'submitted', label: 'Submitted' },
    { id: 'under_review', label: 'Under Review' },
    { id: 'verified', label: 'Verified' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'resolved', label: 'Resolved' },
    { id: 'rejected', label: 'Rejected' },
  ];

  const filteredIncidents = incidents.filter(inc => {
    const matchesFilter =
      activeFilter === 'all' || inc.status === activeFilter;

    const query = searchQuery.toLowerCase();

    const matchesSearch =
      !query ||
      inc.id?.toLowerCase().includes(query) ||
      inc.accidentType?.toLowerCase().includes(query) ||
      (inc.platesNumber ?? []).join(" ").toLowerCase().includes(query)
    return matchesFilter && matchesSearch;
  });

  const detailsRef = useRef(null);

  const handleSelectIncident = (inc) => {
    setSelectedIncident(inc);
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9] font-sans overflow-hidden text-slate-800" dir="ltr">
      <style>{dashboardStyles}</style>

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

        <main className="flex-1 relative overflow-y-auto lg:overflow-hidden bg-gray-50/50 flex flex-col p-4 lg:p-6 gap-6">

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 shrink-0">

            <StatCard
              title="Pending"
              value={pending}
              sub="+2"
              icon={Clock}
              delay="0s"
              className="p-4 lg:p-5"
            />

            <StatCard
              title="Review"
              value={underReview}
              sub="Active"
              icon={AlertCircle}
              delay="0.1s"
              className="p-4 lg:p-5"
            />

            <StatCard
              title="Approved"
              value={approved}
              sub="Today"
              icon={CheckCircle}
              delay="0.2s"
              className="p-4 lg:p-5"
            />

            <StatCard
              title="Total"
              value={total}
              sub="System"
              icon={FileText}
              delay="0.3s"
              className="p-4 lg:p-5"
            />

          </div>



          {/* Split View */}
          <div ref={containerRef} className="lg:flex-1 flex flex-col lg:flex-row lg:overflow-hidden relative lg:min-h-0">

            {/* LEFT - List */}
            <div
              style={{ width: window.innerWidth < 1024 ? '100%' : `${leftWidth}%` }}
              className="flex flex-col h-auto lg:h-full lg:pr-2 shrink-0"
            >

              <div className="flex gap-2 mb-4 shrink-0 overflow-x-auto pb-1 custom-scrollbar">
                {statuses.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setActiveFilter(s.id)}
                    className={`px-4 py-1.5 text-xs font-medium rounded-full border transition-all whitespace-nowrap ${activeFilter === s.id
                      ? 'bg-[#1a4b7c] text-white border-[#1a4b7c]'
                      : 'bg-white text-gray-600 border-gray-200'
                      }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pb-4 custom-scrollbar pr-1">
                {filteredIncidents.length > 0 ? (
                  filteredIncidents.map((inc, i) => (
                    <ReportCard
                      key={inc.id}
                      incident={inc}
                      isSelected={selectedIncident?.id === inc.id}
                      onClick={() => handleSelectIncident(inc)}
                      delay={`${0.2 + i * 0.05}s`}
                    />
                  ))
                ) : (
                  <div className="text-center text-gray-400 text-sm py-8">
                    No results found.
                  </div>
                )}
              </div>
            </div>

            {/* RESIZER - Desktop only */}
            <div
              onMouseDown={startResizing}
              className="hidden lg:block w-1.5 h-full cursor-col-resize"
            />

            {/* RIGHT - Details */}
            <div ref={detailsRef} className="flex-1 bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden shadow-sm lg:ml-2 min-h-[500px] lg:min-h-0 mb-8 lg:mb-0">

              {selectedIncident?.id ? (
                <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">

                  <div className="flex flex-col sm:flex-row justify-between mb-8 border-b pb-6 gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h2 className="text-xl lg:text-2xl font-bold">
                          Report #{selectedIncident.id?.slice(-6) || selectedIncident.id}
                        </h2>
                        <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${selectedIncident.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                          selectedIncident.status === 'under_review' ? 'bg-yellow-100 text-yellow-700' :
                            selectedIncident.status === 'verified' ? 'bg-indigo-100 text-indigo-700' :
                              selectedIncident.status === 'in_progress' ? 'bg-orange-100 text-orange-700' :
                                selectedIncident.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                  selectedIncident.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                          }`}>
                          {selectedIncident.status}
                        </span>
                      </div>
                      <p className="text-xs lg:text-sm text-gray-500 font-medium">
                        {selectedIncident?.partyName || selectedIncident?.driver || "Citizen Report"} • {selectedIncident?.occurredAt ? new Date(selectedIncident.occurredAt).toLocaleString() : new Date(selectedIncident.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 h-fit">
                      {selectedIncident.status !== 'rejected' && selectedIncident.status !== 'resolved' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(selectedIncident.id, 'rejected')}
                            className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 bg-white hover:bg-red-50 hover:text-red-600 transition-all text-gray-600 font-bold text-sm rounded-xl"
                          >
                            <X className="w-4 h-4 inline mr-1" /> Reject
                          </button>

                          {selectedIncident.status === 'submitted' && (
                            <button onClick={() => handleUpdateStatus(selectedIncident.id, 'under_review')} className="flex-1 sm:flex-none px-4 py-2 bg-yellow-500 hover:bg-yellow-600 transition-colors text-white font-bold text-sm rounded-xl shadow-md">
                              <AlertCircle className="w-4 h-4 inline mr-1" /> Mark Review
                            </button>
                          )}

                          {selectedIncident.status === 'under_review' && (
                            <button onClick={() => handleUpdateStatus(selectedIncident.id, 'verified')} className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-bold text-sm rounded-xl shadow-md">
                              <CheckCircle className="w-4 h-4 inline mr-1" /> Verify Report
                            </button>
                          )}

                          {selectedIncident.status === 'verified' && (
                            <button onClick={() => handleUpdateStatus(selectedIncident.id, 'in_progress')} className="flex-1 sm:flex-none px-4 py-2 bg-orange-500 hover:bg-orange-600 transition-colors text-white font-bold text-sm rounded-xl shadow-md">
                              <Clock className="w-4 h-4 inline mr-1" /> Start Process
                            </button>
                          )}

                          {selectedIncident.status === 'in_progress' && (
                            <button onClick={() => handleUpdateStatus(selectedIncident.id, 'resolved')} className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 transition-colors text-white font-bold text-sm rounded-xl shadow-md">
                              <Check className="w-4 h-4 inline mr-1" /> Finalize Case
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Details */}
                    <div className="space-y-6">

                      <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Incident Details</h3>
                        <div className="bg-gray-50 rounded-xl p-4 lg:p-5 border border-gray-100 space-y-4">
                          <div className="flex justify-between border-b border-gray-200 pb-3">
                            <span className="text-gray-500 font-medium text-sm">Type</span>
                            <span className="font-bold text-gray-900 text-sm">{selectedIncident.accidentType || selectedIncident.type}</span>
                          </div>
                          <div className="flex justify-between border-b border-gray-200 pb-3">
                            <span className="text-gray-500 font-medium text-sm">Plates Number</span>
                            <span className="font-bold text-[#1a4b7c] bg-blue-50 px-2 py-0.5 rounded text-sm">{(selectedIncident.platesNumber || []).join(', ') || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between border-b border-gray-200 pb-3">
                            <span className="text-gray-500 font-medium text-sm">Source</span>
                            <span className="font-bold text-gray-900 uppercase text-sm">{selectedIncident.locationSource || 'N/A'}</span>
                          </div>
                          <div className="pt-1">
                            <span className="text-gray-500 font-medium block mb-2 text-sm">Description</span>
                            <p className="text-gray-800 bg-white p-3 rounded border border-gray-200 text-sm leading-relaxed">
                              {selectedIncident.description || "No description provided."}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Location</h3>
                        {selectedIncident.lat && selectedIncident.lng ? (
                          <div className="bg-gray-50 rounded-xl p-4 lg:p-5 border border-gray-100">
                            <p className="text-gray-800 font-mono text-[11px] lg:text-sm mb-4 bg-white p-2 border border-gray-200 rounded text-center truncate">
                              {selectedIncident.lat}, {selectedIncident.lng}
                            </p>
                            <a
                              href={`https://www.google.com/maps?q=${selectedIncident.lat},${selectedIncident.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-full text-center py-2.5 bg-[#1a4b7c] text-white font-bold text-sm rounded-xl hover:bg-[#133b63] shadow-md transition-colors"
                            >
                              Open in Maps
                            </a>
                          </div>
                        ) : (
                          <p className="text-gray-400 italic text-sm">Location coordinates not available.</p>
                        )}
                      </div>

                    </div>

                    {/* Media */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Evidence</h3>
                      {selectedIncident.mediaUrls && selectedIncident.mediaUrls.length > 0 ? (
                        <div className="space-y-4">
                          {selectedIncident.mediaUrls.map((url, idx) => (
                            <div key={idx} className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm relative group cursor-pointer">
                              <img
                                src={`http://sair-cpa-api.duckdns.org${url}`}
                                alt={`Evidence ${idx + 1}`}
                                className="w-full h-auto object-contain max-h-64"
                                onClick={() => window.open(`http://sair-cpa-api.duckdns.org${url}`, '_blank')}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 flex flex-col items-center justify-center text-center">
                          <FileText className="w-12 h-12 text-gray-300 mb-3" />
                          <p className="text-gray-500 font-medium text-sm">No media attached.</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400 p-8 text-center">
                  Select a report from the list to view details
                </div>
              )}

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}