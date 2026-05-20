import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Bell, Shield, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDemoReports } from "../data/reports";

const READ_NOTIFICATIONS_KEY = "sair-read-notifications";

export default function Navbar({ searchQuery, setSearchQuery, onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(READ_NOTIFICATIONS_KEY)) || [];
    } catch {
      return [];
    }
  });

  const notificationRef = useRef(null);

  const reports = getDemoReports();

  const criticalReport = reports.find(
    (report) => report.priority === "critical" || report.priority === "high",
  );

  const pendingCount = reports.filter(
    (report) => report.status === "pending" || report.status === "under_review",
  ).length;

  const resolvedCount = reports.filter(
    (report) => report.status === "resolved",
  ).length;

  const updatedUnit = reports.find(
    (report) => report.assignedUnit && report.assignedUnit !== "Unassigned",
  );

  const notifications = useMemo(
    () => [
      {
        id: criticalReport?.id
          ? `critical-${criticalReport.id}`
          : "critical-demo",
        title: criticalReport
          ? `${criticalReport.priority} report submitted`
          : "Critical report submitted",
        meta: criticalReport?.locationName || "Demo operations desk",
        badge: criticalReport?.priority || "critical",
        tone: "bg-red-50 text-[#D64545] border-red-100",
        query:
          criticalReport?.id ||
          criticalReport?.locationName ||
          criticalReport?.priority ||
          "critical",
      },
      {
        id: "pending-review",
        title: `${pendingCount} pending reports need review`,
        meta: "Workflow queue",
        badge: "pending",
        tone: "bg-amber-50 text-[#9A650D] border-amber-100",
        query: "pending",
      },
      {
        id: updatedUnit?.id ? `unit-${updatedUnit.id}` : "unit-assignment",
        title: "Unit assignment updated",
        meta: updatedUnit
          ? `${updatedUnit.assignedUnit} • ${updatedUnit.id}`
          : "Demo assignment log",
        badge: "unit",
        tone: "bg-blue-50 text-[#2563EB] border-blue-100",
        query: updatedUnit?.assignedUnit || updatedUnit?.id || "unit",
      },
      {
        id: "resolved-summary",
        title: "Resolved report summary",
        meta: `${resolvedCount} resolved fictional reports`,
        badge: "resolved",
        tone: "bg-emerald-50 text-[#3BAE75] border-emerald-100",
        query: "resolved",
      },
    ],
    [criticalReport, pendingCount, resolvedCount, updatedUnit],
  );

  const unreadCount = notifications.filter(
    (item) => !readNotifications.includes(item.id),
  ).length;

  const persistRead = (nextRead) => {
    setReadNotifications(nextRead);
    localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(nextRead));
  };

  const markAllAsRead = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    persistRead(notifications.map((item) => item.id));
  };

  const openNotification = (event, item) => {
    event.preventDefault();
    event.stopPropagation();

    const nextRead = Array.from(new Set([...readNotifications, item.id]));
    persistRead(nextRead);

    const query = encodeURIComponent(item.query || item.title);

    setNotificationsOpen(false);
    navigate(`/reports?search=${query}`);
  };

  const submitSearch = (event) => {
    if (event.key !== "Enter") return;

    const query = String(searchQuery || "").trim();

    if (!query) return;

    navigate(`/reports?search=${encodeURIComponent(query)}`);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white border-b border-[#D8E0EA] h-16 flex items-center justify-between px-4 lg:px-6 shrink-0 z-30 relative shadow-sm">
      <button
        type="button"
        onClick={onMenuClick}
        className="lg:hidden p-2 mr-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Open sidebar"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-[#1a4b7c] transition-colors" />
          </div>

          <input
            type="text"
            value={searchQuery || ""}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={submitSearch}
            placeholder="Search report ID, location, priority, unit..."
            className="block w-full pl-10 pr-3 py-2.5 border-none bg-gray-50 rounded-xl text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all shadow-inner outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 border-r pr-6">
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              title="Notifications"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setNotificationsOpen((open) => !open);
              }}
              className="relative text-[#64748B] hover:text-[#102033] transition-transform hover:scale-110 p-1"
            >
              <Bell className="w-5 h-5" />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-[#D64545] text-white rounded-full border-2 border-white text-[9px] leading-3 font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div
                className="absolute right-0 top-9 w-80 bg-white border border-[#D8E0EA] rounded-2xl shadow-2xl p-3 z-[9999]"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                  <div>
                    <h2 className="text-sm font-bold text-[#102033] m-0">
                      Notifications
                    </h2>
                    <p className="text-[10px] font-bold uppercase text-[#64748B] mt-0.5">
                      Demo feed
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-[10px] font-bold uppercase text-[#2563EB] hover:text-[#102033] bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="space-y-2">
                  {notifications.map((item) => {
                    const isRead = readNotifications.includes(item.id);

                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={(event) => openNotification(event, item)}
                        className={`w-full p-3 rounded-xl border text-left transition-all hover:-translate-y-0.5 hover:shadow-sm ${
                          isRead
                            ? "bg-white border-slate-100"
                            : "bg-[#F4F7FB] border-blue-100"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#1E293B] leading-snug">
                              {item.title}
                            </p>
                            <p className="text-xs text-[#64748B] mt-1">
                              {item.meta}
                            </p>
                            <p className="text-[10px] font-bold uppercase text-[#64748B] mt-2">
                              Click to view related reports
                            </p>
                          </div>

                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md border shrink-0 ${item.tone}`}
                          >
                            {item.badge}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            title="Admin profile"
            aria-label="Admin profile"
            onClick={() => navigate("/profile")}
            className="text-[#64748B] hover:text-[#2563EB] p-1 transition-colors"
          >
            <Shield className="w-5 h-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="flex items-center gap-3 group cursor-pointer text-left"
          aria-label="Open profile"
        >
          <div>
            <div className="text-sm font-bold text-[#002855] group-hover:text-[#1a4b7c] transition-colors">
              Command Center
            </div>
            <div className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM ONLINE
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}
