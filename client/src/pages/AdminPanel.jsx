import React, { useState, useEffect } from 'react';
import { userAPI } from '../api';
import { toast } from 'react-toastify';
import { FaUsers, FaShieldAlt, FaCrown, FaUser, FaSearch } from 'react-icons/fa';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    users: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAllUsers();
      if (response.data.success) {
        const allUsers = response.data.data.users;
        setUsers(allUsers);
        
        // Calculate stats
        setStats({
          total: allUsers.length,
          admins: allUsers.filter(u => u.role === 'admin').length,
          users: allUsers.filter(u => u.role === 'user').length,
        });
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await userAPI.updateUserRole(userId, newRole);
      if (response.data.success) {
        toast.success('User role updated successfully');
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user role');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-800',
      user: 'bg-blue-100 text-blue-800',
    };
    return styles[role] || styles.user;
  };

  const getRoleIcon = (role) => {
    return role === 'admin' ? <FaCrown /> : <FaUser />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Panel</h1>
        <p className="text-gray-600">Manage users and roles</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 text-primary-500 rounded-full flex items-center justify-center">
              <FaUsers size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 text-purple-500 rounded-full flex items-center justify-center">
              <FaShieldAlt size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-800">{stats.admins}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center">
              <FaUser size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Regular Users</p>
              <p className="text-2xl font-bold text-gray-800">{stats.users}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by email or name..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Providers</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">
                            {user.email.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-gray-800">
                          {user.displayName || 'No Name'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{user.email}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadge(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        {user.providers.map((provider) => (
                          <span
                            key={provider._id}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium capitalize"
                          >
                            {provider.providerType}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="input py-1 text-sm"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-12 text-gray-600">No users found</p>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
