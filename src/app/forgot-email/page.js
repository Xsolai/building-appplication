// ForgotEmailPage.js
"use client";
import React, { useState } from "react";
import Link from "next/link";
import logo from "@/assests/images/logo.svg";
import Image from "next/image";

const ForgotEmailPage = () => {
  const [forgotEmailData, setForgotEmailData] = useState({
    fullName: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [emailRecoverySuccess, setEmailRecoverySuccess] = useState(false);

  const handleForgotEmailChange = (e) => {
    setForgotEmailData({ ...forgotEmailData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const validateForgotEmailForm = () => {
    let formErrors = {};
    if (!forgotEmailData.fullName) formErrors.fullName = "Der vollständige Name ist erforderlich";
    if (!forgotEmailData.phoneNumber) formErrors.phoneNumber = "Telefonnummer ist erforderlich";
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    if (validateForgotEmailForm()) {
      setIsLoading(true);
      setApiError('');

      try {
        const response = await fetch('http://localhost:8000/forgot-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: forgotEmailData.fullName,
            phone_number: forgotEmailData.phoneNumber,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Email recovery failed');
        }

        setEmailRecoverySuccess(true);
        setApiError('');
        
      } catch (error) {
        setEmailRecoverySuccess(false);
        setApiError(error.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
      } finally {
        setIsLoading(false);
      }
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
              />
            </Link>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            E-Mail vergessen
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Geben Sie Ihren vollständigen Namen und Ihre Telefonnummer ein, um Ihre E-Mail-Adresse wiederherzustellen.
          </p>
        </div>

        {emailRecoverySuccess ? (
          <div className="text-center text-green-600">
            <p>
              If an account matches the provided information, you will receive an email with your username shortly.
            </p>
            <Link
              href="/"
              className="mt-4 font-medium text-indigo-600 hover:text-indigo-500 block"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6 w-full" onSubmit={handleForgotEmailSubmit}>
            {apiError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{apiError}</span>
              </div>
            )}

            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="fullName" className="sr-only">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={forgotEmailData.fullName}
                  onChange={handleForgotEmailChange}
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                  placeholder="Benutzername"
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <label htmlFor="phoneNumber" className="sr-only">Phone Number</label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={forgotEmailData.phoneNumber}
                  onChange={handleForgotEmailChange}
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                  placeholder="Telefonnummer"
                />
                {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
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
                {isLoading ? 'Wird verarbeitet...' : 'E-Mail wiederherstellen'}
              </button>
            </div>

            <div className="text-center mt-4">
              <Link
                href="/"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Zurück zum Anmelden
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotEmailPage;