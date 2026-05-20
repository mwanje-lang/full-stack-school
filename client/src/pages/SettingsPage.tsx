import React, { useState, useEffect } from 'react';
import { Settings, Save, Upload } from 'lucide-react';
import { api } from '../services/api';
import type { SchoolSettings } from '../types';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState<SchoolSettings>({
    id: '1', schoolName: 'My School', address: '', phone: '', email: '', website: '',
    currency: 'USD', language: 'en', timezone: 'UTC', currentTerm: 'Term 1', currentYear: '2026', schoolLogo: '', schoolBadge: ''
  });

  useEffect(() => { api.get('/settings').then(setSettings).catch(() => {}); }, []);

  const handleSave = async () => {
    try { await api.put('/settings', settings); toast.success('Settings saved'); } catch { toast.error('Failed to save'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl"><Settings size={24} className="text-gray-600" /></div>
          <div><h1 className="text-2xl font-bold">Settings</h1><p className="text-sm text-gray-500">School configuration</p></div>
        </div>
        <button onClick={handleSave} className="btn-primary flex items-center gap-2"><Save size={18} /> Save Settings</button>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">School Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">School Name *</label><input className="input-field" value={settings.schoolName} onChange={e => setSettings({...settings, schoolName: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" className="input-field" value={settings.email} onChange={e => setSettings({...settings, email: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">Phone</label><input className="input-field" value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">Website</label><input className="input-field" value={settings.website || ''} onChange={e => setSettings({...settings, website: e.target.value})} /></div>
          <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Address</label><textarea className="input-field" rows={2} value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} /></div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">School Badge & Logo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <p className="text-sm font-medium mb-2">School Badge</p>
            <div className="w-32 h-32 mx-auto border-2 border-dashed rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-700">
              {settings.schoolBadge ? <img src={settings.schoolBadge} alt="badge" className="w-full h-full object-contain rounded-xl" /> : <Upload size={24} className="text-gray-400" />}
            </div>
            <input type="file" accept="image/*" className="mt-2 text-sm" onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => setSettings({...settings, schoolBadge: r.result as string}); r.readAsDataURL(f); } }} />
            <p className="text-xs text-gray-500 mt-1">Appears on report cards (top center)</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium mb-2">School Logo</p>
            <div className="w-32 h-32 mx-auto border-2 border-dashed rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-700">
              {settings.schoolLogo ? <img src={settings.schoolLogo} alt="logo" className="w-full h-full object-contain rounded-xl" /> : <Upload size={24} className="text-gray-400" />}
            </div>
            <input type="file" accept="image/*" className="mt-2 text-sm" onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => setSettings({...settings, schoolLogo: r.result as string}); r.readAsDataURL(f); } }} />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">Academic Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Current Term</label>
            <select className="input-field" value={settings.currentTerm} onChange={e => setSettings({...settings, currentTerm: e.target.value})}>
              <option>Term 1</option><option>Term 2</option><option>Term 3</option>
            </select></div>
          <div><label className="block text-sm font-medium mb-1">Current Year</label><input className="input-field" value={settings.currentYear} onChange={e => setSettings({...settings, currentYear: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">Currency</label>
            <select className="input-field" value={settings.currency} onChange={e => setSettings({...settings, currency: e.target.value})}>
              <option value="USD">USD ($)</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="UGX">UGX</option><option value="KES">KES</option><option value="NGN">NGN</option>
            </select></div>
          <div><label className="block text-sm font-medium mb-1">Language</label>
            <select className="input-field" value={settings.language} onChange={e => setSettings({...settings, language: e.target.value})}>
              <option value="en">English</option><option value="fr">French</option><option value="sw">Swahili</option><option value="es">Spanish</option>
            </select></div>
        </div>
      </div>
    </div>
  );
}
