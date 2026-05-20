import { useState, useEffect, useMemo } from "react";
import { Search, Eye, FileText, Clock, X, CheckCircle, AlertCircle, ShieldCheck } from "lucide-react";
import { assignedUnits, fetchReportsWithFallback, reportStatuses, updateDemoReport } from "../data/reports";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const statusVariant = {
  pending: "bg-blue-50 text-[#3D7BFF] border-blue-100",
  under_review: "bg-amber-50 text-[#9A650D] border-amber-100",
  approved: "bg-indigo-50 text-indigo-700 border-indigo-100",
  rejected: "bg-red-50 text-[#D64545] border-red-100",
  resolved: "bg-emerald-50 text-[#3BAE75] border-emerald-100",
};

const priorityVariant = {
  low: "bg-slate-50 text-slate-600 border-slate-100",
  medium: "bg-blue-50 text-[#3D7BFF] border-blue-100",
  high: "bg-amber-50 text-[#9A650D] border-amber-100",
  critical: "bg-red-50 text-[#D64545] border-red-100",
};

const Badge = ({ children, className = "" }) => (
  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase border ${className}`}>
    {children}
  </span>
);

const formatStatus = (status) => String(status || "").replace("_", " ");

const ActionButton = ({ children, onClick, tone = "navy", disabled }) => {
  const tones = {
    navy: "bg-[#102033] text-white hover:bg-[#1f334a]",
    amber: "bg-[#F2A93B] text-[#102033] hover:bg-[#e29b2f]",
    green: "bg-[#3BAE75] text-white hover:bg-[#329666]",
    red: "bg-[#D64545] text-white hover:bg-[#bf3636]",
    ghost: "bg-white text-[#102033] border border-slate-200 hover:bg-slate-50",
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${tones[tone]}`}
    >
      {children}
    </button>
  );
};

