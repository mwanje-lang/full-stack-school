import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Edit2, Trash2 } from 'lucide-react';
import DataTable from '../components/layout/DataTable';
import Modal from '../components/layout/Modal';
import { api } from '../services/api';
import type { Exam, Grade } from '../types';
import toast from 'react-hot-toast';

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [tab, setTab] = useState<'exams' | 'grades'>('exams');
  const [modalOpen, setModalOpen] = useState(false);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [classFilter, setClassFilter] = useState('');
  const [examForm, setExamForm] = useState({ name: '', classId: '', subjectId: '', date: '', totalMarks: '100', passingMarks: '40', term: 'Term 1' });
  const [gradeForm, setGradeForm] = useState({ studentId: '', examId: '', subjectId: '', marksObtained: '', remarks: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try { const [e, g] = await Promise.all([api.get('/exams'), api.get('/grades')]); setExams(e); setGrades(g); } catch { setExams([]); setGrades([]); }
  };

  const handleExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/exams', { ...examForm, totalMarks: parseInt(examForm.totalMarks), passingMarks: parseInt(examForm.passingMarks) });
      toast.success('Exam created'); loadData(); setModalOpen(false);
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/grades', { ...gradeForm, marksObtained: parseFloat(gradeForm.marksObtained) });
      toast.success('Marks recorded'); loadData(); setGradeModalOpen(false);
      setGradeForm({ studentId: '', examId: '', subjectId: '', marksObtained: '', remarks: '' });
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const examColumns = [
    { key: 'name', label: 'Exam Name' },
    { key: 'subjectName', label: 'Subject' },
    { key: 'classId', label: 'Class' },
    { key: 'date', label: 'Date' },
    { key: 'totalMarks', label: 'Total Marks' },
    { key: 'term', label: 'Term' },
  ];

  const gradeColumns = [
    { key: 'studentName', label: 'Student' },
    { key: 'subjectName', label: 'Subject' },
    { key: 'marksObtained', label: 'Marks', render: (g: Grade) => `${g.marksObtained}/${g.totalMarks}` },
    { key: 'grade', label: 'Grade' },
    { key: 'remarks', label: 'Remarks' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl"><ClipboardList size={24} className="text-orange-600" /></div>
          <div><h1 className="text-2xl font-bold">Exams & Grades</h1><p className="text-sm text-gray-500">Manage examinations and grading</p></div>
        </div>
        <div className="flex gap-2">
          {tab === 'exams' && <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Create Exam</button>}
          {tab === 'grades' && <button onClick={() => setGradeModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Input Marks</button>}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('exams')} className={tab === 'exams' ? 'btn-primary' : 'btn-secondary'}>Exams</button>
        <button onClick={() => setTab('grades')} className={tab === 'grades' ? 'btn-primary' : 'btn-secondary'}>Gradebook</button>
      </div>

      {tab === 'grades' && (
        <div className="card p-4 flex flex-wrap gap-4 items-center">
          <input className="input-field w-auto" placeholder="Filter by class..." value={classFilter} onChange={e => setClassFilter(e.target.value)} />
        </div>
      )}

      <div className="card">
        {tab === 'exams' ? (
          <DataTable columns={examColumns} data={exams} searchPlaceholder="Search exams..." />
        ) : (
          <DataTable columns={gradeColumns} data={grades} searchPlaceholder="Search by student name..." />
        )}
      </div>

      {/* Create Exam Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Exam">
        <form onSubmit={handleExamSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Exam Name *</label><input className="input-field" value={examForm.name} onChange={e => setExamForm({...examForm, name: e.target.value})} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Class *</label><input className="input-field" value={examForm.classId} onChange={e => setExamForm({...examForm, classId: e.target.value})} required /></div>
            <div><label className="block text-sm font-medium mb-1">Subject *</label><input className="input-field" value={examForm.subjectId} onChange={e => setExamForm({...examForm, subjectId: e.target.value})} required /></div>
            <div><label className="block text-sm font-medium mb-1">Date *</label><input type="date" className="input-field" value={examForm.date} onChange={e => setExamForm({...examForm, date: e.target.value})} required /></div>
            <div><label className="block text-sm font-medium mb-1">Term</label>
              <select className="input-field" value={examForm.term} onChange={e => setExamForm({...examForm, term: e.target.value})}>
                <option>Term 1</option><option>Term 2</option><option>Term 3</option>
              </select></div>
            <div><label className="block text-sm font-medium mb-1">Total Marks</label><input type="number" className="input-field" value={examForm.totalMarks} onChange={e => setExamForm({...examForm, totalMarks: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Pass Marks</label><input type="number" className="input-field" value={examForm.passingMarks} onChange={e => setExamForm({...examForm, passingMarks: e.target.value})} /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Exam</button>
          </div>
        </form>
      </Modal>

      {/* Input Marks Modal */}
      <Modal isOpen={gradeModalOpen} onClose={() => setGradeModalOpen(false)} title="Input Marks">
        <form onSubmit={handleGradeSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Student *</label><input className="input-field" value={gradeForm.studentId} onChange={e => setGradeForm({...gradeForm, studentId: e.target.value})} placeholder="Search student name..." required /></div>
          <div><label className="block text-sm font-medium mb-1">Subject *</label><input className="input-field" value={gradeForm.subjectId} onChange={e => setGradeForm({...gradeForm, subjectId: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1">Marks Obtained *</label><input type="number" className="input-field" value={gradeForm.marksObtained} onChange={e => setGradeForm({...gradeForm, marksObtained: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1">Remarks</label><textarea className="input-field" rows={2} value={gradeForm.remarks} onChange={e => setGradeForm({...gradeForm, remarks: e.target.value})} /></div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setGradeModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Marks</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
