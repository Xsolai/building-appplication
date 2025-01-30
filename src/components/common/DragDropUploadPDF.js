import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

const DragDropUploadPDF = ({ 
  onFileSelect, 
  file, 
  loading, 
  acceptedFileType = ".pdf",
  dropzoneText = "PDF-Datei hierher ziehen",
  buttonText = "B-Plan hochladen"
}) => {
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
    if (droppedFile?.type === 'application/pdf') {
      onFileSelect(droppedFile);
    } else {
      onFileSelect(null);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer
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
            {dropzoneText}
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
          if (selectedFile?.type === 'application/pdf') {
            onFileSelect(selectedFile);
          } else {
            onFileSelect(null);
          }
        }}
        accept={acceptedFileType}
      />
    </div>
  );
};

export default DragDropUploadPDF;