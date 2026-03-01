import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiSearch, FiUser, FiMail, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import './Admin.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingOrganizer, setCreatingOrganizer] = useState(false);
  const [newOrganizer, setNewOrganizer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await usersAPI.getAll();
      setUsers(res.data.users || res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const existingUser = users.find((u) => u._id === userId);
    if (existingUser?.role === 'admin' && newRole !== 'admin') {
      toast.error('Admin role cannot be changed to another role');
      return;
    }

    try {
      await usersAPI.updateRole(userId, newRole);
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role: newRole } : u));
      toast.success('User role updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleCreateOrganizer = async (e) => {
    e.preventDefault();

    if (!newOrganizer.firstName.trim() || !newOrganizer.lastName.trim() || !newOrganizer.email.trim() || !newOrganizer.password) {
      toast.error('All fields are required');
      return;
    }

    setCreatingOrganizer(true);
    try {
      await usersAPI.createOrganizer(newOrganizer);
      toast.success('Organizer account created');
      setShowCreateModal(false);
      setNewOrganizer({ firstName: '', lastName: '', email: '', password: '' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create organizer');
    } finally {
      setCreatingOrganizer(false);
    }
  };

  const handleDeleteOrganizer = async (user) => {
    if (user.role !== 'organizer') {
      toast.error('Only organizer accounts can be deleted here');
      return;
    }

    if (!window.confirm(`Delete organizer ${user.firstName} ${user.lastName}? This cannot be undone.`)) {
      return;
    }

    try {
      await usersAPI.deleteOrganizer(user._id);
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
      toast.success('Organizer deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete organizer');
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch = !search ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="admin-page">
      <div className="container">
        <div className="page-header-row">
          <div>
            <h1>Manage Users</h1>
            <p>{users.length} total users</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <FiPlus /> Create Organizer
          </button>
        </div>

        <div className="admin-filters">
          <div className="search-input-wrapper">
            <FiSearch />
            <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="organizer">Organizer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Provider</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-sm">
                        {user.avatar ? <img src={user.avatar} alt="" /> : <FiUser />}
                      </div>
                      <span>{user.firstName} {user.lastName}</span>
                    </div>
                  </td>
                  <td><span className="email-cell"><FiMail /> {user.email}</span></td>
                  <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                  <td><span className="provider-badge">{user.authProvider || 'local'}</span></td>
                  <td>{format(new Date(user.createdAt), 'MMM d, yyyy')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="role-select"
                        disabled={user.role === 'admin'}
                        title={user.role === 'admin' ? 'Admin role cannot be changed' : 'Change user role'}
                      >
                        <option value="user">User</option>
                        <option value="organizer">Organizer</option>
                        <option value="admin">Admin</option>
                      </select>
                      {user.role === 'organizer' && (
                        <button
                          onClick={() => handleDeleteOrganizer(user)}
                          className="btn btn-danger"
                          style={{ padding: '0.45rem 0.7rem' }}
                          title="Delete Organizer"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create Organizer</h2>
                <button onClick={() => setShowCreateModal(false)}><FiX /></button>
              </div>

              <form onSubmit={handleCreateOrganizer}>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newOrganizer.firstName}
                      onChange={(e) => setNewOrganizer((prev) => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newOrganizer.lastName}
                      onChange={(e) => setNewOrganizer((prev) => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={newOrganizer.email}
                    onChange={(e) => setNewOrganizer((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Temporary Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={newOrganizer.password}
                    onChange={(e) => setNewOrganizer((prev) => ({ ...prev, password: e.target.value }))}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={creatingOrganizer}>
                    {creatingOrganizer ? <LoadingSpinner size="small" text="" /> : 'Create Organizer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
