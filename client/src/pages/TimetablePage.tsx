import React, { useState, useEffect } from 'react';
import { Calendar, Plus } from 'lucide-react';
import Modal from '../components/layout/Modal';
import { api } from '../services/api';
import type { Timetable } from '../types';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

export default function TimetablePage() {
  const [entries, setEntries] = useState<Timetable[]>([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ classId: '', subjectId: '', teacherId: '', dayOfWeek: '1', startTime: '08:00', endTime: '09:00', room: '' });

  useEffect(() => { loadTimetable(); }, [selectedClass]);

  const loadTimetable = async () => {
    try { const d = await api.get(`/timetable${selectedClass !== 'all' ? `?classId=${selectedClass}` : ''}`); setEntries(d); } catch { setEntries([]); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/timetable', { ...form, dayOfWeek: parseInt(form.dayOfWeek) }); toast.success('Added'); loadTimetable(); setModalOpen(false); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const getEntry = (day: number, hour: string) => entries.find(e => e.dayOfWeek === day && e.startTime === hour);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl"><Calendar size={24} className="text-indigo-600" /></div>
          <div><h1 className="text-2xl font-bold">Timetable</h1><p className="text-sm text-gray-500">Manage class schedules</p></div>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Period</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-50 dark:bg-gray-700 w-20">Time</th>
              {DAYS.map(d => <th key={d} className="border p-2 bg-gray-50 dark:bg-gray-700">{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {HOURS.map(hour => (
              <tr key={hour}>
                <td className="border p-2 text-center font-medium text-gray-600">{hour}</td>
                {DAYS.map((_, dayIdx) => {
                  const entry = getEntry(dayIdx + 1, hour);
                  return (
                    <td key={dayIdx} className="border p-1">
                      {entry ? (
                        <div className="bg-primary-50 dark:bg-primary-900/30 rounded-lg p-2 text-xs">
                          <p className="font-semibold text-primary-700 dark:text-primary-300">{entry.subjectName || 'Subject'}</p>
                          <p className="text-gray-500">{entry.teacherName || 'Teacher'}</p>
                          {entry.room && <p className="text-gray-400">Room: {entry.room}</p>}
                        </div>
                      ) : (
                        <div className="h-12 flex items-center justify-center text-gray-300 text-xs">-</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Timetable Entry">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Class *</label><input className="input-field" value={form.classId} onChange={e => setForm({...form, classId: e.target.value})} required /></div>
            <div><label className="block text-sm font-medium mb-1">Subject *</label><input className="input-field" value={form.subjectId} onChange={e => setForm({...form, subjectId: e.target.value})} required /></div>
            <div><label className="block text-sm font-medium mb-1">Teacher</label><input className="input-field" value={form.teacherId} onChange={e => setForm({...form, teacherId: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Day *</label>
              <select className="input-field" value={form.dayOfWeek} onChange={e => setForm({...form, dayOfWeek: e.target.value})}>
                {DAYS.map((d, i) => <option key={d} value={i + 1}>{d}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1">Start Time *</label><input type="time" className="input-field" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} required /></div>
            <div><label className="block text-sm font-medium mb-1">End Time *</label><input type="time" className="input-field" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} required /></div>
            <div><label className="block text-sm font-medium mb-1">Room</label><input className="input-field" value={form.room} onChange={e => setForm({...form, room: e.target.value})} /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Add Period</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
