import React, { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const DragDropUpload = ({ onFileSelect, file, loading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.toLowerCase().endsWith('.zip')) {
      onFileSelect(droppedFile);
    } else {
      toast.error('Bitte laden Sie eine ZIP-Datei hoch');
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
  };

  return (
    <div className="w-full">
      {file && !loading ? (
        // File preview
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
          <div className="p-2 bg-white rounded-lg">
            <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{file.name}</p>
            <p className="text-sm text-gray-600">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
          <button 
            onClick={handleRemoveFile}
            className="p-1 hover:bg-blue-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      ) : (
        // Drag & drop zone
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`
            relative border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer
            ${isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
            }
          `}
        >
          <div className="flex flex-col items-center gap-4">
            <div className={`p-3 rounded-full ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <Upload className={`w-6 h-6 ${isDragging ? 'text-blue-600' : 'text-gray-600'}`} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                Ziehen Sie Ihre ZIP-Datei hierher
              </p>
              <p className="text-xs text-gray-500 mt-1">
                oder klicken Sie zum Auswählen
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile?.name.toLowerCase().endsWith('.zip')) {
                onFileSelect(selectedFile);
              } else {
                toast.error('Bitte laden Sie eine ZIP-Datei hoch');
              }
            }}
            accept=".zip"
          />
        </div>
      )}
    </div>
  );
};

export default DragDropUpload;