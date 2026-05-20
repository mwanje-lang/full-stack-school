import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus } from 'lucide-react';
import Modal from '../components/layout/Modal';
import { api } from '../services/api';
import type { Event } from '../types';
import toast from 'react-hot-toast';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: '', endDate: '', location: '', type: 'academic', isAllDay: true });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { try { const d = await api.get('/events'); setEvents(d); } catch { setEvents([]); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/events', form); toast.success('Event added'); loadData(); setModalOpen(false); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const typeColors: Record<string, string> = { academic: 'bg-blue-100 text-blue-700', sports: 'bg-green-100 text-green-700', cultural: 'bg-purple-100 text-purple-700', meeting: 'bg-amber-100 text-amber-700', holiday: 'bg-red-100 text-red-700', exam: 'bg-orange-100 text-orange-700', other: 'bg-gray-100 text-gray-700' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-xl"><CalendarDays size={24} className="text-teal-600" /></div>
          <div><h1 className="text-2xl font-bold">Events & Calendar</h1><p className="text-sm text-gray-500">School events & schedule</p></div>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Event</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map(event => (
          <div key={event.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-14 h-14 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex flex-col items-center justify-center">
                <span className="text-xs text-primary-600 font-medium">{new Date(event.date).toLocaleDateString('en', { month: 'short' })}</span>
                <span className="text-xl font-bold text-primary-700">{new Date(event.date).getDate()}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{event.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[event.type] || typeColors.other}`}>{event.type}</span>
                  {event.location && <span className="text-xs text-gray-400">{event.location}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
        {events.length === 0 && <div className="col-span-full text-center py-12 text-gray-400">No events scheduled</div>}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Event">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Title *</label><input className="input-field" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea className="input-field" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Start Date *</label><input type="date" className="input-field" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div>
            <div><label className="block text-sm font-medium mb-1">End Date</label><input type="date" className="input-field" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Type</label>
              <select className="input-field" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="academic">Academic</option><option value="sports">Sports</option><option value="cultural">Cultural</option><option value="meeting">Meeting</option><option value="holiday">Holiday</option><option value="exam">Exam</option><option value="other">Other</option>
              </select></div>
            <div><label className="block text-sm font-medium mb-1">Location</label><input className="input-field" value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
          </div>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Add Event</button></div>
        </form>
      </Modal>
    </div>
  );
}
