"use client";
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import logo from "@/assests/images/logo.svg";
import axios from 'axios';

const passwordSchema = z
  .string()
  .min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein')
  .regex(/[A-Z]/, 'Das Passwort muss mindestens einen Großbuchstaben enthalten')
  .regex(/[a-z]/, 'Das Passwort muss mindestens einen Kleinbuchstaben enthalten')
  .regex(/[0-9]/, 'Das Passwort muss mindestens eine Zahl enthalten')
  .regex(/[^A-Za-z0-9]/, 'Das Passwort muss mindestens ein Sonderzeichen enthalten');

const formSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Die Passwörter stimmen nicht überein",
  path: ["confirmPassword"],
});

const ResetPasswordFormPage = ({ params }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema)
  });

  useEffect(() => {
    if (params?.token) {
      setToken(params.token);
    } else {
      toast.error('Ungültiger Reset-Token');
      router.push('/');
    }
  }, [params, router]);

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Ungültiger Reset-Token');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('https://app.saincube.com/app1/auth/reset-password/', {
        token: token,
        new_password: data.password,
        confirm_password: data.confirmPassword
      });

      toast.success(response.data.message || 'Passwort erfolgreich zurückgesetzt!');
      
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      let errorMessage = 'Fehler beim Zurücksetzen des Passworts. Bitte versuchen Sie es erneut.';
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.status === 404) {
        errorMessage = "Der Reset-Token ist ungültig oder abgelaufen.";
        setTimeout(() => {
          router.push('/reset-password');
        }, 2000);
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
                priority
              />
            </Link>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Neues Passwort erstellen
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Bitte geben Sie Ihr neues Passwort ein und bestätigen Sie es.
          </p>
        </div>

        <form className="mt-8 space-y-6 w-full" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Neues Passwort
              </label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                disabled={isLoading}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Neues Passwort"
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
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="relative">
              <label htmlFor="confirmPassword" className="sr-only">
                Passwort bestätigen
              </label>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                disabled={isLoading}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Passwort bestätigen"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
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
              {isLoading ? 'Wird zurückgesetzt...' : 'Passwort zurücksetzen'}
            </button>
          </div>

          <div className="text-center mt-4">
            <Link
              href="/"
              className="font-medium text-indigo-600 hover:text-red-500"
            >
              Zurück zum Anmelden
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordFormPage;