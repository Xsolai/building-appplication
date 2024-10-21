"use client"
import { useState, useEffect } from 'react';
import AppBar from "@/components/common/AppBar";
import Sidebar from "@/components/common/SideBar2";
import { Folder, File, ChevronRight, MoreVertical, Plus , Menu } from 'lucide-react';
import Link from 'next/link';

const ProjectCard = ({ title, status }) => (
  <div className="flex flex-col">
    <div className="bg-gray-100 w-full aspect-square"></div>
    <p className="text-sm text-gray-700 mt-2">{title}</p>
    <p className="text-xs text-gray-500 mt-1">{status}</p>
  </div>
);

 function OrdnerStruktur() {
  const [hoveredItem, setHoveredItem] = useState(null);

  const ordner = [
    {
      id: 1,
      name: 'Dokumente',
      type: 'folder',
      items: 23,
      updated: 'vor 2 Tagen'
    },
    {
      id: 2,
      name: 'Bilder',
      type: 'folder',
      items: 145,
      updated: 'vor 5 Stunden'
    },
    {
      id: 3,
      name: 'Projekte',
      type: 'folder',
      items: 12,
      updated: 'vor 1 Woche'
    },
    {
      id: 4,
      name: 'präsentation.pdf',
      type: 'file',
      size: '2,4 MB',
      updated: 'Gerade eben'
    },
    {
      id: 5,
      name: 'budget_2024.xlsx',
      type: 'file',
      size: '1,8 MB',
      updated: 'vor 3 Tagen'
    },
    {
      id: 6,
      name: 'Archiv',
      type: 'folder',
      items: 47,
      updated: 'vor 1 Monat'
    }
  ];

  return (
    <div className="flex flex-col space-y-6 p-6">
      {/* Kopfzeile */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Ordner</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={18} />
          <span>Neu</span>
        </button>
      </div>

      {/* Schnellzugriff */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-xl border border-gray-100">
          <p className="text-sm text-gray-600">Kürzliche Dateien</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">128</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-xl border border-gray-100">
          <p className="text-sm text-gray-600">Gesamtspeicher</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">64,2 GB</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-gray-100">
          <p className="text-sm text-gray-600">Geteilte Dateien</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">24</p>
        </div>
      </div>

      {/* Ordner-Raster */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ordner.map((item) => (
          <div
            key={item.id}
            className="relative group bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 cursor-pointer"
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {item.type === 'folder' ? (
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Folder className="w-6 h-6 text-blue-600" />
                  </div>
                ) : (
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <File className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">
                    {item.type === 'folder' ? `${item.items} Elemente` : item.size}
                  </p>
                </div>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-5 h-5 text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            
            <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
              <span>Aktualisiert {item.updated}</span>
              {hoveredItem === item.id && (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [activeStatus, setActiveStatus] = useState('all');

  useEffect(() => {
    const checkScreenSize = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);
      setSidebarOpen(!newIsMobile);
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

  const handleStatusChange = (status) => {
    setActiveStatus(status);
    setActiveSection('projects');
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    if (section === 'home') {
      setActiveStatus('all');
    }
  };

  const projects = [
    { title: "Project Kindergarten", status: "inBearbeitung" },
    { title: "Project Feuerwehr", status: "genehmigt" },
    { title: "Project Schule", status: "inBearbeitung" },
    { title: "Project Grundschule", status: "abgelehnt" },
    { title: "Project Kindergarten 2", status: "genehmigt" },
    { title: "Project XYZ", status: "inBearbeitung" }
  ];

  const filteredProjects = activeStatus === 'all' 
    ? projects 
    : projects.filter(project => project.status === activeStatus);

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return (
          <div className="flex-1 p-6 overflow-auto">
            <div className='flex justify-between '>
            <h2 className="text-xl font-bold text-black mb-6">Alle Projekte</h2>
            <Link href="/dashboard/create-project">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-3xl flex items-center">
                Neues Projekt
              </button>
            </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-4xl">
              {projects.map((project, index) => (
                <ProjectCard key={index} title={project.title} status={project.status} />
              ))}
            </div>
          </div>
        );
      case 'folder':
        return (
          <OrdnerStruktur/>
        );
      case 'projects':
        return (
          <div className="flex-1 p-6 overflow-auto">
            <h2 className="text-xl font-bold text-black mb-6">
              {activeStatus === 'inBearbeitung' ? 'In Bearbeitung' :
               activeStatus === 'genehmigt' ? 'Genehmigt' : 'Abgelehnt'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-4xl">
              {filteredProjects.map((project, index) => (
                <ProjectCard key={index} title={project.title} status={project.status} />
              ))}
            </div>
          </div>
        );
    
    }
  };

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
     
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar} 
        isMobile={isMobile} 
        onStatusChange={handleStatusChange}
        onSectionChange={handleSectionChange}
      />
     
      <div
        className={`flex-1 flex flex-col ${isMobile ? 'w-full mt-28' : (sidebarOpen ? 'ml-64 mt-16' : 'ml-0')}`}
        onClick={closeSidebar}
      >
        <AppBar />
        {renderContent()}
      </div>
    </div>
  );
}