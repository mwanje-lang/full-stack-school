import React, { useState, useEffect } from 'react';
import { BookMarked, Plus, Edit2, Trash2, BookOpen } from 'lucide-react';
import DataTable from '../components/layout/DataTable';
import Modal from '../components/layout/Modal';
import { api } from '../services/api';
import type { LibraryBook, BookBorrowing } from '../types';
import toast from 'react-hot-toast';

export default function LibraryPage() {
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [borrowings, setBorrowings] = useState<BookBorrowing[]>([]);
  const [tab, setTab] = useState<'books' | 'borrowings' | 'overdue'>('books');
  const [modalOpen, setModalOpen] = useState(false);
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', author: '', isbn: '', category: '', totalCopies: '1', isEbook: false, ebookUrl: '' });
  const [borrowForm, setBorrowForm] = useState({ bookId: '', userId: '', dueDate: '' });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    try { const [b, br] = await Promise.all([api.get('/library/books'), api.get('/library/borrowings')]); setBooks(b); setBorrowings(br); } catch { setBooks([]); setBorrowings([]); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/library/books', { ...form, totalCopies: parseInt(form.totalCopies) }); toast.success('Book added'); loadData(); setModalOpen(false); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.post('/library/borrow', borrowForm); toast.success('Book issued'); loadData(); setBorrowModalOpen(false); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const handleReturn = async (id: string) => {
    try { await api.post(`/library/return/${id}`, {}); toast.success('Book returned'); loadData(); } catch { toast.error('Failed'); }
  };

  const overdue = borrowings.filter(b => b.status === 'overdue');

  const bookColumns = [
    { key: 'title', label: 'Title' }, { key: 'author', label: 'Author' }, { key: 'isbn', label: 'ISBN' },
    { key: 'category', label: 'Category' },
    { key: 'availableCopies', label: 'Available', render: (b: LibraryBook) => `${b.availableCopies}/${b.totalCopies}` },
    { key: 'isEbook', label: 'Type', render: (b: LibraryBook) => <span className={b.isEbook ? 'badge-primary' : 'badge-secondary'}>{b.isEbook ? 'E-Book' : 'Physical'}</span> },
  ];

  const borrowColumns = [
    { key: 'bookTitle', label: 'Book' }, { key: 'userName', label: 'Borrower' },
    { key: 'borrowDate', label: 'Borrowed' }, { key: 'dueDate', label: 'Due Date' },
    { key: 'status', label: 'Status', render: (b: BookBorrowing) => {
      const c: Record<string, string> = { borrowed: 'badge-warning', returned: 'badge-success', overdue: 'badge-danger' };
      return <span className={c[b.status]}>{b.status}</span>;
    }},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl"><BookMarked size={24} className="text-cyan-600" /></div>
          <div><h1 className="text-2xl font-bold">Library</h1><p className="text-sm text-gray-500">Manage books, borrowing & e-books</p></div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Book</button>
          <button onClick={() => setBorrowModalOpen(true)} className="btn-success flex items-center gap-2"><BookOpen size={18} /> Issue Book</button>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('books')} className={tab === 'books' ? 'btn-primary' : 'btn-secondary'}>Books ({books.length})</button>
        <button onClick={() => setTab('borrowings')} className={tab === 'borrowings' ? 'btn-primary' : 'btn-secondary'}>Borrowings</button>
        <button onClick={() => setTab('overdue')} className={tab === 'overdue' ? 'btn-danger' : 'btn-secondary'}>Overdue ({overdue.length})</button>
      </div>

      <div className="card">
        {tab === 'books' && <DataTable columns={bookColumns} data={books} searchPlaceholder="Search books..." />}
        {tab === 'borrowings' && <DataTable columns={borrowColumns} data={borrowings} searchPlaceholder="Search borrowings..."
          actions={(item) => { const b = item as unknown as BookBorrowing; return b.status !== 'returned' ? <button onClick={() => handleReturn(b.id)} className="btn-primary text-xs py-1 px-3">Return</button> : null; }} />}
        {tab === 'overdue' && <DataTable columns={borrowColumns} data={overdue} emptyMessage="No overdue books" />}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Book">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Title *</label><input className="input-field" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Author *</label><input className="input-field" value={form.author} onChange={e => setForm({...form, author: e.target.value})} required /></div>
            <div><label className="block text-sm font-medium mb-1">ISBN</label><input className="input-field" value={form.isbn} onChange={e => setForm({...form, isbn: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Category</label><input className="input-field" value={form.category} onChange={e => setForm({...form, category: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Copies</label><input type="number" className="input-field" value={form.totalCopies} onChange={e => setForm({...form, totalCopies: e.target.value})} /></div>
          </div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={form.isEbook} onChange={e => setForm({...form, isEbook: e.target.checked})} /><label className="text-sm">This is an E-Book</label></div>
          {form.isEbook && <div><label className="block text-sm font-medium mb-1">E-Book URL</label><input className="input-field" value={form.ebookUrl} onChange={e => setForm({...form, ebookUrl: e.target.value})} /></div>}
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Add Book</button></div>
        </form>
      </Modal>

      <Modal isOpen={borrowModalOpen} onClose={() => setBorrowModalOpen(false)} title="Issue Book">
        <form onSubmit={handleBorrow} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Book *</label><input className="input-field" value={borrowForm.bookId} onChange={e => setBorrowForm({...borrowForm, bookId: e.target.value})} placeholder="Search book title..." required /></div>
          <div><label className="block text-sm font-medium mb-1">Borrower *</label><input className="input-field" value={borrowForm.userId} onChange={e => setBorrowForm({...borrowForm, userId: e.target.value})} placeholder="Search student/staff name..." required /></div>
          <div><label className="block text-sm font-medium mb-1">Due Date *</label><input type="date" className="input-field" value={borrowForm.dueDate} onChange={e => setBorrowForm({...borrowForm, dueDate: e.target.value})} required /></div>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setBorrowModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Issue Book</button></div>
        </form>
      </Modal>
    </div>
  );
}
