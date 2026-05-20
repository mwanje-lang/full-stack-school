import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, Send, Printer, Search } from 'lucide-react';
import { api } from '../services/api';
import type { ReportCard, SchoolSettings } from '../types';
import toast from 'react-hot-toast';

export default function ReportCardsPage() {
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [selectedCard, setSelectedCard] = useState<ReportCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/settings').then(setSchoolSettings).catch(() => {});
  }, []);

  const generateReports = async () => {
    if (!selectedClass) { toast.error('Select a class'); return; }
    setLoading(true);
    try {
      const data = await api.get(`/report-cards?class=${encodeURIComponent(selectedClass)}&term=${encodeURIComponent(selectedTerm)}`);
      setReportCards(data);
      toast.success(`${data.length} report cards generated`);
    } catch { toast.error('Failed to generate'); }
    setLoading(false);
  };

  const handlePrint = () => window.print();

  const handleBulkEmail = async () => {
    try {
      await api.post('/report-cards/send-email', { classId: selectedClass, term: selectedTerm });
      toast.success('Report cards sent to parent emails');
    } catch { toast.error('Failed to send'); }
  };

  const handleBulkWhatsApp = async () => {
    try {
      await api.post('/report-cards/send-whatsapp', { classId: selectedClass, term: selectedTerm });
      toast.success('Report cards sent via WhatsApp');
    } catch { toast.error('Failed to send'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-xl"><FileText size={24} className="text-pink-600" /></div>
          <div><h1 className="text-2xl font-bold">Report Cards</h1><p className="text-sm text-gray-500">Generate and share student report cards</p></div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-4 items-end no-print">
        <div>
          <label className="block text-sm font-medium mb-1">Class</label>
          <input className="input-field" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} placeholder="e.g. Class 10A" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Term</label>
          <select className="input-field" value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)}>
            <option>Term 1</option><option>Term 2</option><option>Term 3</option>
          </select>
        </div>
        <button onClick={generateReports} disabled={loading} className="btn-primary">{loading ? 'Generating...' : 'Generate Report Cards'}</button>
        {reportCards.length > 0 && (
          <>
            <button onClick={handlePrint} className="btn-secondary flex items-center gap-2"><Printer size={16} /> Print All</button>
            <button onClick={handleBulkEmail} className="btn-success flex items-center gap-2"><Send size={16} /> Email to Parents</button>
            <button onClick={handleBulkWhatsApp} className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700"><Send size={16} /> WhatsApp</button>
          </>
        )}
      </div>

      {/* Report Card List */}
      <div className="no-print">
        {reportCards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportCards.map((rc, i) => (
              <button key={i} onClick={() => setSelectedCard(rc)} className="card text-left hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                    <span className="font-bold text-primary-600">{rc.student.firstName[0]}{rc.student.lastName[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium">{rc.student.firstName} {rc.student.lastName}</p>
                    <p className="text-xs text-gray-500">Adm: {rc.student.admissionNo} | {rc.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Report Card Preview */}
      {selectedCard && (
        <div ref={printRef} className="card max-w-3xl mx-auto print:shadow-none print:border-none">
          <div className="text-center border-b pb-6 mb-6">
            {schoolSettings?.schoolBadge && <img src={schoolSettings.schoolBadge} alt="badge" className="w-20 h-20 mx-auto mb-3" />}
            <h2 className="text-2xl font-bold text-primary-800">{schoolSettings?.schoolName || 'School Name'}</h2>
            <p className="text-sm text-gray-500">{schoolSettings?.address}</p>
            <p className="text-sm text-gray-500">{schoolSettings?.phone} | {schoolSettings?.email}</p>
            <div className="mt-3 inline-block px-4 py-1 bg-primary-50 rounded-full">
              <span className="text-sm font-semibold text-primary-700">STUDENT REPORT CARD - {selectedCard.term} {selectedCard.year}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div><span className="text-gray-500">Name:</span> <strong>{selectedCard.student.firstName} {selectedCard.student.lastName}</strong></div>
            <div><span className="text-gray-500">Adm No:</span> <strong>{selectedCard.student.admissionNo}</strong></div>
            <div><span className="text-gray-500">Class:</span> <strong>{selectedCard.student.className}</strong></div>
            <div><span className="text-gray-500">Gender:</span> <strong className="capitalize">{selectedCard.student.gender}</strong></div>
          </div>

          <table className="w-full text-sm border-collapse mb-6">
            <thead>
              <tr className="bg-primary-50 dark:bg-primary-900/30">
                <th className="border p-2 text-left">Subject</th>
                <th className="border p-2 text-center">Marks</th>
                <th className="border p-2 text-center">Total</th>
                <th className="border p-2 text-center">Grade</th>
                <th className="border p-2 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {selectedCard.grades.map(g => (
                <tr key={g.id}>
                  <td className="border p-2">{g.subjectName}</td>
                  <td className="border p-2 text-center">{g.marksObtained}</td>
                  <td className="border p-2 text-center">{g.totalMarks}</td>
                  <td className="border p-2 text-center font-bold">{g.grade}</td>
                  <td className="border p-2">{g.remarks || '-'}</td>
                </tr>
              ))}
              <tr className="font-bold bg-gray-50 dark:bg-gray-700/50">
                <td className="border p-2">Total</td>
                <td className="border p-2 text-center">{selectedCard.obtainedMarks}</td>
                <td className="border p-2 text-center">{selectedCard.totalMarks}</td>
                <td className="border p-2 text-center">{selectedCard.percentage.toFixed(1)}%</td>
                <td className="border p-2">{selectedCard.rank ? `Rank: ${selectedCard.rank}` : ''}</td>
              </tr>
            </tbody>
          </table>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="font-medium mb-1">Attendance</p>
              <p>Present: {selectedCard.attendance.present} / {selectedCard.attendance.total} days</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="font-medium mb-1">Percentage</p>
              <p className="text-2xl font-bold text-primary-600">{selectedCard.percentage.toFixed(1)}%</p>
            </div>
          </div>

          <div className="space-y-3 text-sm border-t pt-4">
            <div><span className="text-gray-500">Class Teacher's Remarks:</span> <em>{selectedCard.teacherRemarks || 'Good performance'}</em></div>
            <div><span className="text-gray-500">Principal's Remarks:</span> <em>{selectedCard.principalRemarks || 'Keep it up'}</em></div>
          </div>

          <div className="flex justify-between mt-8 pt-4 border-t text-sm text-gray-500">
            <div className="text-center"><div className="border-t border-gray-400 w-32 mb-1" /><p>Class Teacher</p></div>
            <div className="text-center"><div className="border-t border-gray-400 w-32 mb-1" /><p>Principal</p></div>
            <div className="text-center"><div className="border-t border-gray-400 w-32 mb-1" /><p>Parent/Guardian</p></div>
          </div>
        </div>
      )}
    </div>
  );
}
