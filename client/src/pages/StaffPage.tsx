import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Edit2, Trash2 } from 'lucide-react';
import DataTable from '../components/layout/DataTable';
import Modal from '../components/layout/Modal';
import { api } from '../services/api';
import type { Staff } from '../types';
import toast from 'react-hot-toast';

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', role: 'teacher',
    department: '', designation: '', salary: '', employeeId: '', joinDate: ''
  });

  useEffect(() => { loadStaff(); }, []);

  const loadStaff = async () => {
    try { const d = await api.get('/staff'); setStaff(d); } catch { setStaff([]); }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, salary: form.salary ? parseFloat(form.salary) : 0 };
      if (editing) { await api.put(`/staff/${editing.id}`, payload); toast.success('Staff updated'); }
      else { await api.post('/staff', payload); toast.success('Staff added'); }
      loadStaff(); closeModal();
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this staff member?')) return;
    try { await api.delete(`/staff/${id}`); toast.success('Deleted'); loadStaff(); } catch { toast.error('Failed'); }
  };

  const openEdit = (s: Staff) => {
    setEditing(s);
    setForm({ firstName: s.firstName, lastName: s.lastName, email: s.email, phone: s.phone || '',
      role: s.role, department: s.department || '', designation: s.designation || '',
      salary: s.salary?.toString() || '', employeeId: s.employeeId, joinDate: s.joinDate });
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditing(null); setForm({ firstName: '', lastName: '', email: '', phone: '', role: 'teacher', department: '', designation: '', salary: '', employeeId: '', joinDate: '' }); };

  const columns = [
    { key: 'employeeId', label: 'ID' },
    { key: 'firstName', label: 'Name', render: (s: Staff) => `${s.firstName} ${s.lastName}` },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (s: Staff) => <span className="badge-primary capitalize">{s.role}</span> },
    { key: 'department', label: 'Department' },
    { key: 'designation', label: 'Designation' },
    { key: 'isActive', label: 'Status', render: (s: Staff) => <span className={s.isActive ? 'badge-success' : 'badge-danger'}>{s.isActive ? 'Active' : 'Inactive'}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl"><Briefcase size={24} className="text-green-600" /></div>
          <div><h1 className="text-2xl font-bold">Staff Management</h1><p className="text-sm text-gray-500">{staff.length} total staff</p></div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Teacher</button>
          <button onClick={() => { setForm(f => ({ ...f, role: 'accountant' })); setModalOpen(true); }} className="btn-success flex items-center gap-2"><Plus size={18} /> Add Staff</button>
        </div>
      </div>

      <div className="card">
        <DataTable columns={columns} data={staff} searchPlaceholder="Search staff..."
          actions={(item) => { const s = item as unknown as Staff; return (
            <div className="flex gap-1">
              <button onClick={(e) => { e.stopPropagation(); openEdit(s); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600"><Edit2 size={16} /></button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"><Trash2 size={16} /></button>
            </div>
          ); }} />
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Staff' : 'Add Staff Member'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">First Name *</label><input className="input-field" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} required /></div>
            <div><label className="block text-sm font-medium mb-1">Last Name *</label><input className="input-field" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} required /></div>
            <div><label className="block text-sm font-medium mb-1">Employee ID *</label><input className="input-field" value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})} required /></div>
            <div><label className="block text-sm font-medium mb-1">Email *</label><input type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
            <div><label className="block text-sm font-medium mb-1">Phone</label><input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Role *</label>
              <select className="input-field" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="teacher">Teacher</option><option value="admin">Admin</option><option value="accountant">Accountant</option><option value="librarian">Librarian</option><option value="driver">Driver</option><option value="other">Other</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1">Department</label><input className="input-field" value={form.department} onChange={e => setForm({...form, department: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Designation</label><input className="input-field" value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Salary</label><input type="number" className="input-field" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Join Date *</label><input type="date" className="input-field" value={form.joinDate} onChange={e => setForm({...form, joinDate: e.target.value})} required /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Add Staff'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
