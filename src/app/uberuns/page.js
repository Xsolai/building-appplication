"use client";
import { useState, useEffect } from 'react';
import UberUns from "@/components/AppbarItems/UbernUns";
import AppBar from '@/components/common/AppBar';
import Sidebar from '@/components/common/SideBar';
import { Menu } from 'lucide-react';

export default function Uberuns() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); 

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // Adjust breakpoint as needed
      setSidebarOpen(window.innerWidth >= 768);
      setIsLoaded(true); 
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }}
    if (!isLoaded) {
      return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }
  
  

  // useEffect(() => {
  //   const handleResize = () => {
  //     setIsMobile(window.innerWidth < 768);
  //   };

  //   // Set initial value
  //   handleResize();

  //   // Add event listener
  //   window.addEventListener('resize', handleResize);

  //   // Clean up
  //   return () => window.removeEventListener('resize', handleResize);
  // }, []);

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
        <UberUns isMobile={isMobile} />
      </div>
    </div>
  );
  }
//     <div className="uberuns">
//       <UberUns isMobile={isMobile} />
//     </div>
//   );
// }