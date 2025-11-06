import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaShieldAlt, FaLock, FaUserCheck, FaCloud } from 'react-icons/fa';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="text-center py-20 px-4 bg-gradient-to-b from-transparent to-white/10">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Secure OAuth2 Social Login
        </h1>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Enterprise-grade authentication with Google and GitHub integration
        </p>
        
        {!isAuthenticated ? (
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register" className="btn btn-primary text-lg px-8 py-4">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary text-lg px-8 py-4">
              Sign In
            </Link>
          </div>
        ) : (
          <Link to="/dashboard" className="btn btn-primary text-lg px-8 py-4">
            Go to Dashboard
          </Link>
        )}
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Key Features
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-500 rounded-full mb-4">
                <FaShieldAlt size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Secure Authentication</h3>
              <p className="text-gray-600">OAuth2 with PKCE, state validation, and CSRF protection</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-500 rounded-full mb-4">
                <FaCloud size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Social Login</h3>
              <p className="text-gray-600">Seamless integration with Google and GitHub</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-500 rounded-full mb-4">
                <FaUserCheck size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Account Linking</h3>
              <p className="text-gray-600">Link multiple providers to a single account</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-500 rounded-full mb-4">
                <FaLock size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">JWT Sessions</h3>
              <p className="text-gray-600">Short-lived tokens with refresh strategy in httpOnly cookies</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Built With Modern Technologies
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['React', 'Node.js', 'Express', 'MongoDB', 'OAuth2', 'JWT'].map((tech) => (
              <span
                key={tech}
                className="px-6 py-3 bg-white rounded-full font-semibold text-primary-500 shadow-md hover:shadow-lg transition"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
