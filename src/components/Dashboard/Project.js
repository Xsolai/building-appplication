"use client";
import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, XCircle, Lock, ChevronLeft, X } from 'lucide-react';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';
import AppBar from "@/components/common/AppBar";
import XLogo from "@/assests/images/x.png";
import Fire from "@/assests/images/fire.png";
import Location from "@/assests/images/location.png";
import Doc from "@/assests/images/docs.png";
import BPlanModal from './BPlanModal';

// First, create skeleton components
const HeaderSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm mb-6">
    <div className="p-6">
      <div className="flex items-start">
        <div className="w-full">
          <div className="h-8 bg-gray-200 rounded-md w-64 mb-3 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded-full w-32 animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

const DataGridSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm">
    <div className="p-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-2">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white p-3">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-2 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-2/3 animate-pulse" />
          </div>
        ))}
      </div>

      <div className="mt-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="relative">
              <div className="absolute -top-2 left-3 z-10 w-32 h-6 bg-gray-200 rounded animate-pulse" />
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="w-full aspect-square rounded-lg bg-gray-200 mb-4 animate-pulse" />
                <div className="h-6 bg-gray-200 rounded w-24 mx-auto animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const getStatusStyles = () => {
  const statusMap = {
    completed: {
      badge: 'bg-green-50 text-green-700',
      icon: CheckCircle2,
      iconColor: 'text-green-500',
      image: Doc.src
    },
    pending: {
      badge: 'bg-yellow-50 text-yellow-700',
      icon: Clock,
      iconColor: 'text-yellow-500',
      image: Location.src
    },
    error: {
      badge: 'bg-red-50 text-red-700',
      icon: XCircle,
      iconColor: 'text-red-500',
      image: Fire.src
    },
    locked: {
      badge: 'bg-gray-50 text-gray-700',
      icon: Lock,
      iconColor: 'text-gray-500',
      image: XLogo.src
    }
  };

  return (status) => statusMap[status] || statusMap.locked;
};

const UnitCard = ({ analysisData, title, status, timestamp, locked = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const styles = getStatusStyles()(status);
  const StatusIcon = styles.icon;

  return (
    <>
      <div className="relative group" onClick={() => title === 'B-Plan' && setIsModalOpen(true)}>
        <div className="absolute -top-2 left-3 z-10 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 bg-white border border-black text-black/60 shadow-sm">
          <StatusIcon className={`w-4 h-4 ${styles.iconColor}`} />
          {timestamp}
        </div>
        <div className={`relative bg-white rounded-lg border ${locked ? 'opacity-60' : ''} hover:shadow-lg border-black transition-shadow h-full cursor-pointer`}>
          <div className="p-4">
            <div className="w-full aspect-square rounded-lg overflow-hidden mb-4">
              <img src={styles.image} alt={title} className="w-full h-full object-cover" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center">{title}</h3>
          </div>
        </div>
      </div>
      {title === 'B-Plan' &&     
      <BPlanModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        analysisData={analysisData}
      />}
    </>
  );
};


const ProjectPage = () => {
  const pathname = usePathname();
  const [headerTitle, setHeaderTitle] = useState("");
  const [headerStatus, setHeaderStatus] = useState("");
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Extract file_name from the pathname
    const segments = pathname.split("/");
    const fileName = decodeURIComponent(segments[segments.length - 1]);
    setHeaderTitle(fileName);

    // Fetch project status based on filename
    const fetchProjectStatus = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          throw new Error('Not authenticated');
        }

        const response = await fetch('http://localhost:8000/projects/', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }

        const projects = await response.json();
        
        // Find the matching project by filename
        const currentProject = projects.find(project => project.file_name === fileName);
        
        if (currentProject) {
          setHeaderStatus(currentProject.status);
        } else {
          setError('Project not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (fileName) {
      fetchProjectStatus();
    }
  }, [pathname]);

  const fetchAnalysisData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Access token not found');
      }

      const response = await fetch(`/api/projects/${headerTitle}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch analysis data");
      }

      const data = await response.json();
      setAnalysisData(data);
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    if (headerTitle) {
      fetchAnalysisData();
    }
  }, [headerTitle]);

  const getStatusColor = (status) => {
    const colors = {
      inBearbeitung: "bg-yellow-100 text-yellow-800",
      genehmigt: "bg-green-100 text-green-800",
      abgelehnt: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatStatus = (status) => {
    const formats = {
      inBearbeitung: "In Bearbeitung",
      genehmigt: "Genehmigt",
      abgelehnt: "Abgelehnt"
    };
    return formats[status] || status;
  };

  const UnitStatusGrid = () => {
    const units = [
      {
        title: 'Vollständigkeit',
        status: 'completed',
        timestamp: 'Abgeschlossen: 20.10.2024'
      },
      {
        title: 'B-Plan',
        status: 'pending',
        timestamp: 'Ausstehend: 3 min.'
      },
      {
        title: 'Brandschutz',
        status: 'error',
        timestamp: 'Ein Fehler wurde entdeckt'
      },
      {
        title: 'Statik',
        status: 'locked',
        locked: true
      }
    ];
  
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {units.map((unit, index) => (
          <UnitCard
            key={index}
            title={unit.title}
            status={unit.status}
            timestamp={unit.timestamp}
            locked={unit.locked}
            analysisData={analysisData}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <div className="w-40 h-6 bg-gray-200 rounded animate-pulse" />
          </div>
          <HeaderSkeleton />
          <DataGridSkeleton />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Zurück zum Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-6">
            <div className="flex items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{headerTitle}</h1>
                <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium inline-block ${getStatusColor(headerStatus)}`}>
                  {formatStatus(headerStatus)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-2">
              {/* Render the result_data from analysisData */}
              {analysisData && analysisData.analysis_result && analysisData.analysis_result.result_data &&
                Object.entries(analysisData.analysis_result.result_data).map(([key, value]) => (
                  <div key={key} className="bg-white p-3">
                    <div className="font-medium text-gray-700 mb-1">{key}</div>
                    <div className="text-gray-900">{value}</div>
                  </div>
                ))
              }
            </div>

            <div className="mt-16">
              <UnitStatusGrid />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
