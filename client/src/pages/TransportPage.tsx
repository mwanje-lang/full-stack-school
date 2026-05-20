import React, { useState, useEffect } from 'react';
import { Bus, Plus, MapPin, Navigation } from 'lucide-react';
import DataTable from '../components/layout/DataTable';
import Modal from '../components/layout/Modal';
import { api } from '../services/api';
import type { Transport } from '../types';
import toast from 'react-hot-toast';

export default function TransportPage() {
  const [routes, setRoutes] = useState<Transport[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ routeName: '', vehicleNo: '', vehicleType: 'bus', driverName: '', driverPhone: '', capacity: '', gpsTrackerId: '' });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { try { const d = await api.get('/transport'); setRoutes(d); } catch { setRoutes([]); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/transport', { ...form, capacity: parseInt(form.capacity) || 40 }); toast.success('Route added'); loadData(); setModalOpen(false); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const columns = [
    { key: 'routeName', label: 'Route' }, { key: 'vehicleNo', label: 'Vehicle No' },
    { key: 'vehicleType', label: 'Type', render: (t: Transport) => <span className="capitalize">{t.vehicleType}</span> },
    { key: 'driverName', label: 'Driver' }, { key: 'driverPhone', label: 'Phone' },
    { key: 'capacity', label: 'Capacity', render: (t: Transport) => `${t.currentOccupancy}/${t.capacity}` },
    { key: 'gpsTrackerId', label: 'GPS', render: (t: Transport) => t.gpsTrackerId ? <span className="badge-success">Active</span> : <span className="badge-warning">No GPS</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl"><Bus size={24} className="text-yellow-600" /></div>
          <div><h1 className="text-2xl font-bold">Transport Management</h1><p className="text-sm text-gray-500">Track routes, drivers & vehicles</p></div>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Route</button>
      </div>

      {/* GPS Tracking Placeholder */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4"><Navigation size={20} className="text-blue-500" /><h3 className="font-semibold">Live GPS Tracking</h3></div>
        <div className="bg-gray-100 dark:bg-gray-700 rounded-xl h-64 flex items-center justify-center text-gray-500">
          <div className="text-center"><MapPin size={48} className="mx-auto mb-2 text-gray-400" /><p>GPS Tracker Map</p><p className="text-sm">Connect GPS devices to view real-time locations</p><p className="text-xs mt-2">API Endpoint: <code className="bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">POST /api/gps/update</code></p></div>
        </div>
      </div>

      <div className="card"><DataTable columns={columns} data={routes} searchPlaceholder="Search routes..." /></div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Transport Route">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Route Name *</label><input className="input-field" value={form.routeName} onChange={e => setForm({...form, routeName: e.target.value})} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Vehicle No *</label><input className="input-field" value={form.vehicleNo} onChange={e => setForm({...form, vehicleNo: e.target.value})} required /></div>
            <div><label className="block text-sm font-medium mb-1">Vehicle Type</label>
              <select className="input-field" value={form.vehicleType} onChange={e => setForm({...form, vehicleType: e.target.value})}>
                <option value="bus">Bus</option><option value="van">Van</option><option value="car">Car</option><option value="minibus">Minibus</option>
              </select></div>
            <div><label className="block text-sm font-medium mb-1">Driver Name *</label><input className="input-field" value={form.driverName} onChange={e => setForm({...form, driverName: e.target.value})} required /></div>
            <div><label className="block text-sm font-medium mb-1">Driver Phone *</label><input className="input-field" value={form.driverPhone} onChange={e => setForm({...form, driverPhone: e.target.value})} required /></div>
            <div><label className="block text-sm font-medium mb-1">Capacity</label><input type="number" className="input-field" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">GPS Tracker ID</label><input className="input-field" value={form.gpsTrackerId} onChange={e => setForm({...form, gpsTrackerId: e.target.value})} placeholder="Open until connected" /></div>
          </div>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Add Route</button></div>
        </form>
      </Modal>
    </div>
  );
}
