import { useState, useEffect, useMemo } from "react";
import { Search, Filter, Download, Eye, FileText, Clock } from "lucide-react";
import { fetchReportsWithFallback } from "../data/reports";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const Badge = ({ children, variant = 'gray' }) => {
  const variants = {
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-100 text-blue-700',
    red: 'bg-red-100 text-red-700',
    green: 'bg-emerald-100 text-emerald-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    orange: 'bg-orange-100 text-orange-700',
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase ${variants[variant]}`}>
      {children}
    </span>
  );
};

export default function ApprovedReports() {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentView, setCurrentView] = useState("reports");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dataSource, setDataSource] = useState("api");

  useEffect(() => {
    const fetchLogs = async () => {
      const { reports: loadedReports, source } = await fetchReportsWithFallback();
      setReports(loadedReports);
      setDataSource(source);
    };

    fetchLogs();
  }, []);

  const getStatusVariant = (status) => {
    if (status === 'resolved') return 'green';
    if (status === 'approved') return 'indigo';
    if (status === 'rejected') return 'red';
    if (status === 'submitted' || status === 'pending') return 'blue';
    if (status === 'critical') return 'orange';
    return 'gray';
  };

  const types = useMemo(
    () => [...new Set(reports.map(report => report.accidentType).filter(Boolean))],
    [reports]
  );

  const filteredReports = reports.filter((report) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      String(report.id ?? "").toLowerCase().includes(q) ||
      String(report.title ?? "").toLowerCase().includes(q) ||
      String(report.locationName ?? "").toLowerCase().includes(q);

    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || report.priority === priorityFilter;
    const matchesType = typeFilter === "all" || report.accidentType === typeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
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
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1 tracking-tight">System Reports</h1>
              <p className="text-xs lg:text-sm text-gray-500 font-medium">
                Review accident reports and map-linked case records. {dataSource === "mock" ? "Fictional accident reports shown in portfolio demo mode." : ""}
              </p>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all active:scale-95">
                <Filter className="w-4 h-4 text-gray-400" /> Filters
              </button>

              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#1a4b7c] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#133b63] transition-all active:scale-95">
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-[24px] shadow-sm overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="p-4 lg:p-5 border-b border-gray-100 flex flex-col gap-4 bg-white">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-80 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1a4b7c] transition-colors" />
                  <input
                    type="text"
                    placeholder="Search by title, ID, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  />
                </div>

                <div className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {filteredReports.length} Records Found
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-gray-50 rounded-xl px-3 py-2 text-sm font-medium outline-none">
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="bg-gray-50 rounded-xl px-3 py-2 text-sm font-medium outline-none">
                  <option value="all">All priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>

                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-gray-50 rounded-xl px-3 py-2 text-sm font-medium outline-none">
                  <option value="all">All accident types</option>
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Report</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date & Time</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Priority</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-gray-900 block">{report.title}</span>
                            <span className="text-xs text-gray-400">{report.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        <Clock className="w-3.5 h-3.5 inline mr-2 text-gray-400" />
                        {report.date} {report.time}
                      </td>

                      <td className="px-6 py-4 text-sm font-bold text-gray-800">
                        {report.locationName}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {report.accidentType}
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant={report.priority === "critical" ? "orange" : report.priority === "high" ? "red" : "gray"}>
                          {report.priority}
                        </Badge>
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant={getStatusVariant(report.status)}>
                          {report.status}
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
