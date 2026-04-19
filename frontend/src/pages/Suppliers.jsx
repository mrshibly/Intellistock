import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Plus, Edit2, Trash2, Mail, Phone, Clock, Loader2 } from 'lucide-react';
import TopBar from '../components/TopBar';
import Modal from '../components/Modal';
import { EmptyState, PageLoader, ConfirmDialog } from '../components/Shared';
import api from '../api/axios';
import toast from 'react-hot-toast';

const defaultForm = { name:'', email:'', phone:'', address:'', leadTimeDays:7, paymentTerms:'', currency:'USD', notes:'' };

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetch = async () => {
    setLoading(true);
    try { const r = await api.get('/suppliers'); setSuppliers(r.data.data||[]); }
    catch { toast.error('Failed to load suppliers'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (s) => {
    setEditing(s);
    setForm({ name:s.name||'', email:s.email||'', phone:s.phone||'', address:s.address||'',
      leadTimeDays:s.leadTimeDays||7, paymentTerms:s.paymentTerms||'', currency:s.currency||'USD', notes:s.notes||'' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) { await api.patch(`/suppliers/${editing._id}`, form); toast.success('Supplier updated'); }
      else { await api.post('/suppliers', form); toast.success('Supplier created'); }
      setShowModal(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message||'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await api.delete(`/suppliers/${deleteTarget._id}`); toast.success('Deleted'); setDeleteTarget(null); fetch(); }
    catch { toast.error('Failed to delete'); }
  };

  const up = (k,v) => setForm(p=>({...p,[k]:v}));
  const filtered = suppliers.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <TopBar title="Suppliers" subtitle="Manage your vendor relationships" />
      <div className="p-6 max-w-[1400px] mx-auto space-y-5">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search suppliers..." className="input-field !w-64" />
          <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" />Add Supplier</button>
        </div>

        {loading ? <PageLoader /> : filtered.length===0 ? (
          <EmptyState icon={Truck} title={search?'No matches':'No suppliers yet'} description={search?'Try a different search.':'Add your first supplier.'} action={!search && <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" />Add Supplier</button>} />
        ) : (
          <div className="table-container"><div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="table-header">
              <th className="text-left px-5 py-3 font-semibold text-text-secondary">Supplier</th>
              <th className="text-left px-5 py-3 font-semibold text-text-secondary">Contact</th>
              <th className="text-left px-5 py-3 font-semibold text-text-secondary">Address</th>
              <th className="text-center px-5 py-3 font-semibold text-text-secondary">Lead Time</th>
              <th className="text-center px-5 py-3 font-semibold text-text-secondary">Currency</th>
              <th className="text-right px-5 py-3 font-semibold text-text-secondary">Actions</th>
            </tr></thead>
            <tbody>{filtered.map((s,i)=>(
              <motion.tr key={s._id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.02}} className="table-row">
                <td className="px-5 py-3.5"><div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center"><Truck className="w-4 h-4 text-accent-primary" /></div>
                  <span className="font-semibold text-text-primary">{s.name}</span>
                </div></td>
                <td className="px-5 py-3.5 space-y-0.5">
                  {s.email && <div className="flex items-center gap-1.5 text-xs text-text-secondary"><Mail className="w-3 h-3 text-text-muted" />{s.email}</div>}
                  {s.phone && <div className="flex items-center gap-1.5 text-xs text-text-secondary"><Phone className="w-3 h-3 text-text-muted" />{s.phone}</div>}
                </td>
                <td className="px-5 py-3.5 text-text-muted text-xs max-w-[180px] truncate">{s.address||'—'}</td>
                <td className="px-5 py-3.5 text-center"><span className="badge-info"><Clock className="w-3 h-3" />{s.leadTimeDays}d</span></td>
                <td className="px-5 py-3.5 text-center"><span className="badge-neutral">{s.currency}</span></td>
                <td className="px-5 py-3.5"><div className="flex justify-end gap-1">
                  <button onClick={()=>openEdit(s)} className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={()=>setDeleteTarget(s)} className="p-1.5 rounded-lg hover:bg-danger-light text-text-muted hover:text-danger transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div></td>
              </motion.tr>
            ))}</tbody>
          </table></div></div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={()=>setShowModal(false)} title={editing?'Edit Supplier':'Add Supplier'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5"><label className="text-sm font-medium text-text-secondary">Name *</label>
            <input type="text" required value={form.name} onChange={e=>up('name',e.target.value)} className="input-field" placeholder="Supplier name" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium text-text-secondary">Email</label>
              <input type="email" value={form.email} onChange={e=>up('email',e.target.value)} className="input-field" placeholder="email@vendor.com" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium text-text-secondary">Phone</label>
              <input type="tel" value={form.phone} onChange={e=>up('phone',e.target.value)} className="input-field" placeholder="+1234567890" /></div>
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium text-text-secondary">Address</label>
            <input type="text" value={form.address} onChange={e=>up('address',e.target.value)} className="input-field" placeholder="Full address" /></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium text-text-secondary">Lead Time (days)</label>
              <input type="number" min="0" value={form.leadTimeDays} onChange={e=>up('leadTimeDays',Number(e.target.value))} className="input-field" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium text-text-secondary">Currency</label>
              <select value={form.currency} onChange={e=>up('currency',e.target.value)} className="input-field">
                <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="BDT">BDT</option>
              </select></div>
            <div className="space-y-1.5"><label className="text-sm font-medium text-text-secondary">Payment Terms</label>
              <input type="text" value={form.paymentTerms} onChange={e=>up('paymentTerms',e.target.value)} className="input-field" placeholder="Net 30" /></div>
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium text-text-secondary">Notes</label>
            <textarea rows={2} value={form.notes} onChange={e=>up('notes',e.target.value)} className="input-field resize-none" placeholder="Additional notes..." /></div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={()=>setShowModal(false)} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving&&<Loader2 className="w-4 h-4 animate-spin" />}{editing?'Update':'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={()=>setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Supplier" message={`Delete "${deleteTarget?.name}"? This cannot be undone.`} />
    </div>
  );
};

export default Suppliers;
