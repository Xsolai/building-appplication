"use client";
import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, X, UploadIcon, XCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';
import Fire from "@/assests/images/fire.png";


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

  const FireProtectionModal = ({ isOpen, onClose, analysisData }) => {
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [projectData, setProjectData] = useState({
      'Brandschutzklasse': '',
      'Gebäudehöhe': '',
      'Fluchtweglänge': '',
    });
    const location = [50.9944, 9.9917];
    const [view, setView] = useState("initial");
    const abortController = useRef(new AbortController());
  
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
          <span className="mt-4 text-lg">Brandschutzkonzept wird analysiert...</span>
        </div>
      </div>
    );
  
    const handleProcess = () => {
      if (!file) return;
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setView("result");
      }, 2000);
    };
  
    const renderInitialView = () => (
      <div className="h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold mb-4">Brandschutzprüfung</h2>
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
                      <span className="text-gray-900 font-medium">Brandschutzkonzept hochladen</span>
                      <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf" />
                    </label>
                  )}
                </div>
                <button
                  onClick={handleProcess}
                  disabled={!file || isLoading}
                  className={`px-6 py-2 rounded-md font-medium ${!file || isLoading ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  Prüfen
                </button>
              </div>
  
              {error && (
                <div className="text-red-600 bg-red-50 p-3 rounded">{error}</div>
              )}
  
              <div className="text-orange-800 bg-orange-100 p-2 rounded-md flex items-center gap-2">
                <span className="inline-flex justify-center items-center w-6 h-6 bg-orange-500 text-white rounded-full">ℹ</span>
                <span className="text-sm">Hinweis: Nur PDF-Dateien des Brandschutzkonzepts sind erlaubt</span>
              </div>
            </div>
          </div>
  
          <div className="flex flex-col h-full">
            <div className="h-[250px] sm:h-[300px] lg:h-[calc(100%-2rem)] w-full relative z-20">
              <MapComponent center={location} zoom={15} />
            </div>
            <div className="mt-2 text-center text-sm text-gray-600">
              Goethestraße 23, 36208 Wildeck
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
            {renderInitialView()}
          </div>
        </div>
      </div>
    );
  };
  
  export default FireProtectionModal;
  