import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Warehouse as WarehouseIcon, Plus, Edit2, Trash2, MapPin,
  Mail, Phone, Globe, Loader2, Star,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import Modal from '../components/Modal';
import { EmptyState, PageLoader, ConfirmDialog } from '../components/Shared';
import api from '../api/axios';
import toast from 'react-hot-toast';

const defaultForm = {
  name: '', street: '', city: '', country: '',
  timezone: 'UTC', contactEmail: '', contactPhone: '', isDefault: false,
};

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/warehouses');
      setWarehouses(res.data.data || []);
    } catch {
      toast.error('Failed to load warehouses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWarehouses(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (wh) => {
    setEditing(wh);
    setForm({
      name: wh.name || '',
      street: wh.address?.street || '',
      city: wh.address?.city || '',
      country: wh.address?.country || '',
      timezone: wh.timezone || 'UTC',
      contactEmail: wh.contactEmail || '',
      contactPhone: wh.contactPhone || '',
      isDefault: wh.isDefault || false,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        name: form.name,
        address: { street: form.street, city: form.city, country: form.country },
        timezone: form.timezone,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        isDefault: form.isDefault,
      };

      if (editing) {
        await api.patch(`/warehouses/${editing._id}`, body);
        toast.success('Warehouse updated');
      } else {
        await api.post('/warehouses', body);
        toast.success('Warehouse created');
      }
      setShowModal(false);
      fetchWarehouses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/warehouses/${deleteTarget._id}`);
      toast.success('Warehouse deleted');
      setDeleteTarget(null);
      fetchWarehouses();
    } catch {
      toast.error('Failed to delete warehouse');
    }
  };

  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div>
      <TopBar title="Warehouses" subtitle="Manage your warehouse locations" />

      <div className="p-6 max-w-[1400px] mx-auto space-y-5">
        <div className="flex justify-between items-center">
          <div />
          <button onClick={openCreate} className="btn-primary">
            <Plus className="w-4 h-4" />
            Add Warehouse
          </button>
        </div>

        {loading ? (
          <PageLoader />
        ) : warehouses.length === 0 ? (
          <EmptyState
            icon={WarehouseIcon}
            title="No warehouses yet"
            description="Create your first warehouse to start tracking inventory locations."
            action={
              <button onClick={openCreate} className="btn-primary">
                <Plus className="w-4 h-4" />
                Add Warehouse
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {warehouses.map((wh, i) => (
              <motion.div
                key={wh._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-hover p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center">
                      <WarehouseIcon className="w-5 h-5 text-accent-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-text-primary">{wh.name}</h3>
                        {wh.isDefault && (
                          <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                        )}
                      </div>
                      <span className={`text-xs font-medium ${wh.isActive ? 'text-success' : 'text-text-muted'}`}>
                        {wh.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(wh)} className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteTarget(wh)} className="p-1.5 rounded-lg hover:bg-danger-light text-text-muted hover:text-danger transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {(wh.address?.city || wh.address?.country) && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <MapPin className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                      <span className="truncate">
                        {[wh.address?.street, wh.address?.city, wh.address?.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  {wh.contactEmail && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Mail className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                      <span className="truncate">{wh.contactEmail}</span>
                    </div>
                  )}
                  {wh.contactPhone && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Phone className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                      <span>{wh.contactPhone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{wh.timezone}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Warehouse' : 'Add Warehouse'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">Name *</label>
            <input type="text" required value={form.name} onChange={e => updateField('name', e.target.value)} className="input-field" placeholder="Warehouse name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">Street</label>
              <input type="text" value={form.street} onChange={e => updateField('street', e.target.value)} className="input-field" placeholder="Street address" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">City</label>
              <input type="text" value={form.city} onChange={e => updateField('city', e.target.value)} className="input-field" placeholder="City" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">Country *</label>
              <input type="text" required value={form.country} onChange={e => updateField('country', e.target.value)} className="input-field" placeholder="Country" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">Timezone</label>
              <input type="text" value={form.timezone} onChange={e => updateField('timezone', e.target.value)} className="input-field" placeholder="UTC" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">Contact Email</label>
              <input type="email" value={form.contactEmail} onChange={e => updateField('contactEmail', e.target.value)} className="input-field" placeholder="email@company.com" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">Contact Phone</label>
              <input type="tel" value={form.contactPhone} onChange={e => updateField('contactPhone', e.target.value)} className="input-field" placeholder="+1234567890" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isDefault} onChange={e => updateField('isDefault', e.target.checked)} className="w-4 h-4 rounded border-border text-accent-primary focus:ring-accent-primary" />
            <span className="text-sm text-text-secondary">Set as default warehouse</span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => setShowModal(false)} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Warehouse"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
      />
    </div>
  );
};

export default Warehouses;
