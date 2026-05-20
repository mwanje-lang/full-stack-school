import db from './database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

export function seedDatabase() {
  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@school.com');
  if (existingAdmin) return;

  const hash = (pwd: string) => bcrypt.hashSync(pwd, 10);

  const adminId = uuid(), teacherId = uuid(), parentId = uuid(), studentUserId = uuid(), accountantId = uuid();

  db.prepare(`INSERT INTO users (id, email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?, ?)`).run(adminId, 'admin@school.com', hash('admin123'), 'Admin', 'User', 'admin');
  db.prepare(`INSERT INTO users (id, email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?, ?)`).run(teacherId, 'teacher@school.com', hash('teacher123'), 'Sarah', 'Johnson', 'teacher');
  db.prepare(`INSERT INTO users (id, email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?, ?)`).run(parentId, 'parent@school.com', hash('parent123'), 'James', 'Williams', 'parent');
  db.prepare(`INSERT INTO users (id, email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?, ?)`).run(studentUserId, 'student@school.com', hash('student123'), 'Tom', 'Williams', 'student');
  db.prepare(`INSERT INTO users (id, email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?, ?)`).run(accountantId, 'accountant@school.com', hash('accountant123'), 'Mary', 'Brown', 'accountant');

  // Classes
  const classes = [
    { id: uuid(), name: 'Class 10', section: 'A', capacity: 40 },
    { id: uuid(), name: 'Class 10', section: 'B', capacity: 40 },
    { id: uuid(), name: 'Class 9', section: 'A', capacity: 40 },
    { id: uuid(), name: 'Class 9', section: 'B', capacity: 35 },
    { id: uuid(), name: 'Class 8', section: 'A', capacity: 40 },
  ];
  for (const c of classes) {
    db.prepare('INSERT INTO classes (id, name, section, teacherId, capacity, currentStrength) VALUES (?, ?, ?, ?, ?, ?)').run(c.id, c.name, c.section, teacherId, c.capacity, Math.floor(Math.random() * 30) + 10);
  }

  // Subjects
  const subjects = ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Computer Science'];
  const subjectIds: string[] = [];
  for (const s of subjects) {
    const sid = uuid();
    subjectIds.push(sid);
    db.prepare('INSERT INTO subjects (id, name, code, classId, teacherId) VALUES (?, ?, ?, ?, ?)').run(sid, s, s.substring(0, 3).toUpperCase(), classes[0].id, teacherId);
  }

  // Students
  const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Hannah', 'Isaac', 'Julia', 'Kevin', 'Laura', 'Michael'];
  const lastNames = ['Doe', 'Smith', 'Wilson', 'Johnson', 'Brown', 'Davis', 'Miller', 'Garcia', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Jackson', 'White', 'Harris'];
  const studentIds: string[] = [];
  for (let i = 0; i < 15; i++) {
    const sid = uuid();
    studentIds.push(sid);
    const classIdx = i % classes.length;
    db.prepare('INSERT INTO students (id, admissionNo, firstName, lastName, dateOfBirth, gender, classId, parentName, parentPhone, parentEmail, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)')
      .run(sid, `ADM-${2024000 + i}`, firstNames[i], lastNames[i], `200${8 + (i % 3)}-0${(i % 9) + 1}-${(i % 28) + 1}`, i % 2 === 0 ? 'male' : 'female', classes[classIdx].id, `Parent of ${firstNames[i]}`, `+256700${100000 + i}`, `parent${i}@email.com`);
  }

  // Staff
  const staffRoles = [{ fn: 'Robert', ln: 'Taylor', role: 'teacher', dept: 'Mathematics' }, { fn: 'Emily', ln: 'Clark', role: 'teacher', dept: 'English' }, { fn: 'David', ln: 'Lee', role: 'librarian', dept: 'Library' }];
  for (let i = 0; i < staffRoles.length; i++) {
    const s = staffRoles[i];
    db.prepare('INSERT INTO staff (id, employeeId, firstName, lastName, email, role, department, designation, salary, joinDate, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)')
      .run(uuid(), `EMP-${1000 + i}`, s.fn, s.ln, `${s.fn.toLowerCase()}@school.com`, s.role, s.dept, 'Senior ' + s.role, 3500 + i * 500, '2023-01-15');
  }

  // Exams & Grades
  for (let si = 0; si < 4; si++) {
    const examId = uuid();
    db.prepare('INSERT INTO exams (id, name, classId, subjectId, date, totalMarks, passingMarks, term) VALUES (?, ?, ?, ?, ?, 100, 40, ?)').run(examId, `Mid-Term ${subjects[si]}`, classes[0].id, subjectIds[si], '2026-06-01', 'Term 1');
    for (let j = 0; j < 5; j++) {
      const marks = Math.floor(Math.random() * 50) + 50;
      const grade = marks >= 90 ? 'A+' : marks >= 80 ? 'A' : marks >= 70 ? 'B' : marks >= 60 ? 'C' : marks >= 50 ? 'D' : 'F';
      db.prepare('INSERT INTO grades (id, studentId, examId, subjectId, marksObtained, totalMarks, grade) VALUES (?, ?, ?, ?, ?, 100, ?)').run(uuid(), studentIds[j], examId, subjectIds[si], marks, grade);
    }
  }

  // Fee Structures & Fees
  const feeStructId = uuid();
  db.prepare('INSERT INTO fee_structures (id, name, classId, amount, term, dueDate, description) VALUES (?, ?, ?, ?, ?, ?, ?)').run(feeStructId, 'Tuition Fee', classes[0].id, 1500, 'Term 1', '2026-06-30', 'Term 1 Tuition Fee');

  for (let i = 0; i < 5; i++) {
    const feeId = uuid();
    const paid = [1500, 800, 0, 500, 1500][i];
    const balance = 1500 - paid;
    const status = balance === 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid';
    db.prepare('INSERT INTO fees (id, studentId, feeStructureId, description, totalAmount, paidAmount, balance, dueDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(feeId, studentIds[i], feeStructId, 'Tuition Fee', 1500, paid, balance, '2026-06-30', status);
    if (paid > 0) {
      db.prepare('INSERT INTO fee_payments (id, feeId, amount, method, receiptNo) VALUES (?, ?, ?, ?, ?)').run(uuid(), feeId, paid, 'cash', `RCP-${1000 + i}`);
    }
  }

  // Library Books
  const books = [
    { title: 'Mathematics Vol 1', author: 'Dr. R. Sharma', isbn: '978-0001', cat: 'Textbook', copies: 10 },
    { title: 'English Literature', author: 'Jane Austen', isbn: '978-0002', cat: 'Literature', copies: 8 },
    { title: 'Physics Fundamentals', author: 'Dr. H.C. Verma', isbn: '978-0003', cat: 'Textbook', copies: 12 },
    { title: 'World History', author: 'J. M. Roberts', isbn: '978-0004', cat: 'Reference', copies: 5 },
  ];
  for (const b of books) {
    db.prepare('INSERT INTO library_books (id, title, author, isbn, category, totalCopies, availableCopies) VALUES (?, ?, ?, ?, ?, ?, ?)').run(uuid(), b.title, b.author, b.isbn, b.cat, b.copies, b.copies - 1);
  }

  // Events
  const events = [
    { title: 'Parent-Teacher Meeting', desc: 'Annual PTA meeting', date: '2026-05-25', type: 'meeting' },
    { title: 'Mid-Term Exams', desc: 'Mid-term examinations begin', date: '2026-06-01', type: 'exam' },
    { title: 'Sports Day', desc: 'Annual sports competition', date: '2026-06-15', type: 'sports' },
    { title: 'School Anniversary', desc: 'Celebrating 25 years', date: '2026-07-01', type: 'cultural' },
  ];
  for (const e of events) {
    db.prepare('INSERT INTO events (id, title, description, date, type) VALUES (?, ?, ?, ?, ?)').run(uuid(), e.title, e.desc, e.date, e.type);
  }

  // Transport
  db.prepare('INSERT INTO transport (id, routeName, vehicleNo, vehicleType, driverName, driverPhone, capacity, currentOccupancy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(uuid(), 'Route A - City Center', 'KA-01-1234', 'bus', 'Peter Ouma', '+256701234567', 50, 35);
  db.prepare('INSERT INTO transport (id, routeName, vehicleNo, vehicleType, driverName, driverPhone, capacity, currentOccupancy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(uuid(), 'Route B - Suburbs', 'KA-02-5678', 'minibus', 'Samuel Kato', '+256702345678', 30, 22);

  // Hostels
  db.prepare('INSERT INTO hostels (id, name, type, totalRooms, occupiedRooms, warden) VALUES (?, ?, ?, ?, ?, ?)').run(uuid(), 'Unity Hall', 'boys', 50, 42, 'Mr. Joseph Okello');
  db.prepare('INSERT INTO hostels (id, name, type, totalRooms, occupiedRooms, warden) VALUES (?, ?, ?, ?, ?, ?)').run(uuid(), 'Grace Hall', 'girls', 45, 38, 'Mrs. Sarah Nambi');

  // Inventory
  db.prepare('INSERT INTO inventory (id, name, category, quantity, unitPrice, totalValue, location, reorderLevel, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(uuid(), 'Student Desks', 'Furniture', 200, 45, 9000, 'Storeroom A', 20, 'in_stock');
  db.prepare('INSERT INTO inventory (id, name, category, quantity, unitPrice, totalValue, location, reorderLevel, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(uuid(), 'Whiteboard Markers', 'Stationery', 5, 2.5, 12.5, 'Office', 50, 'low_stock');

  // Accounting
  db.prepare('INSERT INTO accounting (id, date, description, type, category, amount, paymentMethod, status, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(uuid(), '2026-05-01', 'Tuition Fee Collection', 'income', 'Fees', 25000, 'bank', 'completed', adminId);
  db.prepare('INSERT INTO accounting (id, date, description, type, category, amount, paymentMethod, status, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(uuid(), '2026-05-05', 'Staff Salaries', 'expense', 'Payroll', 18000, 'bank', 'completed', adminId);
  db.prepare('INSERT INTO accounting (id, date, description, type, category, amount, paymentMethod, status, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(uuid(), '2026-05-10', 'School Supplies', 'expense', 'Supplies', 3500, 'cash', 'completed', adminId);

  console.log('Database seeded successfully');
}
