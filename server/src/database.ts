import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data', 'school.db');

import fs from 'fs';
fs.mkdirSync(path.join(__dirname, '..', 'data'), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL,
      firstName TEXT NOT NULL, lastName TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'student',
      phone TEXT, avatar TEXT, isActive INTEGER DEFAULT 1, createdAt TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY, admissionNo TEXT UNIQUE NOT NULL, firstName TEXT NOT NULL, lastName TEXT NOT NULL,
      dateOfBirth TEXT, gender TEXT DEFAULT 'male', classId TEXT, parentId TEXT, parentName TEXT,
      parentPhone TEXT, parentEmail TEXT, address TEXT, avatar TEXT, healthInfo TEXT,
      isActive INTEGER DEFAULT 1, enrollmentDate TEXT DEFAULT (date('now')), createdAt TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY, employeeId TEXT UNIQUE NOT NULL, firstName TEXT NOT NULL, lastName TEXT NOT NULL,
      email TEXT, phone TEXT, role TEXT DEFAULT 'teacher', department TEXT, designation TEXT,
      salary REAL DEFAULT 0, joinDate TEXT, avatar TEXT, isActive INTEGER DEFAULT 1, createdAt TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, section TEXT, teacherId TEXT, capacity INTEGER DEFAULT 40,
      currentStrength INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, code TEXT NOT NULL, classId TEXT, teacherId TEXT
    );
    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY, userId TEXT NOT NULL, type TEXT NOT NULL, date TEXT NOT NULL,
      status TEXT DEFAULT 'present', checkInTime TEXT, checkOutTime TEXT, method TEXT DEFAULT 'manual'
    );
    CREATE TABLE IF NOT EXISTS exams (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, classId TEXT, subjectId TEXT, date TEXT,
      totalMarks INTEGER DEFAULT 100, passingMarks INTEGER DEFAULT 40, term TEXT
    );
    CREATE TABLE IF NOT EXISTS grades (
      id TEXT PRIMARY KEY, studentId TEXT NOT NULL, examId TEXT, subjectId TEXT,
      marksObtained REAL NOT NULL, totalMarks REAL DEFAULT 100, grade TEXT, remarks TEXT
    );
    CREATE TABLE IF NOT EXISTS fee_structures (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, classId TEXT, amount REAL NOT NULL,
      term TEXT, dueDate TEXT, description TEXT
    );
    CREATE TABLE IF NOT EXISTS fees (
      id TEXT PRIMARY KEY, studentId TEXT NOT NULL, feeStructureId TEXT, description TEXT,
      totalAmount REAL NOT NULL, paidAmount REAL DEFAULT 0, balance REAL NOT NULL,
      dueDate TEXT, status TEXT DEFAULT 'unpaid'
    );
    CREATE TABLE IF NOT EXISTS fee_payments (
      id TEXT PRIMARY KEY, feeId TEXT NOT NULL, amount REAL NOT NULL, paymentDate TEXT DEFAULT (datetime('now')),
      method TEXT DEFAULT 'cash', receiptNo TEXT, remarks TEXT
    );
    CREATE TABLE IF NOT EXISTS timetable (
      id TEXT PRIMARY KEY, classId TEXT, subjectId TEXT, teacherId TEXT,
      dayOfWeek INTEGER, startTime TEXT, endTime TEXT, room TEXT
    );
    CREATE TABLE IF NOT EXISTS library_books (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, author TEXT NOT NULL, isbn TEXT,
      category TEXT, totalCopies INTEGER DEFAULT 1, availableCopies INTEGER DEFAULT 1,
      isEbook INTEGER DEFAULT 0, ebookUrl TEXT
    );
    CREATE TABLE IF NOT EXISTS book_borrowings (
      id TEXT PRIMARY KEY, bookId TEXT NOT NULL, userId TEXT NOT NULL,
      borrowDate TEXT DEFAULT (date('now')), dueDate TEXT NOT NULL, returnDate TEXT,
      status TEXT DEFAULT 'borrowed', fine REAL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS transport (
      id TEXT PRIMARY KEY, routeName TEXT NOT NULL, vehicleNo TEXT, vehicleType TEXT DEFAULT 'bus',
      driverName TEXT, driverPhone TEXT, capacity INTEGER DEFAULT 40, currentOccupancy INTEGER DEFAULT 0,
      gpsTrackerId TEXT
    );
    CREATE TABLE IF NOT EXISTS transport_stops (
      id TEXT PRIMARY KEY, routeId TEXT NOT NULL, stopName TEXT, arrivalTime TEXT,
      latitude REAL, longitude REAL, sortOrder INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS hostels (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT DEFAULT 'boys',
      totalRooms INTEGER DEFAULT 0, occupiedRooms INTEGER DEFAULT 0, warden TEXT
    );
    CREATE TABLE IF NOT EXISTS health_records (
      id TEXT PRIMARY KEY, studentId TEXT NOT NULL, condition TEXT, description TEXT,
      date TEXT DEFAULT (date('now')), treatment TEXT, doctor TEXT, followUpDate TEXT
    );
    CREATE TABLE IF NOT EXISTS discipline_records (
      id TEXT PRIMARY KEY, studentId TEXT NOT NULL, violation TEXT, description TEXT,
      date TEXT DEFAULT (date('now')), action TEXT, reportedBy TEXT, status TEXT DEFAULT 'pending'
    );
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT, date TEXT NOT NULL,
      endDate TEXT, location TEXT, type TEXT DEFAULT 'other', isAllDay INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY, senderId TEXT NOT NULL, receiverId TEXT NOT NULL,
      subject TEXT, body TEXT, isRead INTEGER DEFAULT 0, createdAt TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY, userId TEXT NOT NULL, title TEXT, message TEXT,
      type TEXT DEFAULT 'info', isRead INTEGER DEFAULT 0, link TEXT, createdAt TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT, category TEXT DEFAULT 'general',
      uploadedBy TEXT, fileUrl TEXT, fileSize INTEGER DEFAULT 0, createdAt TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS visitors (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT, purpose TEXT,
      visitingPerson TEXT, checkIn TEXT DEFAULT (datetime('now')), checkOut TEXT,
      idType TEXT, idNumber TEXT, status TEXT DEFAULT 'checked_in'
    );
    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT, quantity INTEGER DEFAULT 0,
      unitPrice REAL DEFAULT 0, totalValue REAL DEFAULT 0, location TEXT, supplier TEXT,
      reorderLevel INTEGER DEFAULT 10, status TEXT DEFAULT 'in_stock'
    );
    CREATE TABLE IF NOT EXISTS accounting (
      id TEXT PRIMARY KEY, date TEXT NOT NULL, description TEXT, type TEXT NOT NULL,
      category TEXT, amount REAL NOT NULL, reference TEXT, paymentMethod TEXT DEFAULT 'cash',
      status TEXT DEFAULT 'completed', createdBy TEXT
    );
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY DEFAULT '1', schoolName TEXT DEFAULT 'My School', schoolLogo TEXT,
      schoolBadge TEXT, address TEXT, phone TEXT, email TEXT, website TEXT,
      currency TEXT DEFAULT 'USD', language TEXT DEFAULT 'en', timezone TEXT DEFAULT 'UTC',
      currentTerm TEXT DEFAULT 'Term 1', currentYear TEXT DEFAULT '2026'
    );
    INSERT OR IGNORE INTO settings (id) VALUES ('1');
  `);
}

export default db;
