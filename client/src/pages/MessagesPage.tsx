import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Send } from 'lucide-react';
import Modal from '../components/layout/Modal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Message } from '../types';
import toast from 'react-hot-toast';

export default function MessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ receiverId: '', subject: '', body: '' });

  useEffect(() => { loadMessages(); }, []);
  const loadMessages = async () => { try { const d = await api.get('/messages'); setMessages(d); } catch { setMessages([]); } };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/messages', form); toast.success('Message sent'); loadMessages(); setModalOpen(false); setForm({ receiverId: '', subject: '', body: '' }); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl"><MessageSquare size={24} className="text-blue-600" /></div>
          <div><h1 className="text-2xl font-bold">Messages</h1><p className="text-sm text-gray-500">Internal messaging system</p></div>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> New Message</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 card p-0 max-h-[600px] overflow-y-auto">
          {messages.length === 0 ? <p className="p-6 text-center text-gray-500">No messages</p> : messages.map(m => (
            <button key={m.id} onClick={() => setSelectedMsg(m)} className={`w-full text-left p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-700/30 ${selectedMsg?.id === m.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''} ${!m.isRead ? 'font-semibold' : ''}`}>
              <div className="flex justify-between"><p className="text-sm truncate">{m.senderName}</p><p className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</p></div>
              <p className="text-sm mt-1 truncate">{m.subject}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{m.body}</p>
            </button>
          ))}
        </div>
        <div className="lg:col-span-2 card">
          {selectedMsg ? (
            <div>
              <h3 className="font-semibold text-lg">{selectedMsg.subject}</h3>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500"><span>From: {selectedMsg.senderName}</span><span>|</span><span>{new Date(selectedMsg.createdAt).toLocaleString()}</span></div>
              <hr className="my-4" />
              <p className="text-sm whitespace-pre-wrap">{selectedMsg.body}</p>
            </div>
          ) : <p className="text-center text-gray-400 py-20">Select a message to read</p>}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Message">
        <form onSubmit={handleSend} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">To *</label><input className="input-field" value={form.receiverId} onChange={e => setForm({...form, receiverId: e.target.value})} placeholder="Search recipient..." required /></div>
          <div><label className="block text-sm font-medium mb-1">Subject *</label><input className="input-field" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1">Message *</label><textarea className="input-field" rows={5} value={form.body} onChange={e => setForm({...form, body: e.target.value})} required /></div>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary flex items-center gap-2"><Send size={16} /> Send</button></div>
        </form>
      </Modal>
    </div>
  );
}
