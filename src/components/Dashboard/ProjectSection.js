"use client";
import React, { useState } from 'react';
import { PenSquare, AlertCircle, Save, X } from 'lucide-react';
import Sidebar from "@/components/common/SideBar";
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast'; // Import Toaster
import VoucherPopup from './Voucher';

const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
      <path d="M12.5535 2.49392C12.4114 2.33852 12.2106 2.25 12 2.25C11.7894 2.25 11.5886 2.33852 11.4465 2.49392L7.44648 6.86892C7.16698 7.17462 7.18822 7.64902 7.49392 7.92852C7.79963 8.20802 8.27402 8.18678 8.55352 7.88108L11.25 4.9318V16C11.25 16.4142 11.5858 16.75 12 16.75C12.4142 16.75 12.75 16.4142 12.75 16V4.9318L15.4465 7.88108C15.726 8.18678 16.2004 8.20802 16.5061 7.92852C16.8118 7.64902 16.833 7.17462 16.5535 6.86892L12.5535 2.49392Z" fill="#1C274C"></path>
      <path d="M3.75 15C3.75 14.5858 3.41422 14.25 3 14.25C2.58579 14.25 2.25 14.5858 2.25 15V15.0549C2.24998 16.4225 2.24996 17.5248 2.36652 18.3918C2.48754 19.2919 2.74643 20.0497 3.34835 20.6516C3.95027 21.2536 4.70814 21.5125 5.60825 21.6335C6.47522 21.75 7.57754 21.75 8.94513 21.75H15.0549C16.4225 21.75 17.5248 21.75 18.3918 21.6335C19.2919 21.5125 20.0497 21.2536 20.6517 20.6516C21.2536 20.0497 21.5125 19.2919 21.6335 18.3918C21.75 17.5248 21.75 16.4225 21.75 15.0549V15C21.75 14.5858 21.4142 14.25 21 14.25C20.5858 14.25 20.25 14.5858 20.25 15C20.25 16.4354 20.2484 17.4365 20.1469 18.1919C20.0482 18.9257 19.8678 19.3142 19.591 19.591C19.3142 19.8678 18.9257 20.0482 18.1919 20.1469C17.4365 20.2484 16.4354 20.25 15 20.25H9C7.56459 20.25 6.56347 20.2484 5.80812 20.1469C5.07435 20.0482 4.68577 19.8678 4.40901 19.591C4.13225 19.3142 3.9518 18.9257 3.85315 18.1919C3.75159 17.4365 3.75 16.4354 3.75 15Z" fill="#1C274C"></path>
    </g>
  </svg>
);

const TickIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_iconCarrier" transform="translate(0, -3)">
      <circle cx="12" cy="12" r="8" fill="#34A853" />
      <path d="M8 12L10.5 14.5L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
);

