import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaSave } from 'react-icons/fa';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    displayName: user?.displayName || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await userAPI.updateProfile(formData);
      if (response.data.success) {
        updateUser(response.data.data.user);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your personal information</p>
      </div>

      <div className="card">
        {/* Profile Picture */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
          <div className="relative">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-primary-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary-500 text-white flex items-center justify-center text-3xl font-bold border-4 border-primary-100">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{user?.displayName || user?.email}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                <FaUser className="inline mr-2" />
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className="input"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                <FaUser className="inline mr-2" />
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className="input"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
              <FaUser className="inline mr-2" />
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              className="input"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="How should we call you?"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              <FaEnvelope className="inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="input bg-gray-100"
              value={formData.email}
              disabled
              title="Email cannot be changed"
            />
            <p className="mt-1 text-sm text-gray-500">Email address cannot be changed</p>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <FaSave className="inline mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Account Information */}
      <div className="card mt-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Account Information</h2>
        <div className="space-y-4">
          <div className="flex justify-between py-3 border-b border-gray-200">
            <span className="text-gray-600">Account Created</span>
            <span className="font-semibold text-gray-800">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-200">
            <span className="text-gray-600">Last Login</span>
            <span className="font-semibold text-gray-800">
              {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-gray-600">Account Status</span>
            <span className={`font-semibold ${user?.isActive ? 'text-green-600' : 'text-red-600'}`}>
              {user?.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
