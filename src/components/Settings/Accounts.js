import React from 'react';
import { ChevronRight, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import photo from '@/assests/images/avatar.png'

const AccountSettings = () => {
    const router = useRouter();
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  return (

    <div className="max-w-3xl p-9 mx-9 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-black">Kontoeinstellungen</h1>
      
      <div className="md:flex md:space-x-8">
        <section className="mb-8 md:w-1/2">
          <h2 className="text-lg font-semibold mb-4 text-black">Grundlegende Informationen</h2>
          <div className="flex items-center mb-4">
            <div className="relative">
              <img src={photo.src} alt="Profile" className="w-16 h-16 rounded-full" />
              <button className="absolute bottom-0 right-0 bg-gray-200 rounded-full p-1">
                <Camera size={16} />
              </button>
            </div>
            <span className="ml-4 text-blue-600 text-black">Neues Bild hochladen</span>
          </div>
          
          {['Name', 'Geburtsdatum', 'Geschlecht', 'Email'].map((item, index) => (
            <div key={index} className="flex justify-between items-center py-3 px-2 border-b">
              <span className="font-medium text-black">{item}</span>
              <div className="flex items-center">
                <span className="mr-2 text-gray-400">
                  {item === 'Name' && 'Wade Armstrong'}
                  {item === 'Geburtsdatum' && 'December 24, 1991'}
                  {item === 'Geschlecht' && 'Männlich'}
                  {item === 'Email' && 'wade.armstrong@email.com'}
                </span>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </div>
          ))}
        </section>
        
        <section className="md:w-1/2">
          <h2 className="text-lg font-semibold mb-4 text-black">Kontoinformationen</h2>
          {['Benutzername', 'Passwort'].map((item, index) => (
            <div key={index} className="flex justify-between items-center py-3 border-b">
              <span className="font-medium text-black">{item}</span>
              <div className="flex items-center">
                <span className="mr-2 text-gray-400">
                  {item === 'Benutzername' && 'wadearmstrong94'}
                  {item === 'Passwort' && '••••••••'}
                </span>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default AccountSettings;