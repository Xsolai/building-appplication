"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast, Toaster } from 'react-hot-toast';
import Link from "next/link";
import Image from "next/image";
import logo from "@/assests/images/logo.svg";
import axios from 'axios';
import ProtectedRoute from '@/components/common/ProtectedRoute';


const schema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
});

const ResetPasswordPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError("");
    
    try {
      const response = await axios.post('https://solasolution.ecomtask.de/buildingapp/auth/forget-password/', {
        email: data.email
      });

      toast.success(response.data.message || 'E-Mail zum Zurücksetzen des Passworts wurde gesendet!', {
        duration: 5000,
      });
    } catch (error) {
      let errorMessage = 'Fehler beim Senden des Reset-Links. Bitte versuchen Sie es erneut.';
      
      if (error.response?.status === 404) {
        errorMessage = "Kein Benutzer mit dieser E-Mail-Adresse gefunden.";
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <Toaster />
      <div className="max-w-full md:max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <Link href="/">
              <Image
                src={logo.src}
                alt="Bauantrag DE Logo"
                width={180}
                height={60}
              />
            </Link>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Passwort zurücksetzen
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
          </p>
        </div>

        <form className="mt-8 space-y-6 w-full" onSubmit={handleSubmit(onSubmit)}>
          {apiError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{apiError}</span>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                E-Mail-Adresse
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                disabled={isLoading}
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="E-Mail-Adresse"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
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
              {isLoading ? 'Wird gesendet...' : 'Link zum Zurücksetzen senden'}
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="font-medium text-indigo-600">
              Passwort bekannt?{" "}
              <Link href="/" className="text-indigo-600 hover:text-red-500 underline">
                Anmelden
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
    </ProtectedRoute>
  );
};

export default ResetPasswordPage;