import React, { useState } from 'react';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const SocialLoginButtons = ({ mode = 'login' }) => {
  const { initiateOAuth } = useAuth();
  const [loading, setLoading] = useState({ google: false, github: false });

  const handleSocialLogin = async (provider) => {
    setLoading({ ...loading, [provider]: true });
    try {
      await initiateOAuth(provider);
    } catch (error) {
      setLoading({ ...loading, [provider]: false });
    }
  };

  const buttonText = mode === 'login' ? 'Continue with' : 'Sign up with';

  return (
    <div className="space-y-3 mt-6">
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="text-gray-500 text-sm">or</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      <button
        type="button"
        className="btn btn-google w-full"
        onClick={() => handleSocialLogin('google')}
        disabled={loading.google}
      >
        {loading.google ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin"></div>
        ) : (
          <>
            <FaGoogle size={20} />
            {buttonText} Google
          </>
        )}
      </button>

      <button
        type="button"
        className="btn btn-github w-full"
        onClick={() => handleSocialLogin('github')}
        disabled={loading.github}
      >
        {loading.github ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
        ) : (
          <>
            <FaGithub size={20} />
            {buttonText} GitHub
          </>
        )}
      </button>
    </div>
  );
};

export default SocialLoginButtons;
