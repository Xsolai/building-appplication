"use client"
import { useState, useEffect } from 'react';
import AppBar from "@/components/common/AppBar";
import Sidebar from "@/components/common/SideBar2";
import { Folder, File, ChevronRight, MoreVertical, FolderOpen, Plus, Clock, CheckCircle, XCircle, RefreshCw, Menu } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/common/ProtectedRoute';


function OrdnerStruktur() {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const ordner = [
    {
      id: 1,
      name: 'Dokumente',
      type: 'ordner',  // Changed from 'folder' to 'ordner'
      items: 23,
      updated: 'vor 2 Tagen'
    },
    {
      id: 2,
      name: 'Bilder',
      type: 'ordner',
      items: 145,
      updated: 'vor 5 Stunden'
    },
    {
      id: 3,
      name: 'Projekte',
      type: 'ordner',
      items: 12,
      updated: 'vor 1 Woche'
    },
    {
      id: 4,
      name: 'präsentation.pdf',
      type: 'datei',  // Changed from 'file' to 'datei'
      size: '2,4 MB',
      updated: 'Gerade eben'
    },
    {
      id: 5,
      name: 'budget_2024.xlsx',
      type: 'datei',
      size: '1,8 MB',
      updated: 'vor 3 Tagen'
    },
    {
      id: 6,
      name: 'Archiv',
      type: 'ordner',
      items: 47,
      updated: 'vor 1 Monat'
    }
  ];

  if (!isMounted) {
    return null; // Prevent hydration mismatch by returning null on server
  }

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


const ProjectCard = ({ file_name, status = "inBearbeitung" }) => {
  const router = useRouter();

  const statusConfig = {
    inBearbeitung: {
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      label: 'In Bearbeitung'
    },
    genehmigt: {
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      label: 'Genehmigt'
    },
    abgelehnt: {
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      label: 'Abgelehnt'
    }
  };

  const { color, label } = statusConfig[status] || {
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    label: status || 'In Bearbeitung'
  };

  return (
    <div
      onClick={() => router.push(`/dashboard/project/${encodeURIComponent(file_name)}`)}
      className="group relative bg-white rounded-xl border border-gray-100 p-5 transition-all duration-300 hover:shadow-lg hover:border-blue-100 cursor-pointer"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-blue-50 rounded-lg transition-colors group-hover:bg-blue-100">
          <File className="w-5 h-5 text-blue-600" />
        </div>
        <span className="text-sm text-gray-500 font-medium truncate">
          {file_name}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-3 transition-colors group-hover:text-blue-700">
        {file_name}
      </h3>

      <div className="flex items-center justify-between">
        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${color}`}>
          {label}
        </span>

        <ChevronRight className="w-5 h-5 text-gray-400 opacity-0 transform translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
      </div>

      <div className="absolute inset-0 rounded-xl bg-blue-50 opacity-0 transition-opacity duration-300 group-hover:opacity-5" />
    </div>
  );
};


export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [activeStatus, setActiveStatus] = useState('all');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          throw new Error('Not authenticated!');
        }

        const response = await fetch('https://app.saincube.com/app1/projects/', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }

        const data = await response.json();
        console.log(data);
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

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

  const filteredProjects = activeStatus === 'all'
  ? projects
  : projects.filter(project => project.status.toLowerCase() === activeStatus.toLowerCase());

    const ProjectCardSkeleton = () => {
      return (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-lg bg-gray-200 animate-pulse w-10 h-10" />
            <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3" />
          </div>
    
          <div className="h-7 bg-gray-200 animate-pulse rounded w-3/4 mb-3" />
    
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 animate-pulse rounded-full w-28" />
            <div className="h-5 w-5 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      );
    };
    
    const renderContent = () => {
      if (loading) {
        return (
          <div className="flex-1 p-6 overflow-auto">
            <div className="flex justify-between mb-6">
              <div className="h-8 bg-gray-200 animate-pulse rounded w-40" />
              <div className="h-10 bg-gray-200 animate-pulse rounded-3xl w-44" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <ProjectCardSkeleton key={index} />
              ))}
            </div>
          </div>
        );
      }
    

    switch (activeSection) {
          case 'home':
            if (loading) {
              return (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              );
            }
            if (error) {
              return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 mx-auto max-w-md w-full">
                  {/* Modern illustration container */}
                  <div className="mb-8 relative">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                      <FolderOpen 
                        size={40} 
                        className="text-blue-600 transform -rotate-6"
                      />
                    </div>
                    <div className="absolute -right-2 -top-2">
                      <Plus 
                        size={24} 
                        className="text-blue-600 animate-pulse"
                      />
                    </div>
                  </div>
            
                  {/* Text content with gradient */}
                  <h3 className="text-2xl font-semibold mb-3 text-center bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                    No Projects Available
                  </h3>
                  <p className="text-gray-500 text-center mb-8 max-w-sm">
                    Get started by creating your first project. It only takes a few minutes.
                  </p>
            
                  {/* Modern button with hover effects */}
                  <Link href="/dashboard/create-project" className="w-full max-w-xs">
                    <button className="w-full group relative bg-blue-600 text-white px-8 py-3 rounded-xl flex items-center justify-center gap-3 
                      hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-200
                      transform hover:-translate-y-0.5">
                      <Plus 
                        size={20} 
                        className="group-hover:rotate-90 transition-transform duration-300" 
                      />
                      <span className="font-medium">Create New Project</span>
                      <div className="absolute inset-x-0 h-px bottom-0 bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </Link>
            
                  {/* Decorative elements */}
                  <div className="mt-12 flex items-center gap-2 text-gray-400">
                    <div className="w-16 h-px bg-gray-200"></div>
                    <span className="text-sm">or</span>
                    <div className="w-16 h-px bg-gray-200"></div>
                  </div>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-2 transition-colors duration-200"
                  >
                    <RefreshCw size={16} />
                    Refresh Page
                  </button>
                </div>
              );
            }

            return (
              <div className="flex-1 p-6 overflow-auto">
                <div className='flex justify-between mb-3'>
                  <h2 className="text-xl font-bold text-black mb-6">Alle Projekte</h2>
                  <Link href="/dashboard/create-project">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-3xl flex items-center gap-2">
                      <Plus size={20} />
                      Neues Projekt
                    </button>
                  </Link>
                </div>
                {projects.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    Keine Projekte gefunden. Erstellen Sie ein neues Projekt.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project, index) => (
                      <ProjectCard
                        key={index}
                        file_name={project.file_name}
                        status={project.status}
                      />
                    ))}
                  </div>
                )}
              </div>
            )    
      case 'folder':
        return (
          <OrdnerStruktur />
        );
        case 'projects':
          return (
            <div className="flex-1 p-6 overflow-auto">
              <h2 className="text-xl font-bold text-black mb-6">
                {activeStatus === 'inBearbeitung' ? 'In Bearbeitung' :
                  activeStatus === 'genehmigt' ? 'Genehmigt' : 'Abgelehnt'}
              </h2>
              
              {filteredProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 mx-auto max-w-md w-full">
                  {/* Status-specific illustrations */}
                  <div className="mb-8 relative">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center mb-2"
                      style={{
                        backgroundColor: activeStatus === 'inBearbeitung' ? '#EFF6FF' : 
                          activeStatus === 'genehmigt' ? '#F0FDF4' : '#FEF2F2'
                      }}
                    >
                      {activeStatus === 'inBearbeitung' ? (
                        <Clock 
                          size={40} 
                          className="text-blue-600"
                        />
                      ) : activeStatus === 'genehmigt' ? (
                        <CheckCircle 
                          size={40} 
                          className="text-green-600"
                        />
                      ) : (
                        <XCircle 
                          size={40} 
                          className="text-red-600"
                        />
                      )}
                    </div>
                  </div>
        
                  {/* Status-specific messages */}
                  <h3 className="text-2xl font-semibold mb-3 text-center">
                    {activeStatus === 'inBearbeitung' ? (
                      <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                        No Pending Projects
                      </span>
                    ) : activeStatus === 'genehmigt' ? (
                      <span className="bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                        No Completed Projects
                      </span>
                    ) : (
                      <span className="bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                        No Rejected Projects
                      </span>
                    )}
                  </h3>
        
                  <p className="text-gray-500 text-center mb-8 max-w-sm">
                    {activeStatus === 'inBearbeitung' ? (
                      "There are currently no projects in progress. New projects will appear here once they're being processed."
                    ) : activeStatus === 'genehmigt' ? (
                      "No projects have been completed yet. Approved projects will be displayed here."
                    ) : (
                      "No projects have been rejected. Any declined projects will appear in this section."
                    )}
                  </p>
        
                  {/* Action button - only shown for pending status */}
                  {activeStatus === 'inBearbeitung' && (
                    <Link href="/dashboard/create-project" className="w-full max-w-xs">
                      <button className="w-full group relative bg-blue-600 text-white px-8 py-3 rounded-xl flex items-center justify-center gap-3 
                        hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-200
                        transform hover:-translate-y-0.5">
                        <Plus 
                          size={20} 
                          className="group-hover:rotate-90 transition-transform duration-300" 
                        />
                        <span className="font-medium">Create New Project</span>
                      </button>
                    </Link>
                  )}
        
                  {/* Refresh option */}
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-6 text-gray-600 hover:text-gray-700 text-sm font-medium flex items-center gap-2 transition-colors duration-200"
                  >
                    <RefreshCw size={16} />
                    Refresh List
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project, index) => (
                    <ProjectCard
                      key={index}
                      file_name={project.file_name}
                      status={project.status}
                    />
                  ))}
                </div>
              )}
            </div>
          );
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
    <div className="flex h-screen bg-gray-50">
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-20 left-4 z-20 p-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
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
    </ProtectedRoute>
  );
}