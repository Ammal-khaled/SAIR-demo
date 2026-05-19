import { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Car,
  User
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

import api from "../api/client";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

// ---------------- Styles ----------------
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

// Marker Icons
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

// ---------------- clustering (LAT/LNG based) ----------------
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
      if (inc.urgent) clusters[key].urgent = true; // Mark cluster as urgent if any is urgent
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

  // ---------------- API + REALTIME ----------------
  useEffect(() => {
    let interval;

    const fetchReports = async () => {
      try {
        const res = await api.get("/reports");

        const mapped = res.data
          .filter(r => r.lat && r.lng)
          .map((r) => ({
            id: r.id,
            type: r.accidentType,
            time: new Date(r.createdAt).toLocaleString(),
            status: r.status,
            urgent: r.status === "submitted",
            plate: r.platesNumber?.[0] || "",
            statement: r.description,
            mediaUrl: r.mediaUrls?.[0] ? `http://sair-cpa-api.duckdns.org${r.mediaUrls[0]}` : null,
            locationSource: r.locationSource,
            occurredAt: new Date(r.occurredAt).toLocaleString(),

            // 🔥 REAL LOCATION
            lat: r.lat,
            lng: r.lng,
          }));

        setIncidents(mapped);

      } catch (err) {
        console.log(err?.response?.data || err);
      }
    };

    fetchReports();
    interval = setInterval(fetchReports, 10000);

    return () => clearInterval(interval);
  }, []);

  // ---------------- FILTER ----------------
  const filteredIncidents = incidents.filter((inc) =>
    String(inc.id ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(inc.plate ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clusters = clusterIncidents(filteredIncidents);

  // Map Center (default to Jordan area if no points, else center on first point)
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

          {/* TOP PANEL */}
          <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur p-3 lg:p-4 rounded-xl shadow-lg border border-white/20">
            <h2 className="font-bold text-sm lg:text-base">Live Incidents</h2>
            <p className="text-[10px] lg:text-sm text-gray-500 font-medium">
              Total: {filteredIncidents.length} • Urgent: {filteredIncidents.filter(i => i.urgent).length}
            </p>
          </div>

          {/* MAP AREA */}
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

          {/* POPUP OVERLAY (Custom UI) */}
          {selectedPin && (
            <div className="absolute right-4 lg:right-6 top-20 lg:top-24 bg-white shadow-2xl rounded-2xl p-4 lg:p-5 w-[calc(100%-2rem)] sm:w-80 z-30 animate-slide-up">

              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">Incident #{selectedPin.id.slice(-6)}</h3>
                  <p className="text-xs text-gray-500">{selectedPin.id}</p>
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
                  selectedPin.status === 'under_review' ? 'bg-yellow-100 text-yellow-700' :
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