import React, { useState, useEffect } from 'react';
import { Bed, Plus } from 'lucide-react';
import DataTable from '../components/layout/DataTable';
import Modal from '../components/layout/Modal';
import { api } from '../services/api';
import type { Hostel } from '../types';
import toast from 'react-hot-toast';

export default function HostelPage() {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'boys', totalRooms: '', warden: '' });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { try { const d = await api.get('/hostels'); setHostels(d); } catch { setHostels([]); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/hostels', { ...form, totalRooms: parseInt(form.totalRooms) || 1 }); toast.success('Hostel added'); loadData(); setModalOpen(false); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const columns = [
    { key: 'name', label: 'Hostel Name' },
    { key: 'type', label: 'Type', render: (h: Hostel) => <span className="badge-primary capitalize">{h.type}</span> },
    { key: 'totalRooms', label: 'Total Rooms' },
    { key: 'occupiedRooms', label: 'Occupied' },
    { key: 'warden', label: 'Warden' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-xl"><Bed size={24} className="text-rose-600" /></div>
          <div><h1 className="text-2xl font-bold">Hostel Management</h1><p className="text-sm text-gray-500">Manage dormitories & room allocations</p></div>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Hostel</button>
      </div>
      <div className="card"><DataTable columns={columns} data={hostels} searchPlaceholder="Search hostels..." /></div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Hostel">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Name *</label><input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Type</label><select className="input-field" value={form.type} onChange={e => setForm({...form, type: e.target.value})}><option value="boys">Boys</option><option value="girls">Girls</option><option value="mixed">Mixed</option></select></div>
            <div><label className="block text-sm font-medium mb-1">Total Rooms</label><input type="number" className="input-field" value={form.totalRooms} onChange={e => setForm({...form, totalRooms: e.target.value})} /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Warden</label><input className="input-field" value={form.warden} onChange={e => setForm({...form, warden: e.target.value})} /></div>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Add Hostel</button></div>
        </form>
      </Modal>
    </div>
  );
}
