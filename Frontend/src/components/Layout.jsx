import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import CreateEventModal from './CreateEventModal';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar Component - Static on Desktop, Fixed on Mobile */}
      <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          onCreateClick={() => setIsCreateModalOpen(true)}
      />

      {/* Modal */}
      {isCreateModalOpen && (
        <CreateEventModal 
            isOpen={true} 
            onClose={() => setIsCreateModalOpen(false)}
            onEventCreate={() => {
                setIsCreateModalOpen(false);
                // Optionally trigger a refresh if we were on the dashboard, 
                // but since we are in layout, we might just let the user navigate
            }}
        />
      )}

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header / Hamburger */}
        <div className="md:hidden bg-white border-b border-gray-200 h-16 flex items-center px-4 ">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            <Menu size={24} />
          </button>
          <div className="ml-4 font-bold text-xl text-gray-800">Calendly</div>
        </div>

        {/* Main Scrolling Content */}
        <main className="flex-1 justify-center overflow-y-auto">
          <div className="  justify-center">
              <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
