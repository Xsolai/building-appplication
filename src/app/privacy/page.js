"use client";
import { useState, useEffect } from 'react';
import AppBar from '@/components/common/AppBar';
import Sidebar from '@/components/common/SideBar';
import { Menu } from 'lucide-react';
import PrivacyOptions from '@/components/Settings/Privacy';

export default function Privacy() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); // New state to track when the screen size is checked

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setSidebarOpen(window.innerWidth >= 768); // Sidebar should only open by default on desktop
      setIsLoaded(true); // Mark as loaded once screen size is checked
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Show loading until we determine the screen size
  if (!isLoaded) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-20 left-4 z-18 p-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
          style={{ display: sidebarOpen ? 'none' : 'block' }}
        >
          <Menu size={24} />
        </button>
      )}
      
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} isMobile={isMobile} />
      
      <div 
        className={`flex-1 flex flex-col ${isMobile ? 'w-full mt-28' : (sidebarOpen ? 'ml-64 mt-16' : 'ml-0')}`}
        onClick={closeSidebar}
      >
        <AppBar />
        <PrivacyOptions isMobile={isMobile} />
      </div>
    </div>
  );
}
