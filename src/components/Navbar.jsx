import { Search, Globe, Bell, Shield, Menu } from 'lucide-react';

export default function Navbar({ searchQuery, setSearchQuery, onMenuClick }) {
  const lang = "en";

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6 shrink-0 z-30 relative shadow-sm">

      {/* Menu Toggle (Mobile) */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 mr-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">

          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-[#1a4b7c] transition-colors" />
          </div>

          <input
            type="text"
            value={searchQuery || ""}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by License Plate or Report ID..."
            className="block w-full pl-10 pr-3 py-2.5 border-none bg-gray-50 rounded-xl text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all shadow-inner outline-none"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">

        <div className={`flex items-center gap-4 border-r pr-6`}>

          {/* Bell */}
          <button className="relative text-gray-400 hover:text-gray-600 transition-transform hover:scale-110 p-1">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Shield */}
          <button className="text-gray-400 hover:text-blue-600 p-1 transition-colors">
            <Shield className="w-5 h-5" />
          </button>

        </div>

        {/* Status */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="text-left">
            <div className="text-sm font-bold text-[#002855] group-hover:text-[#1a4b7c] transition-colors">
              Command Center
            </div>
            <div className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              SYSTEM ONLINE
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}