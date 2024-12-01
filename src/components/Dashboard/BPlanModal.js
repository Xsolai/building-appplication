"use client";
import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, X, UploadIcon, XCircle, Clock } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';
import Location from "@/assests/images/location.png";

// Skeleton component for the map
const MapSkeleton = () => (
  <div className="h-full w-full rounded-lg bg-gray-200 animate-pulse overflow-hidden">
    <div className="absolute top-3 left-3 z-[1000]">
      <div className="w-8 h-8 bg-white rounded-sm shadow mb-2"></div>
      <div className="w-8 h-8 bg-white rounded-sm shadow"></div>
    </div>
    <div className="absolute bottom-1 right-1 z-[1000]">
      <div className="w-[200px] h-4 bg-white/80 rounded"></div>
    </div>
  </div>
);

const MapComponent = dynamic(
  () => {
    return new Promise(resolve => {
      Promise.all([
        import('react-leaflet').then(module => ({
          MapContainer: module.MapContainer,
          TileLayer: module.TileLayer,
          Marker: module.Marker,
          Popup: module.Popup
        })),
        import('leaflet')
      ]).then(([{ MapContainer, TileLayer, Marker, Popup }, L]) => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        const Map = ({ center, zoom }) => {
          const [isClient, setIsClient] = useState(false);

          useEffect(() => {
            setIsClient(true);
          }, []);

          if (!isClient) return <MapSkeleton />;

          return (
            <MapContainer
              center={center}
              zoom={zoom}
              style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={center}>
                <Popup>
                  Goethestraße 23, 36208 Wildeck
                </Popup>
              </Marker>
            </MapContainer>
          );
        };

        resolve(Map);
      });
    });
  },
  {
    ssr: false,
    loading: MapSkeleton
  }
);

