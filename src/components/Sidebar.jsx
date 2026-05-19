import { useState, useEffect, useRef } from "react";
import { LayoutDashboard, FileText, User, MapPin } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

import Logo from "../components/ui/Logo";
import api from "../api/client";

export default function Sidebar({ lang = "en", isOpen, onClose }) {
  const [width, setWidth] = useState(256);
  const isResizing = useRef(false);

  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }
        const res = await api.get("/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const items = [
    { id: "dashboard", path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "map", path: "/map", icon: MapPin, label: "Live Map" },
    { id: "reports", path: "/reports", icon: FileText, label: "Reports" },
    { id: "profile", path: "/profile", icon: User, label: "Profile" },
  ];

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing.current) return;
      const newWidth = e.clientX;
      if (newWidth > 180 && newWidth < 400) {
        setWidth(newWidth);
      }
    };

    const stopResize = () => {
      isResizing.current = false;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResize);
    };
  }, []);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        style={{ width: `${width}px` }}
        className={`fixed lg:relative bg-white border-r border-gray-200 flex flex-col h-full shrink-0 z-50 shadow-sm transition-all duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* RESIZE HANDLE - Desktop only */}
        <div
          onMouseDown={() => {
            isResizing.current = true;
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
          }}
          className="hidden lg:block absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-200 transition-colors"
        />

        {/* Logo */}
        <div className="h-16 flex items-center justify-center px-6 border-b border-gray-100 bg-gray-50/30 cursor-pointer" onClick={() => {
          navigate('/dashboard');
          if (onClose) onClose();
        }}>
          <Logo className="scale-75 origin-center" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {items.map((i) => {
            const isActive = location.pathname.startsWith(i.path);
            const Icon = i.icon;

            return (
              <button
                key={i.id}
                onClick={() => {
                  navigate(i.path);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${isActive
                  ? "bg-[#1a4b7c] text-white shadow-lg"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <Icon className="w-5 h-5" />
                {i.label}
              </button>
            );
          })}
        </nav>

        {/* Profile */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3 flex-row-reverse">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm text-[#1a4b7c]">
                <User size={20} />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>

            <div className="text-left flex-1 truncate">
              <div className="text-sm font-bold text-gray-900 truncate">
                {loading ? "..." : (user?.fullName || user?.email || "Officer Ahmed")}
              </div>

              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5 truncate">
                {loading ? "..." : (user?.role || "Duty Manager")}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}