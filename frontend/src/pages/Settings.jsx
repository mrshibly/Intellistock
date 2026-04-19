import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Building2, Shield, Bell, Loader2 } from 'lucide-react';
import TopBar from '../components/TopBar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });

  const handleProfileSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await api.patch('/users/me', profile); toast.success('Profile updated'); }
    catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await api.patch('/users/me/password', { currentPassword: passwords.current, newPassword: passwords.newPass });
      toast.success('Password changed'); setPasswords({ current: '', newPass: '', confirm: '' });
    } catch { toast.error('Failed to change password'); }
    finally { setSaving(false); }
  };

  const sections = [
    { icon: User, title: 'Profile', desc: 'Manage your account details',
      content: (
        <form onSubmit={handleProfileSave} className="space-y-4 max-w-md">
          <div className="space-y-1.5"><label className="text-sm font-medium text-text-secondary">Full Name</label>
            <input type="text" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="input-field" /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium text-text-secondary">Email</label>
            <input type="email" value={profile.email} disabled className="input-field opacity-60 cursor-not-allowed" /></div>
          <button type="submit" disabled={saving} className="btn-primary btn-sm">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Changes
          </button>
        </form>
      )
    },
    { icon: Shield, title: 'Security', desc: 'Change your password',
      content: (
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div className="space-y-1.5"><label className="text-sm font-medium text-text-secondary">Current Password</label>
            <input type="password" required value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} className="input-field" /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium text-text-secondary">New Password</label>
            <input type="password" required minLength={6} value={passwords.newPass} onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))} className="input-field" /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium text-text-secondary">Confirm New Password</label>
            <input type="password" required value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} className="input-field" /></div>
          <button type="submit" disabled={saving} className="btn-primary btn-sm">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Change Password
          </button>
        </form>
      )
    },
    { icon: Building2, title: 'Organization', desc: 'Your organization settings',
      content: (
        <div className="space-y-3 text-sm max-w-md">
          <div className="flex justify-between py-2 border-b border-border-light">
            <span className="text-text-muted">Organization</span>
            <span className="font-medium text-text-primary">{user?.orgId || '—'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border-light">
            <span className="text-text-muted">Role</span>
            <span className="badge-info">{user?.role || 'member'}</span>
          </div>
          <p className="text-xs text-text-muted pt-2">Contact your admin to change organization settings.</p>
        </div>
      )
    },
    { icon: Bell, title: 'Notifications', desc: 'Configure alert preferences',
      content: (
        <div className="space-y-3 max-w-md">
          {['Low stock alerts', 'Purchase order updates', 'AI forecast ready'].map(label => (
            <label key={label} className="flex items-center justify-between py-2 border-b border-border-light cursor-pointer">
              <span className="text-sm text-text-secondary">{label}</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border text-accent-primary focus:ring-accent-primary" />
            </label>
          ))}
          <p className="text-xs text-text-muted pt-2">Notification delivery coming soon.</p>
        </div>
      )
    },
  ];

  return (
    <div>
      <TopBar title="Settings" subtitle="Manage your account and preferences" />
      <div className="p-6 max-w-[900px] mx-auto space-y-5">
        {sections.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center">
                <s.icon className="w-5 h-5 text-accent-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">{s.title}</h3>
                <p className="text-xs text-text-muted">{s.desc}</p>
              </div>
            </div>
            {s.content}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
