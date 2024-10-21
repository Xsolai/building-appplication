import React, { useState } from 'react';
import photo from "@/assests/images/avatar.png"
const UserProfilePage = () => {
  const [user, setUser] = useState({
    name: 'Admin',
    title: 'Administrator',
    organization: 'Genial',
    workPhone: '(509)-123-4567',
    mobilePhone: '(509)-123-4567',
    email: 'admin@ingeniux.com',
    photo: '/api/placeholder/200/200'
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = () => {
    // Implement photo change logic here
    console.log('Changing photo');
  };

  return (
    <div className="h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 flex flex-col items-center mb-6 md:mb-0">
              <img 
                src={photo.src} 
                alt="Profile" 
                className="w-40 h-40 rounded-full object-cover border-4 border-gray-200"
              />
              <button 
                onClick={handlePhotoChange}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors text-sm font-semibold"
              >
                FOTO ÄNDERN
              </button>
            </div>
            <div className="md:w-2/3 md:pl-8">
              <form>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  {[
                    { label: 'Name', name: 'name' },
                    { label: 'Titel', name: 'title' },
                    { label: 'Organisation', name: 'organization' },
                    { label: 'Arbeitstelefon', name: 'workPhone' },
                    { label: 'Mobiltelefon', name: 'mobilePhone' },
                    { label: 'E-Mail', name: 'email' },
                  ].map((field) => (
                    <div key={field.name} className="text-gray-400">
                      <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                        {field.label}:
                      </label>
                      <input
                        type="text"
                        id={field.name}
                        name={field.name}
                        value={user[field.name]}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors text-sm font-semibold"
                  >
                    Änderungen speichern
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;