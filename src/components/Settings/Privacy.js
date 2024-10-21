import React, { useState } from 'react';

const CustomSwitch = ({ checked, onChange }) => (
  <label className="switch">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="slider round"></span>
  </label>
);

const CustomButton = ({ children, onClick }) => (
  <button 
    className="text-blue-600 hover:text-blue-800 p-0 bg-transparent border-none cursor-pointer text-left"
    onClick={onClick}
  >
    {children}
  </button>
);

const PrivacyOptions = () => {
  const [options, setOptions] = useState({
    advertising: false,
    smartScreen: true,
    improveTyping: true,
    localContent: true
  });

  const handleToggle = (option) => {
    setOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  return (
    <div className="max-w-2xl mx-auto py-7 px-4 bg-white shadow-sm rounded-lg">
      <h1 className="text-2xl font-semibold mb-6 text-black">Datenschutzoptionen ändern</h1>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="pr-4">
            <p className="font-medium text-black">Lassen Sie Apps meine Werbe-ID für App-übergreifende Erlebnisse verwenden</p>
            <p className="text-sm text-gray-500">(Wenn Sie dies deaktivieren, wird Ihre ID zurückgesetzt)</p>
          </div>
          <CustomSwitch
            checked={options.advertising}
            onChange={() => handleToggle('advertising')}
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="font-medium pr-4 text-black">Aktivieren Sie den SmartScreen-Filter, um Webinhalte zu überprüfen (URLs) die Windows Store-Apps verwenden</p>
          <CustomSwitch
            checked={options.smartScreen}
            onChange={() => handleToggle('smartScreen')}
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="font-medium pr-4 text-black">Senden Sie Microsoft-Informationen darüber, wie ich schreibe, damit wir das Tippen und Schreiben in Zukunft verbessern können</p>
          <CustomSwitch
            checked={options.improveTyping}
            onChange={() => handleToggle('improveTyping')}
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="font-medium pr-4 text-black">Lassen Sie Websites lokal relevante Inhalte bereitstellen, indem Sie auf meine Sprachliste zugreifen</p>
          <CustomSwitch
            checked={options.localContent}
            onChange={() => handleToggle('localContent')}
          />
        </div>

        <CustomButton onClick={() => console.log('Manage advertising clicked')}>
        Verwalten Sie meine Microsoft-Werbung und andere Personalisierungsinformationen
        </CustomButton>

        <CustomButton onClick={() => console.log('Privacy Statement clicked')}>
        Datenschutzerklärung
        </CustomButton>
      </div>

      <style jsx>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 60px;
          height: 34px;
        }
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 26px;
          width: 26px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
        }
        input:checked + .slider {
          background-color: #2196F3;
        }
        input:checked + .slider:before {
          transform: translateX(26px);
        }
        .slider.round {
          border-radius: 34px;
        }
        .slider.round:before {
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
};

export default PrivacyOptions;