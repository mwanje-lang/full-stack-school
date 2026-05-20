import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Edit2, Trash2, Download, Upload } from 'lucide-react';
import DataTable from '../components/layout/DataTable';
import Modal from '../components/layout/Modal';
import { api } from '../services/api';
import type { Student } from '../types';
import toast from 'react-hot-toast';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', admissionNo: '', dateOfBirth: '', gender: 'male',
    classId: '', parentName: '', parentPhone: '', parentEmail: '', address: '', healthInfo: ''
  });

  useEffect(() => { loadStudents(); }, []);

  const loadStudents = async () => {
    try {
      const data = await api.get('/students');
      setStudents(data);
    } catch { setStudents([]); }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await api.put(`/students/${editingStudent.id}`, form);
        toast.success('Student updated');
      } else {
        await api.post('/students', form);
        toast.success('Student admitted');
      }
      loadStudents();
      closeModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student removed');
      loadStudents();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const openEdit = (student: Student) => {
    setEditingStudent(student);
    setForm({
      firstName: student.firstName, lastName: student.lastName, admissionNo: student.admissionNo,
      dateOfBirth: student.dateOfBirth, gender: student.gender, classId: student.classId,
      parentName: student.parentName || '', parentPhone: student.parentPhone || '',
      parentEmail: student.parentEmail || '', address: student.address || '', healthInfo: student.healthInfo || ''
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingStudent(null);
    setForm({ firstName: '', lastName: '', admissionNo: '', dateOfBirth: '', gender: 'male', classId: '', parentName: '', parentPhone: '', parentEmail: '', address: '', healthInfo: '' });
  };

  const columns = [
    { key: 'admissionNo', label: 'Adm. No' },
    { key: 'firstName', label: 'Name', render: (s: Student) => `${s.firstName} ${s.lastName}` },
    { key: 'className', label: 'Class' },
    { key: 'gender', label: 'Gender', render: (s: Student) => <span className="capitalize">{s.gender}</span> },
    { key: 'parentName', label: 'Parent' },
    { key: 'parentPhone', label: 'Phone' },
    { key: 'isActive', label: 'Status', render: (s: Student) => (
      <span className={s.isActive ? 'badge-success' : 'badge-danger'}>{s.isActive ? 'Active' : 'Inactive'}</span>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <GraduationCap size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Students</h1>
            <p className="text-sm text-gray-500">{students.length} total students</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Admit Student
          </button>
        </div>
      </div>

      <div className="card">
        <DataTable
          columns={columns}
          data={students}
          searchPlaceholder="Search students by name, admission no..."
          actions={(item) => {
            const s = item as unknown as Student;
            return (
              <div className="flex gap-1">
                <button onClick={(e) => { e.stopPropagation(); openEdit(s); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600"><Edit2 size={16} /></button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"><Trash2 size={16} /></button>
              </div>
            );
          }}
        />
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editingStudent ? 'Edit Student' : 'Admit New Student'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name *</label>
              <input className="input-field" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name *</label>
              <input className="input-field" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Admission No *</label>
              <input className="input-field" value={form.admissionNo} onChange={e => setForm({ ...form, admissionNo: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth *</label>
              <input type="date" className="input-field" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender *</label>
              <select className="input-field" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Class</label>
              <input className="input-field" value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })} placeholder="e.g. Class 10A" />
            </div>
          </div>
          <hr className="my-4" />
          <h3 className="font-medium text-sm text-gray-600">Parent/Guardian Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Parent Name</label>
              <input className="input-field" value={form.parentName} onChange={e => setForm({ ...form, parentName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Parent Phone</label>
              <input className="input-field" value={form.parentPhone} onChange={e => setForm({ ...form, parentPhone: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Parent Email</label>
              <input type="email" className="input-field" value={form.parentEmail} onChange={e => setForm({ ...form, parentEmail: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input className="input-field" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Health Info</label>
            <textarea className="input-field" rows={2} value={form.healthInfo} onChange={e => setForm({ ...form, healthInfo: e.target.value })} placeholder="Allergies, conditions, etc." />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingStudent ? 'Update Student' : 'Admit Student'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
