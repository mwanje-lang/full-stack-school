import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2 } from 'lucide-react';
import DataTable from '../components/layout/DataTable';
import Modal from '../components/layout/Modal';
import { api } from '../services/api';
import type { Class, Subject } from '../types';
import toast from 'react-hot-toast';

export default function AcademicsPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tab, setTab] = useState<'classes' | 'subjects'>('classes');
  const [modalOpen, setModalOpen] = useState(false);
  const [classForm, setClassForm] = useState({ name: '', section: '', teacherId: '', capacity: '' });
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', classId: '', teacherId: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try { const [c, s] = await Promise.all([api.get('/classes'), api.get('/subjects')]); setClasses(c); setSubjects(s); } catch { setClasses([]); setSubjects([]); }
  };

  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/classes', { ...classForm, capacity: parseInt(classForm.capacity) || 40 }); toast.success('Class added'); loadData(); setModalOpen(false); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/subjects', subjectForm); toast.success('Subject added'); loadData(); setModalOpen(false); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const classColumns = [
    { key: 'name', label: 'Class Name' },
    { key: 'section', label: 'Section' },
    { key: 'teacherName', label: 'Class Teacher' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'currentStrength', label: 'Students' },
  ];

  const subjectColumns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Subject' },
    { key: 'classId', label: 'Class' },
    { key: 'teacherName', label: 'Teacher' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl"><BookOpen size={24} className="text-purple-600" /></div>
          <div><h1 className="text-2xl font-bold">Academics</h1><p className="text-sm text-gray-500">Manage classes, subjects & curriculum</p></div>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add {tab === 'classes' ? 'Class' : 'Subject'}</button>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('classes')} className={tab === 'classes' ? 'btn-primary' : 'btn-secondary'}>Classes</button>
        <button onClick={() => setTab('subjects')} className={tab === 'subjects' ? 'btn-primary' : 'btn-secondary'}>Subjects</button>
      </div>

      <div className="card">
        {tab === 'classes' ? (
          <DataTable columns={classColumns} data={classes} searchPlaceholder="Search classes..."
            actions={(item) => { const c = item as unknown as Class; return (
              <div className="flex gap-1">
                <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600"><Edit2 size={16} /></button>
                <button onClick={async (e) => { e.stopPropagation(); try { await api.delete(`/classes/${c.id}`); toast.success('Deleted'); loadData(); } catch { toast.error('Failed'); } }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"><Trash2 size={16} /></button>
              </div>
            ); }} />
        ) : (
          <DataTable columns={subjectColumns} data={subjects} searchPlaceholder="Search subjects..." />
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={tab === 'classes' ? 'Add Class' : 'Add Subject'}>
        {tab === 'classes' ? (
          <form onSubmit={handleClassSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Class Name *</label><input className="input-field" value={classForm.name} onChange={e => setClassForm({...classForm, name: e.target.value})} placeholder="e.g. Class 10" required /></div>
            <div><label className="block text-sm font-medium mb-1">Section</label><input className="input-field" value={classForm.section} onChange={e => setClassForm({...classForm, section: e.target.value})} placeholder="e.g. A" /></div>
            <div><label className="block text-sm font-medium mb-1">Capacity</label><input type="number" className="input-field" value={classForm.capacity} onChange={e => setClassForm({...classForm, capacity: e.target.value})} /></div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Add Class</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubjectSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Subject Name *</label><input className="input-field" value={subjectForm.name} onChange={e => setSubjectForm({...subjectForm, name: e.target.value})} required /></div>
            <div><label className="block text-sm font-medium mb-1">Code *</label><input className="input-field" value={subjectForm.code} onChange={e => setSubjectForm({...subjectForm, code: e.target.value})} required /></div>
            <div><label className="block text-sm font-medium mb-1">Class</label><input className="input-field" value={subjectForm.classId} onChange={e => setSubjectForm({...subjectForm, classId: e.target.value})} /></div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Add Subject</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
