import api from "../api/client";
import mockReports from "./mockReports";
import { isDemoMode } from "../utils/demoAuth";

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
});

export const getMockReports = () => mockReports.map(normalizeReport);

export const fetchReportsWithFallback = async () => {
  const token = localStorage.getItem("token");

  if (isDemoMode() || !token || token === "undefined" || token === "null") {
    return { reports: getMockReports(), source: "mock" };
  }

  try {
    const res = await api.get("/reports");
    const data = Array.isArray(res.data) ? res.data : [];
    return { reports: data.map(normalizeReport), source: "api" };
  } catch (error) {
    console.warn("Using fictional demo reports because the API is unavailable.", error);
    return { reports: getMockReports(), source: "mock" };
  }
};
