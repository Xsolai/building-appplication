import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import photo from "@/assests/images/avatar.png";
import { useRouter } from 'next/navigation';

const userSchema = z.object({
  username: z.string()
    .min(1, "Benutzername ist erforderlich")
    .max(15, "Benutzername darf maximal 15 Zeichen lang sein")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9._]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/,
      "Benutzername muss mit einem Buchstaben oder einer Zahl beginnen und enden"
    )
    .refine(
      (username) => !username.includes('..'),
      "Benutzername darf keine aufeinanderfolgenden Punkte enthalten"
    )
    .refine(
      (username) => /^[a-zA-Z0-9._]+$/.test(username),
      "Benutzername darf nur Buchstaben, Zahlen, Punkte und Unterstriche enthalten"
    ),
  title: z.string()
    .min(1, "Titel ist erforderlich")
    .max(50, "Titel darf maximal 50 Zeichen lang sein"),
  organization: z.string()
    .min(1, "Organisation ist erforderlich")
    .max(100, "Organisation darf maximal 100 Zeichen lang sein"),
  workPhone: z.string()
    .regex(
      /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/,
      "Ungültiges Telefonformat. Beispiel: +1 (123) 456-7890"
    )
    .optional()
    .or(z.literal('')),
  contact_number: z.string()
    .regex(/^\d{11}$/, "Die Kontaktnummer muss 11-stellig sein"),
  email: z.string()
    .min(1, "E-Mail ist erforderlich")
    .email("Ungültiges E-Mail-Format"),
});

const UserProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState({
    username: '',
    title: '',
    organization: '',
    workPhone: '',
    contact_number: '',
    email: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("https://solasolution.ecomtask.de/building-app/update-profile", {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
        });


        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await response.json();
 
        // Correctly map the backend data to frontend fields
        setUser({
          username: data.username || '',
          title: data.title || '',
          organization: data.organization ,  // Default value if NULL
          workPhone: data.work_phone || '',
          contact_number: data.contact_number,  // Default value from DB
          email: data.email,  // Default value from DB
        });
      } catch (error) {
        console.error(error.message);
        setApiError('Fehler beim Laden des Profils. Bitte versuchen Sie es später erneut.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserProfile();
  }, [router]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setApiError('');
    setSuccessMessage('');



    try {
      userSchema.parse(user);
      setIsLoading(true);

      try {
        const response = await fetch('https://solasolution.ecomtask.de/building-app/update-profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({
            username: user.username,
            title: user.title,
            organization: user.organization,
            work_phone: user.workPhone,
            contact_number: user.contact_number,
            email: user.email,
          }),
        });


        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Update failed');
        }

        setSuccessMessage('Profil wurde erfolgreich aktualisiert');
      } catch (error) {
        console.error('Update error:', error);
      }
    } catch (zodError) {
      const formattedErrors = {};
      zodError.errors.forEach((error) => {
        formattedErrors[error.path[0]] = error.message;
      });
      setErrors(formattedErrors);
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { label: 'Benutzername', name: 'username', placeholder: 'Ihr Benutzername' },
    { label: 'Titel', name: 'title', placeholder: 'Ihre Position' },
    { label: 'Organisation', name: 'organization', placeholder: 'Ihre Organisation' },
    { label: 'Arbeitstelefon', name: 'workPhone', placeholder: '+1 (123) 456-7890' },
    { label: 'Kontaktnummer', name: 'contact_number', placeholder: '03XXXXXXXXX' },
    { label: 'E-Mail', name: 'email', placeholder: 'ihre.email@beispiel.de' },
  ];

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Profildaten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-8">
          {apiError && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {apiError}
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              {successMessage}
            </div>
          )}
          
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 flex flex-col items-center mb-6 md:mb-0">
              <img 
                src={photo.src} 
                alt="Profile" 
                className="w-40 h-40 rounded-full object-cover border-4 border-gray-200"
              />
              <button 
                type="button"
                disabled={true}
                className="mt-4 bg-gray-400 text-white px-4 py-2 rounded text-sm font-semibold cursor-not-allowed"
              >
                FOTO ÄNDERN (Deaktiviert)
              </button>
            </div>

            <div className="md:w-2/3 md:pl-8">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  {fields.map((field) => (
                    <div key={field.name}>
                      <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                        {field.label}:
                      </label>
                      <input
                        type={field.name === 'email' ? 'email' : 'text'}
                        id={field.name}
                        name={field.name}
                        value={user[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        disabled={isLoading}
                        className={`mt-1 block w-full border ${
                          errors[field.name] ? 'border-red-500' : 'border-gray-300'
                        } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      />
                      {errors[field.name] && (
                        <p className="mt-1 text-xs text-red-500">{errors[field.name]}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors text-sm font-semibold ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Wird gespeichert...' : 'Änderungen speichern'}
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