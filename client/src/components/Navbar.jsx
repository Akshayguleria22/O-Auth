import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaCog, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-primary-500 hover:text-primary-600 transition">
            OAuth2 App
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-primary-500 transition">
                  Dashboard
                </Link>
                <Link to="/profile" className="flex items-center gap-2 text-gray-700 hover:text-primary-500 transition">
                  <FaUser /> Profile
                </Link>
                <Link to="/settings" className="flex items-center gap-2 text-gray-700 hover:text-primary-500 transition">
                  <FaCog /> Settings
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-2 text-gray-700 hover:text-primary-500 transition">
                    <FaShieldAlt /> Admin
                  </Link>
                )}
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-2 text-gray-700 hover:text-red-500 transition"
                >
                  <FaSignOutAlt /> Logout
                </button>
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-full">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">
                      {user?.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium text-gray-700 hidden sm:block">
                    {user?.displayName || user?.email}
                  </span>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-500 transition">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
