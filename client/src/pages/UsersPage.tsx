import React, { useState, useEffect } from 'react';
import { UserCog, Plus, Edit2, Trash2, Shield } from 'lucide-react';
import DataTable from '../components/layout/DataTable';
import Modal from '../components/layout/Modal';
import { api } from '../services/api';
import type { User, UserRole } from '../types';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'teacher' as UserRole, phone: '' });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { try { const d = await api.get('/users'); setUsers(d); } catch { setUsers([]); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/users', form); toast.success('User created'); loadData(); setModalOpen(false); setForm({ firstName: '', lastName: '', email: '', password: '', role: 'teacher', phone: '' }); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    try { await api.delete(`/users/${id}`); toast.success('Deleted'); loadData(); } catch { toast.error('Failed'); }
  };

  const columns = [
    { key: 'firstName', label: 'Name', render: (u: User) => `${u.firstName} ${u.lastName}` },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (u: User) => {
      const c: Record<string, string> = { admin: 'bg-red-100 text-red-700', teacher: 'bg-blue-100 text-blue-700', student: 'bg-green-100 text-green-700', parent: 'bg-purple-100 text-purple-700', accountant: 'bg-amber-100 text-amber-700' };
      return <span className={`text-xs px-2 py-0.5 rounded-full ${c[u.role] || ''}`}>{u.role}</span>;
    }},
    { key: 'isActive', label: 'Status', render: (u: User) => <span className={u.isActive ? 'badge-success' : 'badge-danger'}>{u.isActive ? 'Active' : 'Inactive'}</span> },
    { key: 'createdAt', label: 'Created', render: (u: User) => new Date(u.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl"><UserCog size={24} className="text-purple-600" /></div>
          <div><h1 className="text-2xl font-bold">User Management</h1><p className="text-sm text-gray-500">Manage roles & permissions</p></div>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add User</button>
      </div>

      {/* Role summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {(['admin', 'teacher', 'student', 'parent', 'accountant'] as const).map(role => (
          <div key={role} className="card text-center"><Shield size={20} className="mx-auto text-primary-500 mb-1" /><p className="text-2xl font-bold">{users.filter(u => u.role === role).length}</p><p className="text-xs text-gray-500 capitalize">{role}s</p></div>
        ))}
      </div>

      <div className="card">
        <DataTable columns={columns} data={users} searchPlaceholder="Search users..."
          actions={(item) => { const u = item as unknown as User; return (
            <button onClick={(e) => { e.stopPropagation(); handleDelete(u.id); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"><Trash2 size={16} /></button>
          ); }} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add User">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">First Name *</label><input className="input-field" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} required /></div>
            <div><label className="block text-sm font-medium mb-1">Last Name *</label><input className="input-field" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} required /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Email *</label><input type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1">Password *</label><input type="password" className="input-field" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Role *</label>
              <select className="input-field" value={form.role} onChange={e => setForm({...form, role: e.target.value as UserRole})}>
                <option value="admin">Admin</option><option value="teacher">Teacher</option><option value="student">Student</option><option value="parent">Parent</option><option value="accountant">Accountant</option>
              </select></div>
            <div><label className="block text-sm font-medium mb-1">Phone</label><input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
          </div>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Create User</button></div>
        </form>
      </Modal>
    </div>
  );
}