const BPlanModal = ({ isOpen, onClose, analysisData }) => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projectData, setProjectData] = useState({
    Projekttitel: '',
    Projekttyp: '',
    Gebäudeklasse: '',
    'Nutzung des Gebäudes': '',
    'Anzahl der Stockwerke': '',
  });
  const [resultProjectData, setResultProjectData] = useState({
    Standort: '',
    Projekttyp: '',
    Gebäudeklasse: '',
    Prüfdatum: '',
  });
  const location = [50.9944, 9.9917];
  const [view, setView] = useState("initial");
  const abortController = useRef(new AbortController());

  useEffect(() => {
    if (analysisData?.compliance_status) {
      const newView = ["abgelehnt", "genehmigt"].includes(analysisData.compliance_status)
        ? "result"
        : "initial";
      setView(newView);
    }
  }, [analysisData]);

  const statusConfig = {
    genehmigt: {
      icon: CheckCircle2,
      iconColor: 'text-green-500',
      text: 'Abgeschlossen',
      border: 'border-green-500',
    },
    abgelehnt: {
      icon: XCircle,
      iconColor: 'text-red-500',
      text: 'Abgelehnt',
      border: 'border-red-500',
    }
  };

  useEffect(() => {
    if (analysisData?.analysis_result?.result_data) {
      const mappedFields = {
        'Projekttitel': analysisData.analysis_result.result_data['Project title'],
        'Projekttyp': analysisData.analysis_result.result_data[' Project type'],
        'Gebäudeklasse': analysisData.analysis_result.result_data[' Building class'],
        'Nutzung des Gebäudes': analysisData.analysis_result.result_data[' Building usage'],
        'Anzahl der Stockwerke': analysisData.analysis_result.result_data[' Number of floors']
      };
      setProjectData(mappedFields);

      const resultFields = {
        'Standort': analysisData.analysis_result.result_data[' Project location'],
        'Projekttyp': analysisData.analysis_result.result_data[' Project type'],
        'Gebäudeklasse': analysisData.analysis_result.result_data[' Building class'],
      };
      setResultProjectData(resultFields);
    }
  }, [analysisData]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile?.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Nur PDF-Dateien sind erlaubt');
      setFile(null);
    }
  };

  const LoadingOverlay = () => (
        <div className="fixed inset-0 text-white bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="flex flex-col items-center">
              <div className="flex flex-row space-x-4">
                <span className="size-16 bg-white inline-block rounded-full opacity-0 animate-dot1"></span>
                <span className="size-16 bg-white inline-block rounded-full opacity-0 animate-dot2"></span>
                <span className="size-16 bg-white inline-block rounded-full opacity-0 animate-dot3"></span>
                <span className="size-16 bg-white inline-block rounded-full opacity-0 animate-dot4"></span>
              </div>
              <span className="mt-4 text-lg">Dokument wird verarbeitet...</span>
            </div>
          </div>
  );

  const getBPlanStatus = () => {
    // Default to abgelehnt if status is not genehmigt
    return statusConfig[analysisData?.compliance_status === 'genehmigt' ? 'genehmigt' : 'abgelehnt'];
  };

  useEffect(() => {
    if (analysisData?.compliance_status) {
      // Only allow view change if status is either genehmigt or abgelehnt
      setView("result");
    }
  }, [analysisData]);

  const handleProcess = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);

    const { signal } = abortController.current;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://app.saincube.com/app1/upload-B-Plan/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload fehlgeschlagen');
      }

      const data = await response.json();
      
      // Ensure compliance_status is either genehmigt or abgelehnt
      data.compliance_status = data.compliance_status === 'genehmigt' ? 'genehmigt' : 'abgelehnt';
      
      const resultData = data.analysis_result?.result_data || {};

      const mappedFields = {
        'Projekttitel': resultData['Project title'] || 'Nicht verfügbar',
        'Projekttyp': resultData['Project type'] || 'Nicht verfügbar',
        'Gebäudeklasse': resultData['Building class'] || 'Nicht verfügbar',
        'Nutzung des Gebäudes': resultData['Building usage'] || 'Nicht verfügbar',
        'Anzahl der Stockwerke': resultData['Number of floors'] || 'Nicht verfügbar',
      };
      setProjectData(mappedFields);

      const resultFields = {
        'Standort': resultData['Project location'] || 'Nicht verfügbar',
        'Projekttyp': resultData['Project type'] || 'Nicht verfügbar',
        'Gebäudeklasse': resultData['Building class'] || 'Nicht verfügbar',
      };
      setResultProjectData(resultFields);

      setView("result");
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("Fetch aborted");
      } else {
        setError(err.message || "Ein Fehler ist aufgetreten");
      }
    } finally {
      setIsLoading(false);
    }
  };


  const renderInitialView = () => (
    <div className="h-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        <div className="flex flex-col justify-between">
          <div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold mb-4">B-Plan Check</h2>
            {Object.entries(projectData).map(([key, value]) => (
              <div key={key} className="flex flex-col sm:flex-row gap-1 sm:gap-2 mb-3">
                <span className="text-sm md:text-base font-bold w-full sm:w-[42%]">{key}:</span>
                <span className="text-gray-700 w-full text-sm md:text-base">{value || '-'}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 mt-4">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex items-center gap-3 flex-1">
                <div className="hidden sm:block">
                  <UploadIcon />
                </div>
                {file ? (
                  <div className="flex-1 px-3 py-2 border-2 border-dashed border-gray-600 rounded-md bg-gray-50 flex justify-between items-center">
                    <span className="text-gray-900 truncate block">{file.name}</span>
                    <button onClick={() => setFile(null)} className="ml-2 text-gray-500 hover:text-gray-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex-1 px-3 py-2 border-2 border-dashed border-gray-600 rounded-md cursor-pointer bg-blue-50 hover:bg-blue-100">
                    <span className="text-gray-900 font-medium">B-Plan hochladen</span>
                    <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf" />
                  </label>
                )}
              </div>
              <button
                onClick={handleProcess}
                disabled={!file || isLoading}
                className={`px-6 py-2 rounded-md font-medium ${!file || isLoading ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                Los gehts!
              </button>
            </div>

            {error && (
              <div className="text-red-600 bg-red-50 p-3 rounded">{error}</div>
            )}

            <div className="text-orange-800 bg-orange-100 p-2 rounded-md flex items-center gap-2">
              <span className="inline-flex justify-center items-center w-6 h-6 bg-orange-500 text-white rounded-full">ℹ</span>
              <span className="text-sm">Hinweis: Nur PDF-Dateien sind erlaubt</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col h-full">
          <div className="h-[250px] sm:h-[300px] lg:h-[calc(100%-2rem)] w-full relative z-20">
            <MapComponent center={location} zoom={15} />
          </div>
          <div className="mt-2 text-center text-sm text-gray-600">
            {analysisData?.analysis_result?.result_data?.[' Project location'] || 'Loading location...'}
          </div>
        </div>
      </div>
    </div>
  );

  const renderNonComplianceDetails = () => {
    const parseNonComplianceDetails = (details) => {
      if (!details) return [];
  
      const sections = details.split(/[.,]/)
        .map(s => s.trim())
        .filter(Boolean);
  
      const formattedContent = sections.map(section => {
        if (section.endsWith(':')) {
          return {
            type: 'heading',
            content: section.slice(0, -1).trim()
          };
        }
        return {
          type: 'bullet',
          content: section
        };
      });
  
      return formattedContent;
    };
  
    const content = parseNonComplianceDetails(analysisData?.non_compliant_details);
  
    return (
      <div className="max-h-40 py-2 overflow-y-auto custom-scrollbar bg-gray-50 rounded-lg p-4">
        <div className="space-y-4">
          {content.map((item, index) => {
            if (item.type === 'heading') {
              return (
                <h3 key={index} className="font-bold text-lg mt-6 first:mt-0">
                  {item.content}
                </h3>
              );
            } else {
              return (
                <div key={index} className="pl-5">
                  <ul className="list-disc space-y-2">
                    <li className="text-gray-700">{item.content}</li>
                  </ul>
                </div>
              );
            }
          })}
        </div>
      </div>
    );
  };
  
  const renderResultView = () => (
    <div className="h-full px-2">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7">
          <div className="space-y-3">
            <div className='flex flex-col sm:flex-row items-center justify-center gap-x-2'>
              <div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold mb-4">B-Plan Check</h2>
                <h3 className="text-xl mb-6">Prüfbericht für Kindergarten Obersuhl</h3>
                {Object.entries(resultProjectData).map(([key, value]) => (
                  <div key={key} className="flex flex-col sm:flex-row gap-1 sm:gap-2 mb-3">
                    <span className="font-bold min-w-[140px]">{key}:</span>
                    <span className="">{value || '-'}</span>
                  </div>
                ))}
              </div>

              <div>
                <div className="w-44 my-10">
                  <div className="relative group">
                    <div className="absolute -top-2 left-3 z-10 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 bg-white border border-black text-black/60 shadow-sm">
                      {React.createElement(getBPlanStatus().icon, {
                        className: `w-4 h-4 ${getBPlanStatus().iconColor}`
                      })}
                      {getBPlanStatus().text}
                    </div>
                    <div className={`relative bg-white rounded-lg border hover:shadow-lg transition-shadow cursor-pointer ${getBPlanStatus().border}`}>
                      <div className="p-3">
                        <div className="w-full aspect-square rounded-lg overflow-hidden mb-2">
                          <div className="bg-gray-100 w-full h-full flex items-center justify-center">
                            <img src={Location.src} alt="Location Icon" />
                          </div>
                        </div>
                        <h3 className="text-base font-medium text-gray-900 text-center">B-Plan</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {renderNonComplianceDetails()}
        </div>

        <div className="col-span-12 lg:col-span-5">
          <div className="h-[250px] sm:h-[300px] lg:h-[calc(100%-2rem)]  w-full relative rounded-lg overflow-hidden">
            <MapComponent center={location} zoom={15} />
          </div>
          <div className="mt-2 text-center text-sm text-gray-600">
            {analysisData?.analysis_result?.result_data?.[' Project location'] || 'Loading location...'}
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 text-black bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="relative bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        <button 
          onClick={onClose}
          disabled={isLoading}
          className={`absolute top-[-15px] right-[-15px] ${isLoading ? 'bg-gray-500' : 'bg-gray-800 hover:bg-gray-700'} text-white rounded-full p-2 z-50`}
        >
          <X className="w-5 h-5" />
        </button>

        {isLoading && <LoadingOverlay />}

        <div className="flex-1 overflow-y-auto px-6 py-8">
          {view === "result" ? renderResultView() : renderInitialView()}
        </div>
      </div>

      <style jsx>{`
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #CBD5E0 #EDF2F7;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #EDF2F7;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #CBD5E0;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #A0AEC0;
          }
        `}</style>
    </div>
  );
};

export default BPlanModal;