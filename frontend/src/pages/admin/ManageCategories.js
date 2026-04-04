import React, { useState, useEffect } from 'react';
import { categoriesAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Admin.css';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', icon: '📌', color: '#6366f1' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoriesAPI.getAll();
      setCategories(res.data.categories || res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setFormData({ name: '', description: '', icon: '📌', color: '#6366f1' });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setFormData({ name: cat.name, description: cat.description || '', icon: cat.icon || '📌', color: cat.color || '#6366f1' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error('Name is required'); return; }

    setSaving(true);
    try {
      if (editing) {
        await categoriesAPI.update(editing._id, formData);
        toast.success('Category updated');
      } else {
        await categoriesAPI.create(formData);
        toast.success('Category created');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoriesAPI.delete(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="admin-page">
      <div className="container">
        <div className="page-header-row">
          <div>
            <h1>Manage Categories</h1>
            <p>{categories.length} categories</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <FiPlus /> Add Category
          </button>
        </div>

        <div className="categories-grid">
          {categories.map((cat) => (
            <div key={cat._id} className="category-card">
              <div className="cat-icon" style={{ background: cat.color + '20', color: cat.color }}>
                {cat.icon || '📌'}
              </div>
              <div className="cat-info">
                <h3>{cat.name}</h3>
                <p>{cat.description || 'No description'}</p>
                <span className="cat-count">{cat.eventCount || 0} events</span>
              </div>
              <div className="cat-actions">
                <button onClick={() => openEdit(cat)}><FiEdit2 /></button>
                <button onClick={() => handleDelete(cat._id)} className="delete-btn"><FiTrash2 /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editing ? 'Edit Category' : 'New Category'}</h2>
                <button onClick={() => setShowModal(false)}><FiX /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-control"
                    placeholder="Category name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-control"
                    rows={3}
                    placeholder="Short description"
                  />
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Icon (emoji)</label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="form-control"
                      maxLength={4}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Color</label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="form-control color-input"
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <LoadingSpinner size="small" text="" /> : (editing ? 'Update' : 'Create')}
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

export default ManageCategories;
