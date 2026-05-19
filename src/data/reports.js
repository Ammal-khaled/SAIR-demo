import api from "../api/client";
import mockReports from "./mockReports";
import { isDemoMode } from "../utils/demoAuth";

export const DEMO_REPORTS_KEY = "sair-demo-reports";

export const reportStatuses = [
  "pending",
  "under_review",
  "approved",
  "rejected",
  "resolved",
];

export const assignedUnits = [
  "Unassigned",
  "Traffic Patrol A",
  "Traffic Patrol B",
  "Civil Defense Unit",
  "Investigation Team",
];

const statusLabels = {
  pending: "Report submitted for review",
  under_review: "Marked under review",
  approved: "Approved by demo administrator",
  rejected: "Rejected by demo administrator",
  resolved: "Marked resolved",
};

const makeTimeline = (report) => {
  if (Array.isArray(report.timeline) && report.timeline.length > 0) {
    return report.timeline;
  }

  return [
    {
      at: report.createdAt,
      label: "Report created",
      note: "Fictional accident report entered into SAIR Demo.",
    },
    {
      at: report.createdAt,
      label: statusLabels[report.status] || "Status recorded",
      note: `Current status: ${report.status || "pending"}.`,
    },
  ];
};

export const normalizeReport = (report) => ({
  ...report,
  title: report.title || report.accidentType || report.type || `Report ${report.id}`,
  status: report.status || "pending",
  priority: report.priority || (report.urgent ? "high" : "medium"),
  accidentType: report.accidentType || report.type || "Traffic incident",
  locationName: report.locationName || report.locationSource || "Amman, Jordan",
  latitude: Number(report.latitude ?? report.lat),
  longitude: Number(report.longitude ?? report.lng),
  lat: Number(report.latitude ?? report.lat),
  lng: Number(report.longitude ?? report.lng),
  reporterName: report.reporterName || report.partyName || report.driver || "Demo Reporter",
  assignedUnit: report.assignedUnit || report.officer || "Unassigned",
  mediaCount: Number(report.mediaCount ?? report.mediaUrls?.length ?? 0),
  occurredAt: report.occurredAt || report.createdAt,
  timeline: makeTimeline(report),
});

export const getMockReports = () => mockReports.map(normalizeReport);

export const getStoredDemoReports = () => {
  try {
    const stored = localStorage.getItem(DEMO_REPORTS_KEY);
    if (!stored) return null;
    const reports = JSON.parse(stored);
    return Array.isArray(reports) ? reports.map(normalizeReport) : null;
  } catch {
    localStorage.removeItem(DEMO_REPORTS_KEY);
    return null;
  }
};

export const getDemoReports = () => getStoredDemoReports() || getMockReports();

export const saveDemoReports = (reports) => {
  const normalized = reports.map(normalizeReport);
  localStorage.setItem(DEMO_REPORTS_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event("sair-demo-reports-updated"));
  return normalized;
};

export const updateDemoReport = (id, changes, note) => {
  const timestamp = new Date().toISOString();
  const reports = getDemoReports().map((report) => {
    if (report.id !== id) return report;

    const timelineEntry = {
      at: timestamp,
      label: changes.status
        ? statusLabels[changes.status] || "Status updated"
        : changes.assignedUnit
          ? "Assigned unit updated"
          : "Report updated",
      note: note || "Updated in local portfolio demo mode.",
    };

    return normalizeReport({
      ...report,
      ...changes,
      timeline: [...(report.timeline || []), timelineEntry],
    });
  });

  return saveDemoReports(reports);
};

export const resetDemoReports = () => {
  localStorage.removeItem(DEMO_REPORTS_KEY);
  window.dispatchEvent(new Event("sair-demo-reports-updated"));
  return getMockReports();
};

export const fetchReportsWithFallback = async () => {
  const token = localStorage.getItem("token");

  if (isDemoMode() || !token || token === "undefined" || token === "null") {
    return { reports: getDemoReports(), source: "mock" };
  }

  try {
    const res = await api.get("/reports");
    const data = Array.isArray(res.data) ? res.data : [];
    return { reports: data.map(normalizeReport), source: "api" };
  } catch (error) {
    console.warn("Using fictional demo reports because the API is unavailable.", error);
    return { reports: getDemoReports(), source: "mock" };
  }
};