const Form = () => {
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showVoucherPopup, setShowVoucherPopup] = useState(false);
  const [isVoucherVerified, setIsVoucherVerified] = useState(false);

  const handleVoucherSuccess = () => {
    setIsVoucherVerified(true);
    uploadFile(); // Proceed with file upload after voucher verification
  };

    // Update the existing button click handler
    const handleLetsGoClick = () => {
      if (!file || !projectName) {
        toast.error('Bitte Projektnamen und Datei auswählen');
        return;
      }
      setShowVoucherPopup(true);
    };

  const [formData, setFormData] = useState({
    Projekttitel: '',
    Standort: '',
    'Auftraggeber / Antragsteller': '',
    Projekttyp: '',
    Gebäudeklasse: '',
    'Nutzung des Gebäudes': '',
    'Anzahl der Stockwerke': '',
    Bruttogrundfläche: '',
    Gebäudekubatur: '',
    'Technische Daten': '',
    'Zuständige Behörden': '',
    Dokumentenliste: ''
  });

  const getConfig = () => ({
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
      'Content-Type': 'application/json'
    }
  });

  const getFormDataConfig = () => ({
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
    }
  });

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.name.toLowerCase().endsWith('.zip')) {
      setFile(selectedFile);
      toast.dismiss();
    } else {
      toast.error('Bitte laden Sie eine ZIP-Datei hoch');
    }
  };

  const uploadFile = async () => {
    if (!file || !projectName) {
      toast.error('Bitte Projektnamen und Datei auswählen');
      return;
    }
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      formDataToSend.append('name', projectName);

      const response = await fetch('https://app.saincube.com/app1/upload/', {
        method: 'POST',
        ...getFormDataConfig(),
        body: formDataToSend,
      });

      const data = await response.json();

      // Universal error handling - check all possible error indicators
      if (data.status_code >= 400 || data.error || data.detail || !response.ok) {
        const errorMessage = data.detail || data.error || data.message || 'Ein Fehler ist aufgetreten';
        toast.error(errorMessage);
        setLoading(false);
        return;
      }

      // Success case
      setFormData(data);
      setIsProcessed(true);
      toast.success('Datei erfolgreich hochgeladen');
    } catch (err) {
      toast.error('Fehler beim Hochladen der Datei');
    } finally {
      setLoading(false);
    }
  };

  const handleEditField = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://app.saincube.com/app1/api/update-project/', {
        method: 'PUT',
        ...getConfig(),
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();

      // Universal error handling for save changes
      if (!response.ok || data.error || data.detail) {
        const errorMessage = data.detail || data.error || data.message || 'Fehler beim Speichern der Änderungen';
        toast.error(errorMessage);
        return;
      }

      toast.success('Änderungen erfolgreich gespeichert');
      setIsEditing(false);
    } catch (err) {
      toast.error('Fehler beim Speichern der Änderungen');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    if (!projectName) {
      toast.error('Bitte geben Sie einen Projektnamen ein');
      return;
    }
    router.push('/dashboard');
  };

  return (
    <div className="flex flex-col md:flex-row bg-white">
      <Toaster position="top-right" />
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-8">Neues Projekt</h1>

        <div className="max-w-3xl space-y-6">
          <div className="mb-6">
            <label className="block mb-2 text-[#1A1A1A] font-semibold">Name:</label>
            <input
              type="text"
              placeholder="Projektnamen eingeben"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full p-3 bg-blue-50 rounded-md border border-gray-300 text-[#1A1A1A] focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            {isProcessed ? (
              <div className="flex items-center gap-2">
                <div className="flex">
                  <TickIcon />
                </div>
                <div className="px-8 py-3 border-2 border-dashed border-green-500 rounded-md bg-green-50">
                  <span className="text-[#1A1A1A]">{file.name}</span>
                </div>
              </div>
            ) : (
              <>
                <div className="flex">
                  <UploadIcon />
                </div>
                <label className="px-6 py-3 border-2 border-dashed border-[#666666] rounded-md cursor-pointer bg-[#F0F7FF] hover:bg-blue-100 transition-colors">
                  <span className="text-[#1A1A1A] font-medium">Upload Bauantrag</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".zip"
                  />
                </label>
              </>
            )}

      {!isProcessed && (
          <button
            onClick={handleLetsGoClick}
            disabled={!file || !projectName || loading}
            className={`px-6 py-3 rounded-md font-medium transition-all ${
              !file || !projectName || loading
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-[#0070BA] text-white hover:bg-[#005EA8]'
            }`}
          >
            {loading ? 'Wird hochgeladen...' : 'Los gehts!'}
          </button>
        )}

        {/* Add the VoucherPopup component */}
        <VoucherPopup
          isOpen={showVoucherPopup}
          onClose={() => setShowVoucherPopup(false)}
          onSuccess={handleVoucherSuccess}
        />
          </div>

          {!file && !isProcessed && (
            <div className="flex items-start gap-3 p-4 bg-orange-100 border border-orange-200 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              <span className="text-orange-800 font-medium">
                Hinweis: Der Bauantrag muss gesammelt als .zip hochgeladen werden
              </span>
            </div>
          )}

          {isProcessed && (
            <>
              <div className="relative mt-8 p-6">
                <div className="absolute right-4 top-1 flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveChanges}
                        disabled={loading}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                      >
                        <Save size={20} />
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="p-2 text-gray-500 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 text-gray-500 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <PenSquare size={20} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 items-center justify-center">
                  {Object.entries(formData).map(([key, value]) => (
                    <div key={key}>
                      <div className="font-bold text-gray-700 mb-2">{key}:</div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleEditField(key, e.target.value)}
                          className="w-full p-2 border rounded bg-gray-50 text-[#1A1A1A] focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      ) : (
                        <div className="text-gray-600 bg-gray-50 p-2 rounded">{value}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleCreateProject}
                  disabled={!projectName}
                  className={`px-6 py-3 bg-[#0070BA] text-white rounded-md font-medium 
                    ${!projectName ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#005EA8]'} 
                    transition-colors`}
                >
                  {loading ? 'Wird erstellt...' : 'Zum Projekt'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Form;