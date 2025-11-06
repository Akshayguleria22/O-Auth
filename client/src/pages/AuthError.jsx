import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

const AuthError = () => {
  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState('');

  useEffect(() => {
    const message = searchParams.get('message') || 'Authentication failed';
    const details = searchParams.get('details') || '';
    
    setErrorMessage(decodeURIComponent(message));
    setErrorDetails(decodeURIComponent(details));
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 text-red-500 rounded-full mb-6">
          <FaExclamationTriangle size={40} />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">Authentication Error</h1>
        
        <p className="text-lg text-gray-700 mb-4">{errorMessage}</p>
        
        {errorDetails && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">{errorDetails}</p>
          </div>
        )}

        <div className="space-y-3">
          <Link to="/login" className="btn btn-primary w-full">
            Try Again
          </Link>
          <Link to="/" className="btn btn-secondary w-full flex items-center justify-center gap-2">
            <FaHome />
            Go Home
          </Link>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Common Issues:</strong>
          </p>
          <ul className="text-sm text-blue-700 mt-2 space-y-1 text-left">
            <li>• Make sure you authorized the application</li>
            <li>• Check if your account has the required permissions</li>
            <li>• Try clearing your browser cache and cookies</li>
            <li>• Ensure the OAuth provider credentials are configured correctly</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AuthError;
