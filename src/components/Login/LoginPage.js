// LoginPage.js
"use client";
import React, { useState } from "react";
import { EyeOff, Eye } from "lucide-react";
import Link from "next/link";
import logo from "@/assests/images/logo.svg";
import Image from "next/image";
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const router = useRouter();
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
    setApiError('');
  };

  const validateLoginForm = () => {
    let formErrors = {};
    if (!loginData.username) {
      formErrors.username = "Benutzername oder E-Mail ist erforderlich";
    }
    if (!loginData.password) {
      formErrors.password = "Passwort ist erforderlich";
    }
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (validateLoginForm()) {
      setIsLoading(true);
      setApiError('');

      try {
        const formData = new URLSearchParams();
        formData.append('grant_type', 'password');
        formData.append('username', loginData.username);
        formData.append('password', loginData.password);

        const response = await fetch('https://solasolution.ecomtask.de/building-app/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Login failed');
        }

        localStorage.setItem('access_token', data.access_token);
        router.push('/dashboard');

      } catch (error) {
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
            Anmelden
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Das Portal für eine schnelle und effiziente Bearbeitung von Bauanträgen mit KI-unterstützter Prüfung. Bitte melden Sie sich an, um den Status Ihrer Bauprojekte zuverfolgen und Dokumente einzureichen.
          </p>
        </div>

        <form className="mt-8 space-y-6 w-full" onSubmit={handleLoginSubmit}>
          {apiError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{apiError}</span>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                User name or e-mail address
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={loginData.username}
                onChange={handleLoginChange}
                disabled={isLoading}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.username ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="E-Mail Adresse"
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={loginData.password}
                onChange={handleLoginChange}
                disabled={isLoading}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Passwort"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link
                href="/reset-password"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Passwort vergessen?
              </Link>
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
              {isLoading ? 'Wird eingeloggt...' : 'Login'}
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="font-medium text-indigo-600">
              Sie haben noch kein Konto?{" "}
              <Link href="/signup" className="text-indigo-600 hover:text-red-500 underline">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;