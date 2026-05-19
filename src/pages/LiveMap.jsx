import { useState, useEffect, useMemo } from 'react';
import {
  X,
  Clock,
  Car,
  User
} from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

import { fetchReportsWithFallback } from "../data/reports";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const globalStyles = `
  @keyframes pulse-red {
    0% { transform: scale(1); opacity: 1; }
    70% { transform: scale(2.5); opacity: 0; }
    100% { transform: scale(1); opacity: 0; }
  }

  .animate-pulse-red {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #ef4444;
    animation: pulse-red 2s infinite;
  }
`;

const createIcon = (urgent, clusterCount) => {
  const color = urgent ? '#ef4444' : '#3b82f6';
  const html = `
    <div style="position: relative;">
      <div style="width: 20px; height: 20px; background-color: ${color}; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>
      ${clusterCount > 1 ? `<div style="position: absolute; top: -8px; right: -8px; background: black; color: white; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 10px;">${clusterCount}</div>` : ''}
    </div>
  `;
  return new L.DivIcon({
    html,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const clusterIncidents = (incidents, precision = 2) => {
  const clusters = {};

  incidents.forEach((inc) => {
    const key = `${inc.lat?.toFixed(precision)}-${inc.lng?.toFixed(precision)}`;

    if (!clusters[key]) {
      clusters[key] = {
        ...inc,
        cluster: [inc]
      };
    } else {
      clusters[key].cluster.push(inc);
      if (inc.urgent) clusters[key].urgent = true;
    }
  });

  return Object.values(clusters);
};

export default function LiveMap() {
  const [incidents, setIncidents] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState('map');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dataSource, setDataSource] = useState("api");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    let interval;

    const fetchReports = async () => {
      const { reports, source } = await fetchReportsWithFallback();
      setDataSource(source);

      const mapped = reports
        .filter(r => r.lat && r.lng)
        .map((r) => ({
          id: r.id,
          title: r.title,
          type: r.accidentType,
          time: r.createdAt ? new Date(r.createdAt).toLocaleString() : `${r.date} ${r.time}`,
          status: r.status,
          priority: r.priority,
          urgent: r.priority === "critical" || r.priority === "high" || r.status === "pending",
          plate: r.platesNumber?.[0] || "",
          statement: r.description,
          mediaUrl: r.mediaUrls?.[0] ? `http://sair-cpa-api.duckdns.org${r.mediaUrls[0]}` : null,
          locationSource: r.locationName,
          occurredAt: r.occurredAt ? new Date(r.occurredAt).toLocaleString() : `${r.date} ${r.time}`,
          lat: r.lat,
          lng: r.lng,
        }));

      setIncidents(mapped);
    };

    fetchReports();

    if (dataSource !== "mock") {
      interval = setInterval(fetchReports, 10000);
    }

    window.addEventListener("sair-demo-reports-updated", fetchReports);

    return () => {
      clearInterval(interval);
      window.removeEventListener("sair-demo-reports-updated", fetchReports);
    };
  }, [dataSource]);

  useEffect(() => {
    if (selectedPin && !incidents.some((incident) => incident.id === selectedPin.id)) {
      setSelectedPin(null);
    }
  }, [incidents, selectedPin]);

  const accidentTypes = useMemo(
    () => [...new Set(incidents.map(incident => incident.type).filter(Boolean))],
    [incidents]
  );

  const filteredIncidents = incidents.filter((inc) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      String(inc.id ?? "").toLowerCase().includes(query) ||
      String(inc.title ?? "").toLowerCase().includes(query) ||
      String(inc.locationSource ?? "").toLowerCase().includes(query) ||
      String(inc.plate ?? "").toLowerCase().includes(query);

    const matchesStatus = statusFilter === "all" || inc.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || inc.priority === priorityFilter;
    const matchesType = typeFilter === "all" || inc.type === typeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const clusters = clusterIncidents(filteredIncidents);
  const mapCenter = clusters.length > 0 ? [clusters[0].lat, clusters[0].lng] : [31.95, 35.91];

  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden">
      <style>{globalStyles}</style>

      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 relative overflow-hidden bg-gray-200">
          <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur p-3 lg:p-4 rounded-xl shadow-lg border border-white/20 w-[calc(100%-2rem)] sm:w-[360px]">
            <h2 className="font-bold text-sm lg:text-base">Live Incidents</h2>
            <p className="text-[10px] lg:text-sm text-gray-500 font-medium">
              Total: {filteredIncidents.length} • Urgent: {filteredIncidents.filter(i => i.urgent).length}
            </p>
            <p className="text-[10px] text-emerald-700 font-bold uppercase mt-1">
              {dataSource === "mock" ? "Portfolio demo markers" : "API markers"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[#F4F7FB] rounded-lg px-2 py-2 text-xs font-bold outline-none border border-slate-100">
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="resolved">Resolved</option>
              </select>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="bg-[#F4F7FB] rounded-lg px-2 py-2 text-xs font-bold outline-none border border-slate-100">
                <option value="all">All priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-[#F4F7FB] rounded-lg px-2 py-2 text-xs font-bold outline-none border border-slate-100">
                <option value="all">All types</option>
                {accidentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative w-full h-full z-0">
            <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />

              {clusters.map((c) => (
                <Marker
                  key={c.id}
                  position={[c.lat, c.lng]}
                  icon={createIcon(c.urgent, c.cluster.length)}
                  eventHandlers={{
                    click: () => setSelectedPin(c),
                  }}
                />
              ))}
            </MapContainer>
          </div>

          {selectedPin && (
            <div className="absolute right-4 lg:right-6 top-20 lg:top-24 bg-white shadow-2xl rounded-2xl p-4 lg:p-5 w-[calc(100%-2rem)] sm:w-80 z-30 animate-slide-up">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">{selectedPin.title || `Incident #${selectedPin.id.slice(-6)}`}</h3>
                  <p className="text-xs text-gray-500">{selectedPin.locationSource}</p>
                </div>
                <button onClick={() => setSelectedPin(null)} className="p-1 hover:bg-gray-100 rounded-md">
                  <X size={16} className="text-gray-500" />
                </button>
              </div>

              {selectedPin.mediaUrl && (
                <div className="mt-3 w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                  <img src={selectedPin.mediaUrl} alt="Incident" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Type</span>
                  <span className="font-bold text-gray-800">{selectedPin.type}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Priority</span>
                  <span className="font-bold text-gray-800 uppercase">{selectedPin.priority}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500"><Clock size={14} className="inline mr-1" /> Time</span>
                  <span className="font-medium text-gray-800">{selectedPin.occurredAt || selectedPin.time}</span>
                </div>
                {selectedPin.plate && (
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500"><Car size={14} className="inline mr-1" /> Plate</span>
                    <span className="font-bold text-[#1a4b7c]">{selectedPin.plate}</span>
                  </div>
                )}
                <div className="pt-1">
                  <span className="text-gray-500 block mb-1"><User size={14} className="inline mr-1" /> Statement</span>
                  <p className="bg-gray-50 p-2 rounded-lg text-gray-700 italic border border-gray-100">{selectedPin.statement || "No statement provided."}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${
                  selectedPin.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                  selectedPin.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                  selectedPin.status === 'under_review' ? 'bg-yellow-100 text-yellow-700' :
                  selectedPin.status === 'approved' ? 'bg-indigo-100 text-indigo-700' :
                  selectedPin.status === 'verified' ? 'bg-indigo-100 text-indigo-700' :
                  selectedPin.status === 'in_progress' ? 'bg-orange-100 text-orange-700' :
                  selectedPin.status === 'resolved' ? 'bg-green-100 text-green-700' :
                  selectedPin.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {selectedPin.status}
                </span>
                <span className="text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                  {selectedPin.locationSource}
                </span>
                {selectedPin.cluster.length > 1 && (
                  <span className="text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider bg-slate-800 text-white">
                    {selectedPin.cluster.length} Nearby
                  </span>
                )}
              </div>

              <div className="mt-4">
                <a
                  href={`https://www.google.com/maps?q=${selectedPin.lat},${selectedPin.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-2 bg-blue-50 text-blue-700 font-bold text-sm rounded-lg hover:bg-blue-100 transition-colors"
                >
                  View on Google Maps
                </a>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
