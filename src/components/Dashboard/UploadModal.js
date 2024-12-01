
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, X, UploadIcon, XCircle, Clock } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';
import Doc from "@/assests/images/docs.png";


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

  const VollstandigkeitForm = ({ isOpen, onClose, analysisData }) => {
    const location = [50.9944, 9.9917];
  
    const getBPlanStatus = () => {
      return {
        icon: analysisData?.completeness_status === 'incomplete' ? XCircle : CheckCircle2,
        iconColor: analysisData?.completeness_status === 'incomplete' ? 'text-red-500' : 'text-green-500',
        text: analysisData?.completeness_status === 'incomplete' ? 'Unvollständig' : 'Vollständig',
        border: analysisData?.completeness_status === 'incomplete' ? 'border-red-500' : 'border-green-500',
      };
    };
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 text-black bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="relative bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
          <button 
            onClick={onClose}
            className="absolute top-[-15px] right-[-15px] bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 z-50"
          >
            <X className="w-5 h-5" />
          </button>
  
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="h-full px-2">
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-7">
                  <div className="space-y-3">
                    <div className='flex flex-col sm:flex-row items-start gap-x-2'>
                      <div className="flex-1">
                        <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold mb-4">Vollständigkeitsprüfung</h2>
  
                        {/* Project Details Grid */}
                        <div className="grid grid-cols-1 gap-4 pb-4">
                          {analysisData && analysisData.analysis_result && analysisData.analysis_result.result_data &&
                            Object.entries(analysisData.analysis_result.result_data).map(([key, value]) => (
                              <div key={key} className="bg-white p-2">
                                <div className="text-gray-700 font-bold mb-1">{key}</div>
                                <div className="text-gray-900">{value}</div>
                              </div>
                            ))
                          }
                        </div>
                      </div>
  
                      {/* Status Card */}
                      <div className="w-44 mt-4 sm:mt-0">
                        <div className="relative group">
                          <div className="absolute -top-2 left-3 z-10 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 bg-white border border-black text-black/60 shadow-sm">
                            {React.createElement(getBPlanStatus().icon, {
                              className: `w-4 h-4 ${getBPlanStatus().iconColor}`
                            })}
                            {getBPlanStatus().text}
                          </div>
                          <div className={`relative bg-white rounded-lg border hover:shadow-lg transition-shadow ${getBPlanStatus().border}`}>
                            <div className="p-3">
                              <div className="w-full aspect-square rounded-lg overflow-hidden mb-2">
                                <div className="bg-gray-100 w-full h-full flex items-center justify-center">
                                  <img src={Doc.src} alt="Document Icon" className="w-16 h-16" />
                                </div>
                              </div>
                              <h3 className="text-base font-medium text-gray-900 text-center">Vollständigkeit</h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
  
                <div className="col-span-12 lg:col-span-5">
                  <div className="h-[250px] sm:h-[300px] lg:h-[calc(100%-2rem)] w-full relative rounded-lg overflow-hidden">
                    <MapComponent center={location} zoom={15} />
                  </div>
                  <div className="mt-2 text-center text-sm text-gray-600">
                    {analysisData?.analysis_result?.result_data?.[' Project location'] || 'Goethestraße 23, 36208 Wildeck'}
                  </div>
                </div>
              </div>
            </div>
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
  
  export default VollstandigkeitForm;