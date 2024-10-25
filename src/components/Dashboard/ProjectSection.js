"use client";

import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import Sidebar from "@/components/common/SideBar";

const Form = () => {
  const [formData, setFormData] = useState({
    projectTitle: '',
    location: '',
    clientApplicant: '',
    projectType: '',
    buildingClass: '',
    buildingUsage: '',
    numberOfFloors: '',
    grossFloorArea: '',
    buildingVolume: '',
    technicalData: '',
    relevantAuthorities: '',
    documentList: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Check if the file has .zip extension or is a ZIP type
      const isZip = selectedFile.name.toLowerCase().endsWith('.zip') || 
                    selectedFile.type === 'application/zip' || 
                    selectedFile.type === 'application/x-zip-compressed' ||
                    selectedFile.type === 'application/octet-stream';
      
      if (isZip) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please select a ZIP file');
        setFile(null);
      }
    }
  };

  const uploadFile = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/proxy', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      setFormData(data);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-white">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 font-sans">
        <h1 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-black">New Project</h1>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="mb-4 md:mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full md:w-1/2 p-2 bg-blue-50 border border-gray-300 rounded"
            />
          </div>
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 mb-6 md:mb-8">
            <label className="flex items-center justify-center px-4 py-2 border border-gray-700 border-dashed rounded text-sm text-gray-600 w-full md:w-auto cursor-pointer">
              <Upload className="mr-2" size={18} />
              Upload ZIP file
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".zip,application/zip,application/x-zip-compressed,application/octet-stream"
              />
            </label>
            <button
              type="button"
              onClick={uploadFile}
              className="px-6 py-2 rounded text-sm text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center w-full md:w-auto disabled:bg-blue-400"
              disabled={loading || !file}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Upload and Process'
              )}
            </button>
          </div>
          {error && (
            <div className="text-red-500 mb-4 p-2 bg-red-50 rounded">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-16 md:gap-y-4">
            {Object.entries(formData).map(([key, value], index) => (
              <div key={key} className={index >= 10 ? "col-span-1 md:col-span-2" : ""}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}:
                </label>
                <p className="text-sm text-gray-900">{value}</p>
              </div>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form;
