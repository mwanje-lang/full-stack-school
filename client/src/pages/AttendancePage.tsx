import React, { useState, useEffect } from 'react';
import { UserCheck, Download, Filter, Calendar } from 'lucide-react';
import DataTable from '../components/layout/DataTable';
import Modal from '../components/layout/Modal';
import { api } from '../services/api';
import type { Attendance } from '../types';
import toast from 'react-hot-toast';

export default function AttendancePage() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'student' | 'staff'>('student');
  const [form, setForm] = useState({ userId: '', status: 'present', method: 'manual', date: '' });

  useEffect(() => { loadRecords(); }, [date, type]);

  const loadRecords = async () => {
    try { const d = await api.get(`/attendance?date=${date}&type=${type}`); setRecords(d); } catch { setRecords([]); }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/attendance', { ...form, type, date });
      toast.success('Attendance marked');
      loadRecords(); setModalOpen(false);
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const columns = [
    { key: 'userName', label: 'Name' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status', render: (a: Attendance) => {
      const colors: Record<string, string> = { present: 'badge-success', absent: 'badge-danger', late: 'badge-warning', excused: 'badge-primary' };
      return <span className={colors[a.status] || 'badge-primary'}>{a.status}</span>;
    }},
    { key: 'checkInTime', label: 'Check In' },
    { key: 'checkOutTime', label: 'Check Out' },
    { key: 'method', label: 'Method', render: (a: Attendance) => <span className="capitalize">{a.method}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-xl"><UserCheck size={24} className="text-teal-600" /></div>
          <div><h1 className="text-2xl font-bold">Attendance</h1><p className="text-sm text-gray-500">Track student & staff attendance</p></div>
        </div>
        <button onClick={() => { setForm({ userId: '', status: 'present', method: 'manual', date }); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
          <UserCheck size={18} /> Mark Attendance
        </button>
      </div>

      <div className="card p-4 flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          <button onClick={() => setType('student')} className={type === 'student' ? 'btn-primary' : 'btn-secondary'}>Students</button>
          <button onClick={() => setType('staff')} className={type === 'staff' ? 'btn-primary' : 'btn-secondary'}>Staff</button>
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field w-auto" />
      </div>

      <div className="card">
        <DataTable columns={columns} data={records} searchPlaceholder="Search by name..." />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Mark Attendance">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Student/Staff Name *</label>
            <input className="input-field" value={form.userId} onChange={e => setForm({...form, userId: e.target.value})} placeholder="Search name..." required /></div>
          <div><label className="block text-sm font-medium mb-1">Status</label>
            <select className="input-field" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
              <option value="present">Present</option><option value="absent">Absent</option><option value="late">Late</option><option value="excused">Excused</option>
            </select></div>
          <div><label className="block text-sm font-medium mb-1">Method</label>
            <select className="input-field" value={form.method} onChange={e => setForm({...form, method: e.target.value})}>
              <option value="manual">Manual</option><option value="biometric">Biometric</option><option value="idcard">ID Card</option>
            </select></div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Mark Attendance</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
