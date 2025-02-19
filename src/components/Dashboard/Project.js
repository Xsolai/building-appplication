// src/components/Dashboard/Project.js
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
import FeedbackModal from './Feedback';
import VollstandigkeitForm from './UploadModal';
import FireProtectionModal from './FireProtection';

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
    genehmigt: {
      badge: 'bg-green-50 text-green-700',
      icon: CheckCircle2,
      iconColor: 'text-green-500'
    },
    inBearbeitung: {
      badge: 'bg-yellow-50 text-yellow-700',
      icon: Clock,
      iconColor: 'text-yellow-500'
    },
    abgelehnt: {
      badge: 'bg-red-50 text-red-700',
      icon: XCircle,
      iconColor: 'text-red-500'
    },
    gesperrt: {
      badge: 'bg-gray-50 text-gray-700',
      icon: Lock,
      iconColor: 'text-gray-500'
    }
  };

  return (status) => statusMap[status] || statusMap.gesperrt;
};

// Separate mapping for unit images
const unitImages = {
  'Vollständigkeit': Doc.src,
  'B-Plan': Location.src,
  'Brandschutz': Fire.src,
  'Statik': XLogo.src,
};

const UnitCard = ({ analysisData, title, status, timestamp, locked = false, projectTitle, projectID }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const styles = getStatusStyles()(status);
  const StatusIcon = styles.icon;
  const imageUrl = unitImages[title];

  // Handler function to determine which modal to open
  const handleCardClick = () => {
    if (title === 'B-Plan' || title === 'Vollständigkeit' /*|| title === 'Brandschutz'*/) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="relative group" onClick={handleCardClick}>
        <div className="absolute -top-2 left-3 z-10 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 bg-white border border-black text-black/60 shadow-sm">
          <StatusIcon className={`w-4 h-4 ${styles.iconColor}`} />
          {timestamp}
        </div>
        <div className={`relative bg-white rounded-lg border ${locked ? 'opacity-60' : ''} hover:shadow-lg border-black transition-shadow h-full cursor-pointer`}>
          <div className="p-4">
            <div className="flex items-center gap-1">
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Conditional rendering of modals */}
      {title === 'B-Plan' && (
        <BPlanModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          analysisData={analysisData}
          currentProjectID={projectID}
        />
      )}
      
      {title === 'Vollständigkeit' && (
        <VollstandigkeitForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          analysisData={analysisData}
          projectTitle={projectTitle}
          projectID={projectID}
        />
      )}

      {title === 'Brandschutz' && (
        <FireProtectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          analysisData={analysisData}
        />
      )}
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
  const [pending, setPending] = useState(null); // Add state to handle dynamic pending time

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [hasStatusChanged, setHasStatusChanged] = useState(false);
  const [currentProjectTitle, setCurrentProjectTitle] = useState(null);
  const [currentProjectID, setCurrentProjectID] = useState(null);
  const [isLoading, setIsLoading] = useState(false);


  // Add this effect to detect status changes
  useEffect(() => {
    if (analysisData?.compliance_status?.compliant_status && 
        ['genehmigt', 'abgelehnt'].includes(analysisData.compliance_status.compliant_status)) {
      setHasStatusChanged(true);
    }
  }, [analysisData?.compliance_status?.compliant_status]);
    
  useEffect(() => {
    // Extract file_name from the pathname
    const segments = pathname.split("/");
    const fileName = decodeURIComponent(segments[segments.length - 1]);
    setHeaderTitle(fileName);

    const fetchAllData = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          throw new Error('Not authenticated');
        }

        // Fetch project status
        const projectResponse = await fetch('https://solasolution.ecomtask.de/building-app/projects/', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!projectResponse.ok) {
          throw new Error('Failed to fetch projects');
        }

        const projects = await projectResponse.json();
        const currentProject = projects.find(project => project.file_name === fileName);
        const projectIndex = projects.findIndex(project => project.file_name === fileName);

        if (currentProject) {
          setCurrentProjectTitle(currentProject.file_name);
          setCurrentProjectID(projectIndex + 1);
          setHeaderStatus(currentProject.status);

          // Fetch analysis data
          const analysisResponse = await fetch(`https://solasolution.ecomtask.de/building-app/projects/${fileName}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (!analysisResponse.ok) {
            throw new Error("Failed to fetch analysis data");
          }

          const data = await analysisResponse.json();
          // console.log('Analysis Data:', data);  // Debug log
          setAnalysisData(data);

          // Dynamically update pending status
          setPending(data.pending); // Set the dynamic pending status here
        } else {
          setError('Project not found');
        }
      } catch (err) {
        console.error('Error fetching data:', err);  // Debug log
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (fileName) {
      fetchAllData();
    }
  }, [pathname]);

  const sendAnalyzeRequest = async (currentProjectTitle, currentProjectID) => {
    try {
      setIsLoading(true); // Start loading
      const response = await fetch(
        `https://solasolution.ecomtask.de/building-app/analyze/?doc_id=${currentProjectID}&project_name=${currentProjectTitle}`,
        {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
        }
      );
      // console.log(response);
      setAnalysisData(response.data);
      window.location.reload(); // Refresh the page
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

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

  const UnitStatusGrid = ({ analysisData }) => {
    // Function to format pending time dynamically (minutes and seconds)
    // Function to get timestamp for Vollständigkeit
    const getVollstandigkeitTimestamp = (completed) => {
      if (!completed) return 'Status nicht verfügbar';
      return `Abgeschlossen: ${new Date(completed).toLocaleDateString('de-DE')}`;
    };

    // Function to get timestamp for compliance status
    const getComplianceTimestamp = (status, pending) => {
      switch (status) {
        case 'genehmigt':
          return 'Genehmigung erteilt';
        case 'abgelehnt':
          return 'Ein Fehler wurde entdeckt';
        case 'inBearbeitung':
          return pending ? analysisData?.pending : 'In Bearbeitung';
        default:
          return 'In Bearbeitung';
      }
    };

    // Function to determine compliance status
    const getComplianceStatus = (status, pending) => {
      if (!status && pending) return 'inBearbeitung';
      return status || 'gesperrt';
    };


    const units = [
      {
        title: 'Vollständigkeit',
        status: 'genehmigt', // Always completed
        timestamp: getVollstandigkeitTimestamp(analysisData?.completed)
      },
      {
        title: 'B-Plan',
        status: getComplianceStatus(analysisData?.compliance_status?.compliant_status, analysisData?.pending),
        timestamp: getComplianceTimestamp(analysisData?.compliance_status?.compliant_status, analysisData?.pending)
      },
      {
        title: 'Brandschutz',
        status: 'abgelehnt',
        timestamp: 'Ein Fehler wurde entdeckt',
        locked: false
      },
      {
        title: 'Statik',
        status: 'gesperrt',
        timestamp: 'Status nicht verfügbar',
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
            projectTitle={currentProjectTitle}
            projectID={currentProjectID}
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Error</h2>
            <p className="mt-2 text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12 bg-gray-50">
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
            <div className="flex flex-col sm:flex-row gap-6 sm:items-center justify-between ">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{headerTitle}</h1>
                <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium inline-block ${getStatusColor(headerStatus)}`}>
                  {formatStatus(headerStatus)}
                </div>
              </div>

              {hasStatusChanged && (
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Feedback geben
                </button>
              )}
              {(!analysisData || Object.keys(analysisData).length < 3) && (<button
                  onClick={() => sendAnalyzeRequest(currentProjectTitle, currentProjectID)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <svg className="inline animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                      </svg>
                      <span>Analysieren...</span>
                    </div>
                  ) : (
                    "Analysieren"
                  )}
                </button>)}
            </div>
          </div>
        </div>

        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
        />


        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-2">
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
              {/* Pass analysisData to UnitStatusGrid */}
              <UnitStatusGrid analysisData={analysisData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
