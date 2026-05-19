import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function AppLayout({ children, currentView, setCurrentView, searchQuery, setSearchQuery }) {
  return (
    <div className="flex h-screen w-full bg-[#f1f5f9]">
      
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
      />

      <div className="flex-1 flex flex-col min-w-0">
        
        <Navbar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />

        <div className="flex-1 overflow-hidden">
          {children}
        </div>

      </div>
    </div>
  );
}