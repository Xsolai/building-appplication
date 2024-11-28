// ForgotPasswordPage.js
"use client";
import React, { useState } from "react";
import Link from "next/link";
import logo from "@/assests/images/logo.svg";
import Image from "next/image";

const ForgotPasswordPage = () => {
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    if (!forgotPasswordEmail) {
      setErrors({ email: "E-Mail ist erforderlich" });
      return;
    }
    // Here you would typically call an API to handle the password reset
    console.log("Passwort-Reset angefordert für:", forgotPasswordEmail);
    setResetSuccess(true);
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
            Passwort vergessen
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
          </p>
        </div>

        {resetSuccess ? (
          <div className="text-center text-green-600">
            <p>
              If an account exists for {forgotPasswordEmail}, you will receive a password reset link shortly.
            </p>
            <Link
              href="/"
              className="mt-4 font-medium text-indigo-600 hover:text-indigo-500 block"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6 w-full" onSubmit={handleForgotPasswordSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                  placeholder="E-Mail-Adresse"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Passwort zurücksetzen
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

export default ForgotPasswordPage;