export default function ApprovedReports() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [unitFilter, setUnitFilter] = useState("all");
  const [currentView, setCurrentView] = useState("reports");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dataSource, setDataSource] = useState("api");

  const loadReports = async () => {
    const { reports: loadedReports, source } = await fetchReportsWithFallback();
    setReports(loadedReports);
    setDataSource(source);
    setSelectedReport(prev => prev ? loadedReports.find(report => report.id === prev.id) || null : null);
  };

  useEffect(() => {
    loadReports();
    window.addEventListener("sair-demo-reports-updated", loadReports);

    return () => window.removeEventListener("sair-demo-reports-updated", loadReports);
  }, []);

  const accidentTypes = useMemo(
    () => [...new Set(reports.map(report => report.accidentType).filter(Boolean))],
    [reports]
  );

  const filteredReports = reports.filter((report) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      String(report.id ?? "").toLowerCase().includes(q) ||
      String(report.title ?? "").toLowerCase().includes(q) ||
      String(report.locationName ?? "").toLowerCase().includes(q) ||
      String(report.reporterName ?? "").toLowerCase().includes(q);

    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || report.priority === priorityFilter;
    const matchesType = typeFilter === "all" || report.accidentType === typeFilter;
    const matchesUnit = unitFilter === "all" || report.assignedUnit === unitFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesUnit;
  });

  const applyReportChange = (reportId, changes, note) => {
    if (dataSource === "mock") {
      const updatedReports = updateDemoReport(reportId, changes, note);
      setReports(updatedReports);
      setSelectedReport(updatedReports.find(report => report.id === reportId) || null);
      return;
    }

    setReports(prev => prev.map(report => report.id === reportId ? { ...report, ...changes } : report));
    setSelectedReport(prev => prev?.id === reportId ? { ...prev, ...changes } : prev);
  };

  const changeStatus = (report, status) => {
    applyReportChange(report.id, { status }, `Demo administrator changed status to ${formatStatus(status)}.`);
  };

  const changeAssignedUnit = (report, assignedUnit) => {
    applyReportChange(report.id, { assignedUnit }, `Assigned unit changed to ${assignedUnit}.`);
  };

  const renderActions = (report) => (
    <div className="flex flex-wrap gap-2">
      <ActionButton tone="amber" disabled={report.status === "under_review"} onClick={() => changeStatus(report, "under_review")}>
        Mark Under Review
      </ActionButton>
      <ActionButton tone="navy" disabled={report.status === "approved"} onClick={() => changeStatus(report, "approved")}>
        Approve
      </ActionButton>
      <ActionButton tone="red" disabled={report.status === "rejected"} onClick={() => changeStatus(report, "rejected")}>
        Reject
      </ActionButton>
      <ActionButton tone="green" disabled={report.status === "resolved"} onClick={() => changeStatus(report, "resolved")}>
        Mark Resolved
      </ActionButton>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F7FB] font-sans text-[#1E293B]" dir="ltr">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar
          searchQuery={searchTerm}
          setSearchQuery={setSearchTerm}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-[#102033] mb-1 tracking-tight">System Reports</h1>
              <p className="text-xs lg:text-sm text-[#64748B] font-medium">
                Admin review workflow for fictional accident reports. {dataSource === "mock" ? "Demo mode is using local data." : ""}
              </p>
            </div>
            <div className="text-[10px] font-bold text-[#3BAE75] bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg uppercase">
              Portfolio demo
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 lg:p-5 border-b border-slate-100 flex flex-col gap-4 bg-white">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-96 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] group-focus-within:text-[#3D7BFF] transition-colors" />
                  <input
                    type="text"
                    placeholder="Search title, location, reporter, or report ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7FB] border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div className="text-[10px] lg:text-xs font-bold text-[#64748B] uppercase tracking-widest">
                  {filteredReports.length} Records Found
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[#F4F7FB] rounded-xl px-3 py-2 text-sm font-medium outline-none border border-slate-100">
                  <option value="all">All statuses</option>
                  {reportStatuses.map(status => (
                    <option key={status} value={status}>{formatStatus(status)}</option>
                  ))}
                </select>

                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="bg-[#F4F7FB] rounded-xl px-3 py-2 text-sm font-medium outline-none border border-slate-100">
                  <option value="all">All priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>

                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-[#F4F7FB] rounded-xl px-3 py-2 text-sm font-medium outline-none border border-slate-100">
                  <option value="all">All accident types</option>
                  {accidentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                <select value={unitFilter} onChange={(e) => setUnitFilter(e.target.value)} className="bg-[#F4F7FB] rounded-xl px-3 py-2 text-sm font-medium outline-none border border-slate-100">
                  <option value="all">All assigned units</option>
                  {assignedUnits.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F4F7FB] border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Report</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Date & Time</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Location</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Unit</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Priority</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredReports.map((report) => (
                    <tr key={report.id} onClick={() => setSelectedReport(report)} className="hover:bg-blue-50/30 transition-colors cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-[#3D7BFF] rounded-lg">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-[#102033] block">{report.title}</span>
                            <span className="text-xs text-[#64748B]">{report.id} • {report.accidentType}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-[#64748B] font-medium">
                        <Clock className="w-3.5 h-3.5 inline mr-2 text-[#64748B]" />
                        {report.date} {report.time}
                      </td>

                      <td className="px-6 py-4 text-sm font-bold text-[#1E293B]">
                        {report.locationName}
                      </td>

                      <td className="px-6 py-4 text-sm text-[#64748B]">
                        {report.assignedUnit}
                      </td>

                      <td className="px-6 py-4">
                        <Badge className={priorityVariant[report.priority] || priorityVariant.medium}>
                          {report.priority}
                        </Badge>
                      </td>

                      <td className="px-6 py-4">
                        <Badge className={statusVariant[report.status] || statusVariant.pending}>
                          {formatStatus(report.status)}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedReport(report);
                          }}
                          className="inline-flex items-center gap-2 px-3 py-2 text-[#102033] hover:bg-slate-100 rounded-lg transition-colors text-xs font-bold"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
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

      {selectedReport && (
        <div className="fixed inset-0 bg-[#102033]/60 z-[80] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge className={statusVariant[selectedReport.status] || statusVariant.pending}>{formatStatus(selectedReport.status)}</Badge>
                  <Badge className={priorityVariant[selectedReport.priority] || priorityVariant.medium}>{selectedReport.priority}</Badge>
                </div>
                <h2 className="text-xl font-bold text-[#102033]">{selectedReport.title}</h2>
                <p className="text-sm text-[#64748B]">{selectedReport.id}</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    ["Report ID", selectedReport.id],
                    ["Accident type", selectedReport.accidentType],
                    ["Location", selectedReport.locationName],
                    ["Date and time", `${selectedReport.date} ${selectedReport.time}`],
                    ["Reporter", selectedReport.reporterName],
                    ["Media count", selectedReport.mediaCount],
                    ["Assigned unit", selectedReport.assignedUnit],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-[#F4F7FB] border border-slate-100 rounded-xl p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] mb-1">{label}</p>
                      <p className="text-sm font-bold text-[#1E293B]">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-[#F4F7FB] border border-slate-100 rounded-xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] mb-2">Description</p>
                  <p className="text-sm leading-relaxed text-[#1E293B]">{selectedReport.description}</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-4 h-4 text-[#3D7BFF]" />
                    <h3 className="text-sm font-bold text-[#102033]">Workflow Actions</h3>
                  </div>
                  {renderActions(selectedReport)}
                </div>
              </div>

              <div className="space-y-5">
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#64748B] mb-2">
                    Assigned Unit
                  </label>
                  <select
                    value={selectedReport.assignedUnit}
                    onChange={(event) => changeAssignedUnit(selectedReport, event.target.value)}
                    className="w-full bg-[#F4F7FB] rounded-xl px-3 py-2 text-sm font-medium outline-none border border-slate-100"
                  >
                    {assignedUnits.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-4 h-4 text-[#F2A93B]" />
                    <h3 className="text-sm font-bold text-[#102033]">Timeline</h3>
                  </div>
                  <div className="space-y-3">
                    {(selectedReport.timeline || []).map((item, index) => (
                      <div key={`${item.at}-${index}`} className="relative pl-4 border-l-2 border-slate-200">
                        <p className="text-xs font-bold text-[#102033]">{item.label}</p>
                        <p className="text-[11px] text-[#64748B]">{item.at ? new Date(item.at).toLocaleString() : "Demo timeline"}</p>
                        <p className="text-xs text-[#1E293B] mt-1">{item.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end">
              <ActionButton tone="ghost" onClick={() => setSelectedReport(null)}>
                Close
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
