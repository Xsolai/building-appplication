"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { EyeOff, Eye } from "lucide-react";
import logo from "@/assests/images/logo.svg"
import Image from "next/image";

const SignupPage = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
  });

  const [errors, setErrors] = useState({});
  const [isRegistrationSuccessful, setIsRegistrationSuccessful] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let errors = {};
    if (!form.username) errors.username = "Benutzername ist erforderlich";
    if (!form.email) {
      errors.email = "E-Mail ist erforderlich";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Ungültiges E-Mail-Format";
    }
    if (!form.password) {
      errors.password = "Passwort ist erforderlich";
    } else if (form.password.length < 6) {
      errors.password = "Das Passwort muss mindestens 6 Zeichen lang sein";
    }
    if (!form.confirmPassword) {
      errors.confirmPassword = "Bitte bestätigen Sie Ihr Passwort";
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = "Passwörter stimmen nicht überein";
    }
    if (!form.contactNumber) {
      errors.contactNumber = "Kontaktnummer ist erforderlich";
    } else if (!/^\d{11}$/.test(form.contactNumber)) {
      errors.contactNumber = "Die Kontaktnummer muss 11-stellig sein";
    }
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      console.log("Formular eingereicht", form);
      setIsRegistrationSuccessful(true);
    } else {
      setErrors(validationErrors);
    }
  };

  const renderInput = (name, type, placeholder, icon) => (
    <div className="">
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
      {errors[name] && <p className="text-red-500 text-xs my-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen py-20 bg-white flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-full md:max-w-md w-full space-y-8">
        <div className="text-center">
        <div className="flex items-center justify-center">
          <Link href="/">
              <Image
                src={logo.src} // Ensure you have this logo in your public folder
                alt="Bauantrag DE Logo"
                width={180}
                height={60}
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

        {isRegistrationSuccessful ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Ihre Registrierung ist erfolgreich!</strong>
            <span className="block sm:inline"> Sie können sich jetzt bei Ihrem Konto anmelden.</span>
            <div className="mt-4">
              <Link
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Gehen Sie zu Anmelden
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              {renderInput('username', 'text', 'Benutzername')}
              {renderInput('email', 'email', 'E-Mail-Adresse')}
              {renderInput('contactNumber', 'tel', 'Kontaktnummer')}
              {renderInput('password', showPassword ? 'text' : 'password', 'Passwort', 
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none inline-flex justify-center items-center place-content-center">
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              )}
              {renderInput('confirmPassword', showConfirmPassword ? 'text' : 'password', 'Passwort bestätigen',
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="focus:outline-none">
                  {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign Up
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
        )}
      </div>
    </div>
  );
};

export default SignupPage;