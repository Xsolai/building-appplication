"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { EyeOff, Eye } from "lucide-react";
import logo from "@/assests/images/logo.svg";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { z } from 'zod';

const signupSchema = z.object({
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
  email: z.string()
    .min(1, "E-Mail ist erforderlich")
    .email("Ungültiges E-Mail-Format"),
  password1: z.string()
    .min(8, "Das Passwort muss mindestens 8 Zeichen lang sein")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.])[A-Za-z\d@$!%*#?&.]/,
      "Passwort muss Buchstaben, Zahlen und Sonderzeichen enthalten"
    ),
  password2: z.string()
    .min(1, "Bitte bestätigen Sie Ihr Passwort"),
  contact_number: z.string()
    .regex(/^\d{11}$/, "Die Kontaktnummer muss 11-stellig sein"),
}).refine((data) => data.password1 === data.password2, {
  message: "Passwörter stimmen nicht überein",
  path: ["password2"],
});


const SignupPage = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password1: '',
    password2: '',
    contact_number: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      signupSchema.parse(form);
      setIsLoading(true);
      setApiError('');
      setErrors({});
      
      try {
        // Update the API endpoint to match your FastAPI server
        const response = await fetch('https://app.saincube.com/app1/auth/register', {  // Adjust the URL to match your backend
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            name: form.username,
            email: form.email,
            password1: form.password1,
            password2: form.password2,
            contact_number: form.contact_number,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Registration failed');
        }

        // Check for the success message from FastAPI
        if (data.message && data.message.includes('OTP sent')) {
          router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
        } else {
          throw new Error('Unexpected response from server');
        }

      } catch (error) {
        console.error('Registration error:', error);
        setApiError(error.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
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

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-full md:max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <Link href="/">
              <Image
                src={logo.src}
                alt="Bauantrag DE Logo"
                width={180}
                height={60}
                priority
              />
            </Link>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Registrieren
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Das Portal für eine schnelle und effiziente Bearbeitung von Bauanträgen mit KI-unterstützter Prüfung. Erstellen Sie ein Konto, um Ihre Bauprojekte zu verwalten.
          </p>
        </div>

        <form className="mt-8 space-y-6 w-full" onSubmit={handleSubmit}>
          {apiError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{apiError}</span>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Benutzername
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                disabled={isLoading}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.username ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Benutzername"
              />
              {errors.username && (
                <p className="text-red-500 text-xs my-1">{errors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                E-Mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                disabled={isLoading}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="E-Mail Adresse"
              />
              {errors.email && (
                <p className="text-red-500 text-xs my-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="contact_number" className="sr-only">
                Kontaktnummer
              </label>
              <input
                id="contact_number"
                name="contact_number"
                type="tel"
                value={form.contact_number}
                onChange={handleChange}
                disabled={isLoading}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.contact_number ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Kontaktnummer"
              />
              {errors.contact_number && (
                <p className="text-red-500 text-xs my-1">{errors.contact_number}</p>
              )}
            </div>

            <div className="relative">
              <label htmlFor="password1" className="sr-only">
                Passwort
              </label>
              <input
                id="password1"
                name="password1"
                type={showPassword1 ? "text" : "password"}
                value={form.password1}
                onChange={handleChange}
                disabled={isLoading}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.password1 ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Passwort"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword1(!showPassword1)}
                  className="focus:outline-none"
                >
                  {showPassword1 ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password1 && (
                <p className="text-red-500 text-xs my-1">{errors.password1}</p>
              )}
            </div>

            <div className="relative">
              <label htmlFor="password2" className="sr-only">
                Passwort bestätigen
              </label>
              <input
                id="password2"
                name="password2"
                type={showPassword2 ? "text" : "password"}
                value={form.password2}
                onChange={handleChange}
                disabled={isLoading}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.password2 ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Passwort bestätigen"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword2(!showPassword2)}
                  className="focus:outline-none"
                >
                  {showPassword2 ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password2 && (
                <p className="text-red-500 text-xs my-1">{errors.password2}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Registrierung...' : 'Registrieren'}
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="font-medium text-indigo-600">
              Bereits registriert?{" "}
              <Link href="/" className="text-indigo-600 hover:text-red-500 underline">
                Hier anmelden
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;