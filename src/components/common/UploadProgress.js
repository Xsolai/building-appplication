import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const UploadProgress = ({ isUploading, file, showSelection, onRemove }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isUploading && uploadProgress < 100) {
      const timer = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 1;
        });
      }, 50);
      return () => clearInterval(timer);
    }

    if (uploadProgress === 100 && !isProcessing) {
      setIsProcessing(true);
    }
  }, [isUploading, uploadProgress, isProcessing]);

  if (showSelection && file && !isUploading) {
    return (
      <div className="w-full p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-blue-900">{file.name}</h3>
            <p className="text-sm text-blue-600">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
          <button 
            onClick={onRemove}
            className="ml-auto p-1 hover:bg-blue-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
    );
  }

  if (!isUploading) return null;

  return (
    <div className="w-full p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      {!isProcessing ? (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700">Datei wird hochgeladen</span>
            <span className="text-sm font-medium text-gray-700">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300 bg-blue-600"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default UploadProgress;