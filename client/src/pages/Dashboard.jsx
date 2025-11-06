import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api';
import { FaShieldAlt, FaUser, FaClock, FaGoogle, FaGithub } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const [authLogs, setAuthLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuthLogs();
  }, []);

  const fetchAuthLogs = async () => {
    try {
      const response = await userAPI.getAuthLogs({ limit: 5 });
      if (response.data.success) {
        setAuthLogs(response.data.data.logs);
      }
    } catch (error) {
      toast.error('Failed to fetch authentication logs');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'google':
        return <FaGoogle className="text-red-500" />;
      case 'github':
        return <FaGithub className="text-gray-800" />;
      default:
        return <FaUser className="text-gray-500" />;
    }
  };

  const getProviderBadge = (provider) => {
    const styles = {
      google: 'bg-red-100 text-red-800',
      github: 'bg-gray-100 text-gray-800',
      local: 'bg-gray-100 text-gray-800',
    };
    return styles[provider] || styles.local;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.displayName || user?.email}!</p>
      </div>

      {/* User Info Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 text-primary-500 rounded-full flex items-center justify-center">
              <FaUser size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold text-gray-800">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary-100 text-secondary-500 rounded-full flex items-center justify-center">
              <FaShieldAlt size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <p className="font-semibold text-gray-800 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 text-green-500 rounded-full flex items-center justify-center">
              <FaClock size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Login</p>
              <p className="font-semibold text-gray-800">
                {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Providers */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Linked Accounts</h2>
        <div className="flex flex-wrap gap-3">
          {user?.providers && user.providers.length > 0 ? (
            user.providers.map((provider) => (
              <div
                key={provider._id}
                className={`flex items-center gap-2 px-4 py-2 rounded-full ${getProviderBadge(provider.providerType)}`}
              >
                {getProviderIcon(provider.providerType)}
                <span className="font-medium capitalize">{provider.providerType}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No social accounts linked yet</p>
          )}
        </div>
      </div>

      {/* Recent Authentication Logs */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Activity</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="spinner"></div>
          </div>
        ) : authLogs.length > 0 ? (
          <div className="space-y-3">
            {authLogs.map((log) => (
              <div
                key={log._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getProviderBadge(log.provider)}`}>
                    {getProviderIcon(log.provider)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 capitalize">
                      {log.action === 'oauth_login' ? 'OAuth Login' : log.action.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {log.ipAddress} • {log.userAgent ? log.userAgent.substring(0, 50) : 'Unknown device'}...
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    log.status === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {log.status}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">{formatDate(log.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No recent activity</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
