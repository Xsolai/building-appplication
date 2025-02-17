"use client";
import React, { useState, useEffect, useRef } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import logo from "@/assests/images/logo.svg";

const OTPVerificationPage = () => {
  const [otp, setOTP] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [apiError, setApiError] = useState("");
  const inputRefs = useRef([]);
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    if (emailParam) {
      setUserEmail(emailParam);
      const masked = emailParam.replace(/(.{2})(.*)(@.*)/, '$1***$3');
      setMaskedEmail(masked);
    } else {
      router.push('/signup');
    }
    
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [router]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOTP(prevOTP => {
      const newOTP = [...prevOTP];
      newOTP[index] = element.value;
      return newOTP;
    });

    if (element.value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    switch (e.key) {
      case 'Backspace':
        e.preventDefault();
        setOTP(prevOTP => {
          const newOTP = [...prevOTP];
          newOTP[index] = '';
          return newOTP;
        });
        if (index > 0) {
          inputRefs.current[index - 1].focus();
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (index > 0) {
          inputRefs.current[index - 1].focus();
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (index < 5) {
          inputRefs.current[index + 1].focus();
        }
        break;
      default:
        break;
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOTP = [...otp];
    pastedData.forEach((value, index) => {
      if (index < 6 && !isNaN(value)) {
        newOTP[index] = value;
      }
    });
    setOTP(newOTP);
    const nextEmptyIndex = newOTP.findIndex(val => val === '');
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex].focus();
  };

  const handleSubmit = async () => {
    if (!userEmail) {
      toast.error('Email is missing. Please try registering again.');
      return;
    }

    if (otp.some(digit => digit === '')) {
      toast.error('Please enter the complete verification code.');
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const response = await axios.post('http://18.184.65.167:5000/auth/verify-otp', {
        email: userEmail,
        otp: otp.join(''),
      });

      toast.success(response.data.message || 'Account verified successfully!');
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Verification failed. Please try again.';
      setApiError(errorMessage);
      setOTP(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!userEmail) {
      toast.error('Email is missing. Please try registering again.');
      return;
    }

    try {
      setApiError('');
      const response = await axios.post('http://18.184.65.167:5000/auth/resend-otp', {
        email: userEmail,
        otp: '000000'
      });

      toast.success(response.data.message || 'Verification code resent successfully!');
      setOTP(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to resend code. Please try again.';
      setApiError(errorMessage);
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
              />
            </Link>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verifizierungscode eingeben
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Wir haben einen Code an Ihre E-Mail-Adresse gesendet. Bitte geben Sie den Code ein, um die Verifizierung abzuschließen.
          </p>
          {maskedEmail && (
            <p className="mt-2 text-sm font-medium text-gray-900">
              {maskedEmail}
            </p>
          )}
        </div>

        <div className="mt-8 space-y-6">
          {apiError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{apiError}</span>
            </div>
          )}

          <div className="flex justify-center items-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{1}"
                maxLength="1"
                ref={el => inputRefs.current[index] = el}
                value={digit}
                onChange={e => handleChange(e.target, index)}
                onKeyDown={e => handleKeyDown(e, index)}
                onPaste={handlePaste}
                disabled={isLoading}
                className="w-12 h-12 text-center text-xl font-semibold text-black rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-400 transition-all duration-200"
              />
            ))}
          </div>

          <div>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Wird verifiziert...' : (
                <>
                  <span>Verifizieren</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Keinen Code erhalten?{" "}
              <button
                onClick={handleResendOTP}
                className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
              >
                Code erneut senden
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;