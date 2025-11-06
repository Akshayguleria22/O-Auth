import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api';
import { toast } from 'react-toastify';
import { FaGoogle, FaGithub, FaLink, FaUnlink, FaTrash, FaExclamationTriangle } from 'react-icons/fa';

const Settings = () => {
  const { user, linkProvider, unlinkProvider, checkAuth } = useAuth();
  const [linkedProviders, setLinkedProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    fetchLinkedProviders();
  }, []);

  const fetchLinkedProviders = async () => {
    try {
      const response = await userAPI.getLinkedProviders();
      if (response.data.success) {
        setLinkedProviders(response.data.data.providers);
      }
    } catch (error) {
      toast.error('Failed to fetch linked providers');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkProvider = async (provider) => {
    await linkProvider(provider);
  };

  const handleUnlinkProvider = async (provider) => {
    const result = await unlinkProvider(provider);
    if (result.success) {
      fetchLinkedProviders();
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    try {
      const response = await userAPI.deleteAccount();
      if (response.data.success) {
        toast.success('Account deleted successfully');
        window.location.href = '/';
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    }
  };

  const isProviderLinked = (provider) => {
    return linkedProviders.some(p => p.providerType === provider);
  };

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'google':
        return <FaGoogle size={20} />;
      case 'github':
        return <FaGithub size={20} />;
      default:
        return null;
    }
  };

  const providers = [
    { name: 'google', label: 'Google', color: 'red' },
    { name: 'github', label: 'GitHub', color: 'gray' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and linked social accounts</p>
      </div>

      {/* Linked Social Accounts */}
      <div className="card mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Linked Social Accounts</h2>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {providers.map((provider) => {
              const isLinked = isProviderLinked(provider.name);
              const linkedProvider = linkedProviders.find(p => p.providerType === provider.name);

              return (
                <div
                  key={provider.name}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-${provider.color}-100 text-${provider.color}-500 rounded-full flex items-center justify-center`}>
                      {getProviderIcon(provider.name)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{provider.label}</h3>
                      {isLinked ? (
                        <p className="text-sm text-gray-600">
                          Linked • {linkedProvider?.email || 'No email available'}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600">Not linked</p>
                      )}
                    </div>
                  </div>

                  {isLinked ? (
                    <button
                      onClick={() => handleUnlinkProvider(provider.name)}
                      className="btn btn-secondary flex items-center gap-2"
                      disabled={linkedProviders.length === 1 && !user?.password}
                      title={linkedProviders.length === 1 && !user?.password ? 'Cannot unlink the only login method' : ''}
                    >
                      <FaUnlink />
                      Unlink
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLinkProvider(provider.name)}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      <FaLink />
                      Link
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> You need at least one login method. If you don't have a password set, 
            you cannot unlink your only social account.
          </p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-2 border-red-200">
        <div className="flex items-center gap-3 mb-4">
          <FaExclamationTriangle className="text-red-500" size={24} />
          <h2 className="text-2xl font-bold text-red-600">Danger Zone</h2>
        </div>
        
        <p className="text-gray-600 mb-6">
          Once you delete your account, there is no going back. Please be certain.
        </p>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="btn bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
        >
          <FaTrash />
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <FaExclamationTriangle className="text-red-500" size={32} />
              <h3 className="text-2xl font-bold text-gray-800">Delete Account?</h3>
            </div>

            <p className="text-gray-600 mb-4">
              This action cannot be undone. All your data will be permanently deleted.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <strong>DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                className="input"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="btn bg-red-500 hover:bg-red-600 text-white flex-1"
                disabled={deleteConfirmText !== 'DELETE'}
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
