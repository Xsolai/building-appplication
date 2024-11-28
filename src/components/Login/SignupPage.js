"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { EyeOff, Eye } from "lucide-react";
import logo from "@/assests/images/logo.svg";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { z } from 'zod';

const signupSchema = z.object({
  username: z.string().min(1, "Benutzername ist erforderlich"),
  email: z.string().min(1, "E-Mail ist erforderlich").email("Ungültiges E-Mail-Format"),
  password1: z.string()
    .min(8, "Das Passwort muss mindestens 8 Zeichen lang sein")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.])[A-Za-z\d@$!%*#?&.]/,
      "Passwort muss Buchstaben, Zahlen und Sonderzeichen enthalten"
    ),
  password2: z.string().min(1, "Bitte bestätigen Sie Ihr Passwort"),
  contact_number: z.string().regex(/^\d{11}$/, "Die Kontaktnummer muss 11-stellig sein"),
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear errors when user starts typing
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
        const response = await fetch('/api/registration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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

        router.push('/');

      } catch (error) {
        setApiError(error.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
      } finally {
        setIsLoading(false);
      }
    } catch (zodError) {
      const formattedErrors = {};
      zodError.errors.forEach((error) => {
        formattedErrors[error.path[0]] = error.message;
      });
      setErrors(formattedErrors);
    }
  };

  const renderInput = (name, type, placeholder, icon) => (
    <div className="mb-4">
      <div className="relative">
        <label htmlFor={name} className="sr-only">
          {placeholder}
        </label>
        <input
          id={name}
          name={name}
          type={type}
          value={form[name]}
          onChange={handleChange}
          disabled={isLoading}
          className={`appearance-none rounded-md relative block w-full px-3 py-2 ${
            icon ? 'pr-10' : ''
          } border ${
            errors[name] ? 'border-red-500' : 'border-gray-300'
          } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
          placeholder={placeholder}
        />
        {icon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {icon}
          </div>
        )}
      </div>
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen py-20 bg-white flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
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
            Sign Up
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Erstellen Sie ein neues Konto, um mit unserer Plattform zu beginnen.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {apiError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{apiError}</span>
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            {renderInput('username', 'text', 'Benutzername')}
            {renderInput('email', 'email', 'E-Mail-Adresse')}
            {renderInput('contact_number', 'tel', 'Kontaktnummer')}
            {renderInput('password1', showPassword ? 'text' : 'password', 'Passwort', 
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none">
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            )}
            {renderInput('password2', showConfirmPassword ? 'text' : 'password', 'Passwort bestätigen',
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="focus:outline-none">
                {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Registrierung...' : 'Sign Up'}
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="font-medium text-indigo-600">
              Sie haben bereits ein Konto?{" "}
              <Link href="/" className="text-indigo-600 hover:text-red-500 underline">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;