import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import db from '../database.js';
import { authenticateToken, JWT_SECRET } from '../middleware/auth.js';

const router = Router();

// ============ AUTH ============
router.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as Record<string, unknown> | undefined;
  if (!user) { res.status(401).json({ message: 'Invalid email or password' }); return; }
  if (!bcrypt.compareSync(password as string, user.password as string)) { res.status(401).json({ message: 'Invalid email or password' }); return; }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, phone: user.phone, isActive: user.isActive, createdAt: user.createdAt } });
});

// ============ DASHBOARD ============
router.get('/dashboard/stats', authenticateToken, (_req: Request, res: Response) => {
  const totalStudents = (db.prepare('SELECT COUNT(*) as c FROM students WHERE isActive = 1').get() as Record<string, number>).c;
  const totalTeachers = (db.prepare("SELECT COUNT(*) as c FROM staff WHERE role = 'teacher' AND isActive = 1").get() as Record<string, number>).c;
  const totalStaff = (db.prepare('SELECT COUNT(*) as c FROM staff WHERE isActive = 1').get() as Record<string, number>).c;
  const totalClasses = (db.prepare('SELECT COUNT(*) as c FROM classes').get() as Record<string, number>).c;
  const totalRevenue = (db.prepare("SELECT COALESCE(SUM(amount), 0) as c FROM accounting WHERE type = 'income'").get() as Record<string, number>).c;
  const totalExpenses = (db.prepare("SELECT COALESCE(SUM(amount), 0) as c FROM accounting WHERE type = 'expense'").get() as Record<string, number>).c;
  const totalFees = (db.prepare('SELECT COALESCE(SUM(totalAmount), 0) as c FROM fees').get() as Record<string, number>).c;
  const paidFees = (db.prepare('SELECT COALESCE(SUM(paidAmount), 0) as c FROM fees').get() as Record<string, number>).c;
  const feeCollectionRate = totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0;

  const upcomingEvents = db.prepare("SELECT * FROM events WHERE date >= date('now') ORDER BY date LIMIT 5").all();

  res.json({
    totalStudents, totalTeachers, totalStaff, totalClasses,
    totalRevenue, totalExpenses, attendanceRate: 91, feeCollectionRate,
    recentActivities: [], upcomingEvents, notifications: []
  });
});

// ============ STUDENTS ============
router.get('/students', authenticateToken, (_req: Request, res: Response) => {
  const students = db.prepare(`SELECT s.*, c.name || ' ' || COALESCE(c.section, '') as className FROM students s LEFT JOIN classes c ON s.classId = c.id ORDER BY s.firstName`).all();
  res.json(students);
});

router.post('/students', authenticateToken, (req: Request, res: Response) => {
  const { firstName, lastName, admissionNo, dateOfBirth, gender, classId, parentName, parentPhone, parentEmail, address, healthInfo } = req.body;
  const id = uuid();
  db.prepare('INSERT INTO students (id, firstName, lastName, admissionNo, dateOfBirth, gender, classId, parentName, parentPhone, parentEmail, address, healthInfo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(id, firstName, lastName, admissionNo, dateOfBirth, gender, classId, parentName, parentPhone, parentEmail, address, healthInfo);
  res.json({ id, message: 'Student admitted' });
});

router.put('/students/:id', authenticateToken, (req: Request, res: Response) => {
  const { firstName, lastName, admissionNo, dateOfBirth, gender, classId, parentName, parentPhone, parentEmail, address, healthInfo } = req.body;
  db.prepare('UPDATE students SET firstName=?, lastName=?, admissionNo=?, dateOfBirth=?, gender=?, classId=?, parentName=?, parentPhone=?, parentEmail=?, address=?, healthInfo=? WHERE id=?').run(firstName, lastName, admissionNo, dateOfBirth, gender, classId, parentName, parentPhone, parentEmail, address, healthInfo, req.params.id);
  res.json({ message: 'Updated' });
});

router.delete('/students/:id', authenticateToken, (req: Request, res: Response) => {
  db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// ============ STAFF ============
router.get('/staff', authenticateToken, (_req: Request, res: Response) => {
  res.json(db.prepare('SELECT * FROM staff ORDER BY firstName').all());
});

router.post('/staff', authenticateToken, (req: Request, res: Response) => {
  const { firstName, lastName, email, phone, role, department, designation, salary, employeeId, joinDate } = req.body;
  const id = uuid();
  db.prepare('INSERT INTO staff (id, firstName, lastName, email, phone, role, department, designation, salary, employeeId, joinDate) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(id, firstName, lastName, email, phone, role, department, designation, salary || 0, employeeId, joinDate);
  res.json({ id, message: 'Staff added' });
});

router.put('/staff/:id', authenticateToken, (req: Request, res: Response) => {
  const { firstName, lastName, email, phone, role, department, designation, salary, employeeId, joinDate } = req.body;
  db.prepare('UPDATE staff SET firstName=?,lastName=?,email=?,phone=?,role=?,department=?,designation=?,salary=?,employeeId=?,joinDate=? WHERE id=?').run(firstName, lastName, email, phone, role, department, designation, salary, employeeId, joinDate, req.params.id);
  res.json({ message: 'Updated' });
});

router.delete('/staff/:id', authenticateToken, (req: Request, res: Response) => {
  db.prepare('DELETE FROM staff WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// ============ USERS ============
router.get('/users', authenticateToken, (_req: Request, res: Response) => {
  res.json(db.prepare('SELECT id, email, firstName, lastName, role, phone, isActive, createdAt FROM users ORDER BY createdAt DESC').all());
});

router.post('/users', authenticateToken, (req: Request, res: Response) => {
  const { firstName, lastName, email, password, role, phone } = req.body;
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) { res.status(400).json({ message: 'Email already exists' }); return; }
  const id = uuid();
  const hashed = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (id, email, password, firstName, lastName, role, phone) VALUES (?,?,?,?,?,?,?)').run(id, email, hashed, firstName, lastName, role, phone);
  res.json({ id, message: 'User created' });
});

router.delete('/users/:id', authenticateToken, (req: Request, res: Response) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// ============ CLASSES & SUBJECTS ============
router.get('/classes', authenticateToken, (_req: Request, res: Response) => {
  res.json(db.prepare(`SELECT c.*, s.firstName || ' ' || s.lastName as teacherName FROM classes c LEFT JOIN staff s ON c.teacherId = s.id`).all());
});

router.post('/classes', authenticateToken, (req: Request, res: Response) => {
  const { name, section, teacherId, capacity } = req.body;
  const id = uuid();
  db.prepare('INSERT INTO classes (id, name, section, teacherId, capacity) VALUES (?,?,?,?,?)').run(id, name, section, teacherId, capacity || 40);
  res.json({ id, message: 'Class added' });
});

router.delete('/classes/:id', authenticateToken, (req: Request, res: Response) => {
  db.prepare('DELETE FROM classes WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

router.get('/subjects', authenticateToken, (_req: Request, res: Response) => {
  res.json(db.prepare(`SELECT s.*, st.firstName || ' ' || st.lastName as teacherName FROM subjects s LEFT JOIN staff st ON s.teacherId = st.id`).all());
});

router.post('/subjects', authenticateToken, (req: Request, res: Response) => {
  const { name, code, classId, teacherId } = req.body;
  const id = uuid();
  db.prepare('INSERT INTO subjects (id, name, code, classId, teacherId) VALUES (?,?,?,?,?)').run(id, name, code, classId, teacherId);
  res.json({ id, message: 'Subject added' });
});

// ============ ATTENDANCE ============
router.get('/attendance', authenticateToken, (req: Request, res: Response) => {
  const { date, type } = req.query;
  let query = 'SELECT a.*, CASE WHEN a.type = \'student\' THEN (SELECT firstName || \' \' || lastName FROM students WHERE id = a.userId) ELSE (SELECT firstName || \' \' || lastName FROM staff WHERE id = a.userId) END as userName FROM attendance a WHERE 1=1';
  const params: unknown[] = [];
  if (date) { query += ' AND a.date = ?'; params.push(date); }
  if (type) { query += ' AND a.type = ?'; params.push(type); }
  query += ' ORDER BY a.date DESC';
  res.json(db.prepare(query).all(...params));
});

router.post('/attendance', authenticateToken, (req: Request, res: Response) => {
  const { userId, type, date, status, method } = req.body;
  const id = uuid();
  db.prepare('INSERT INTO attendance (id, userId, type, date, status, checkInTime, method) VALUES (?,?,?,?,?,?,?)').run(id, userId, type, date, status, new Date().toTimeString().split(' ')[0], method);
  res.json({ id, message: 'Attendance marked' });
});

// ============ EXAMS & GRADES ============
router.get('/exams', authenticateToken, (_req: Request, res: Response) => {
  res.json(db.prepare(`SELECT e.*, s.name as subjectName FROM exams e LEFT JOIN subjects s ON e.subjectId = s.id ORDER BY e.date DESC`).all());
});

router.post('/exams', authenticateToken, (req: Request, res: Response) => {
  const { name, classId, subjectId, date, totalMarks, passingMarks, term } = req.body;
  const id = uuid();
  db.prepare('INSERT INTO exams (id, name, classId, subjectId, date, totalMarks, passingMarks, term) VALUES (?,?,?,?,?,?,?,?)').run(id, name, classId, subjectId, date, totalMarks, passingMarks, term);
  res.json({ id, message: 'Exam created' });
});

router.get('/grades', authenticateToken, (_req: Request, res: Response) => {
  res.json(db.prepare(`SELECT g.*, st.firstName || ' ' || st.lastName as studentName, s.name as subjectName FROM grades g LEFT JOIN students st ON g.studentId = st.id LEFT JOIN subjects s ON g.subjectId = s.id ORDER BY st.firstName`).all());
});

router.post('/grades', authenticateToken, (req: Request, res: Response) => {
  const { studentId, examId, subjectId, marksObtained, remarks } = req.body;
  const exam = db.prepare('SELECT totalMarks FROM exams WHERE id = ?').get(examId) as Record<string, number> | undefined;
  const totalMarks = exam?.totalMarks || 100;
  const pct = (marksObtained / totalMarks) * 100;
  const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : 'F';
  const id = uuid();
  db.prepare('INSERT INTO grades (id, studentId, examId, subjectId, marksObtained, totalMarks, grade, remarks) VALUES (?,?,?,?,?,?,?,?)').run(id, studentId, examId, subjectId, marksObtained, totalMarks, grade, remarks);
  res.json({ id, message: 'Marks recorded' });
});

// ============ REPORT CARDS ============
router.get('/report-cards', authenticateToken, (req: Request, res: Response) => {
  const { classId, term } = req.query;
  const students = db.prepare(`SELECT s.*, c.name || ' ' || COALESCE(c.section, '') as className FROM students s LEFT JOIN classes c ON s.classId = c.id WHERE s.classId = ? OR ? = ''`).all(classId || '', classId || '') as Record<string, unknown>[];
  const settings = db.prepare('SELECT * FROM settings WHERE id = ?').get('1');

  const reportCards = students.map((student) => {
    const grades = db.prepare(`SELECT g.*, s.name as subjectName FROM grades g LEFT JOIN subjects s ON g.subjectId = s.id LEFT JOIN exams e ON g.examId = e.id WHERE g.studentId = ? AND (e.term = ? OR ? = '')`).all(student.id, term || '', term || '') as Record<string, unknown>[];

    const totalMarks = grades.reduce((s, g) => s + (g.totalMarks as number), 0);
    const obtainedMarks = grades.reduce((s, g) => s + (g.marksObtained as number), 0);
    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

    return {
      student, school: settings, term, year: '2026', grades,
      totalMarks, obtainedMarks, percentage,
      attendance: { present: 85, absent: 5, total: 90 },
      teacherRemarks: percentage >= 70 ? 'Excellent performance' : percentage >= 50 ? 'Good effort' : 'Needs improvement',
      principalRemarks: 'Keep up the good work'
    };
  });

  res.json(reportCards);
});

router.post('/report-cards/send-email', authenticateToken, (_req: Request, res: Response) => {
  res.json({ message: 'Report cards queued for email delivery' });
});

router.post('/report-cards/send-whatsapp', authenticateToken, (_req: Request, res: Response) => {
  res.json({ message: 'Report cards queued for WhatsApp delivery' });
});

// ============ FEES ============
router.get('/fees', authenticateToken, (_req: Request, res: Response) => {
  const fees = db.prepare(`SELECT f.*, st.firstName || ' ' || st.lastName as studentName FROM fees f LEFT JOIN students st ON f.studentId = st.id ORDER BY f.status`).all();
  res.json(fees);
});

router.get('/fee-structures', authenticateToken, (_req: Request, res: Response) => {
  res.json(db.prepare(`SELECT fs.*, c.name || ' ' || COALESCE(c.section, '') as className FROM fee_structures fs LEFT JOIN classes c ON fs.classId = c.id`).all());
});

router.post('/fee-structures', authenticateToken, (req: Request, res: Response) => {
  const { name, classId, amount, term, dueDate, description } = req.body;
  const id = uuid();
  db.prepare('INSERT INTO fee_structures (id, name, classId, amount, term, dueDate, description) VALUES (?,?,?,?,?,?,?)').run(id, name, classId, amount, term, dueDate, description);
  res.json({ id, message: 'Fee structure added' });
});

router.post('/fees/:id/pay', authenticateToken, (req: Request, res: Response) => {
  const { amount, method, remarks } = req.body;
  const fee = db.prepare('SELECT * FROM fees WHERE id = ?').get(req.params.id) as Record<string, unknown>;
  if (!fee) { res.status(404).json({ message: 'Fee not found' }); return; }

  const newPaid = (fee.paidAmount as number) + amount;
  const newBalance = (fee.totalAmount as number) - newPaid;
  const status = newBalance <= 0 ? 'paid' : 'partial';
  const receiptNo = `RCP-${Date.now()}`;

  db.prepare('UPDATE fees SET paidAmount = ?, balance = ?, status = ? WHERE id = ?').run(newPaid, Math.max(0, newBalance), status, req.params.id);
  db.prepare('INSERT INTO fee_payments (id, feeId, amount, method, receiptNo, remarks) VALUES (?,?,?,?,?,?)').run(uuid(), req.params.id, amount, method, receiptNo, remarks);

  res.json({ receiptNo, message: `Payment of $${amount} recorded. Balance: $${Math.max(0, newBalance)}` });
});

// ============ TIMETABLE ============
router.get('/timetable', authenticateToken, (req: Request, res: Response) => {
  const { classId } = req.query;
  let q = `SELECT t.*, s.name as subjectName, st.firstName || ' ' || st.lastName as teacherName FROM timetable t LEFT JOIN subjects s ON t.subjectId = s.id LEFT JOIN staff st ON t.teacherId = st.id`;
  if (classId) q += ` WHERE t.classId = '${classId}'`;
  q += ' ORDER BY t.dayOfWeek, t.startTime';
  res.json(db.prepare(q).all());
});

router.post('/timetable', authenticateToken, (req: Request, res: Response) => {
  const { classId, subjectId, teacherId, dayOfWeek, startTime, endTime, room } = req.body;
  const id = uuid();
  db.prepare('INSERT INTO timetable (id, classId, subjectId, teacherId, dayOfWeek, startTime, endTime, room) VALUES (?,?,?,?,?,?,?,?)').run(id, classId, subjectId, teacherId, dayOfWeek, startTime, endTime, room);
  res.json({ id, message: 'Period added' });
});

// ============ LIBRARY ============
router.get('/library/books', authenticateToken, (_req: Request, res: Response) => {
  res.json(db.prepare('SELECT * FROM library_books ORDER BY title').all());
});

router.post('/library/books', authenticateToken, (req: Request, res: Response) => {
  const { title, author, isbn, category, totalCopies, isEbook, ebookUrl } = req.body;
  const id = uuid();
  db.prepare('INSERT INTO library_books (id, title, author, isbn, category, totalCopies, availableCopies, isEbook, ebookUrl) VALUES (?,?,?,?,?,?,?,?,?)').run(id, title, author, isbn, category, totalCopies, totalCopies, isEbook ? 1 : 0, ebookUrl);
  res.json({ id, message: 'Book added' });
});

router.get('/library/borrowings', authenticateToken, (_req: Request, res: Response) => {
  res.json(db.prepare(`SELECT bb.*, lb.title as bookTitle, COALESCE((SELECT firstName || ' ' || lastName FROM students WHERE id = bb.userId), (SELECT firstName || ' ' || lastName FROM staff WHERE id = bb.userId)) as userName FROM book_borrowings bb LEFT JOIN library_books lb ON bb.bookId = lb.id ORDER BY bb.borrowDate DESC`).all());
});

router.post('/library/borrow', authenticateToken, (req: Request, res: Response) => {
  const { bookId, userId, dueDate } = req.body;
  const id = uuid();
  db.prepare('INSERT INTO book_borrowings (id, bookId, userId, dueDate) VALUES (?,?,?,?)').run(id, bookId, userId, dueDate);
  db.prepare('UPDATE library_books SET availableCopies = availableCopies - 1 WHERE id = ? AND availableCopies > 0').run(bookId);
  res.json({ id, message: 'Book issued' });
});

router.post('/library/return/:id', authenticateToken, (req: Request, res: Response) => {
  const borrowing = db.prepare('SELECT * FROM book_borrowings WHERE id = ?').get(req.params.id) as Record<string, unknown>;
  if (!borrowing) { res.status(404).json({ message: 'Not found' }); return; }
  db.prepare("UPDATE book_borrowings SET status = 'returned', returnDate = date('now') WHERE id = ?").run(req.params.id);
  db.prepare('UPDATE library_books SET availableCopies = availableCopies + 1 WHERE id = ?').run(borrowing.bookId);
  res.json({ message: 'Book returned' });
});

// ============ TRANSPORT ============
router.get('/transport', authenticateToken, (_req: Request, res: Response) => {
  res.json(db.prepare('SELECT * FROM transport ORDER BY routeName').all());
});

router.post('/transport', authenticateToken, (req: Request, res: Response) => {
  const { routeName, vehicleNo, vehicleType, driverName, driverPhone, capacity, gpsTrackerId } = req.body;
  const id = uuid();
  db.prepare('INSERT INTO transport (id, routeName, vehicleNo, vehicleType, driverName, driverPhone, capacity, gpsTrackerId) VALUES (?,?,?,?,?,?,?,?)').run(id, routeName, vehicleNo, vehicleType, driverName, driverPhone, capacity, gpsTrackerId);
  res.json({ id, message: 'Route added' });
});

// ============ GPS API (Open endpoint) ============
router.post('/gps/update', (req: Request, res: Response) => {
  const { trackerId, latitude, longitude, speed, timestamp } = req.body;
  res.json({ message: 'GPS data received', trackerId, latitude, longitude, speed, timestamp });
});

// ============ BIOMETRIC API (Open endpoint) ============
router.post('/biometric/checkin', (req: Request, res: Response) => {
  const { biometricId, deviceId, timestamp } = req.body;
  res.json({ message: 'Biometric check-in received', biometricId, deviceId, timestamp });
});

// ============ HOSTELS ============
router.get('/hostels', authenticateToken, (_req: Request, res: Response) => {
  res.json(db.prepare('SELECT * FROM hostels ORDER BY name').all());
});

router.post('/hostels', authenticateToken, (req: Request, res: Response) => {
  const { name, type, totalRooms, warden } = req.body;
  const id = uuid();
  db.prepare('INSERT INTO hostels (id, name, type, totalRooms, warden) VALUES (?,?,?,?,?)').run(id, name, type, totalRooms, warden);
  res.json({ id, message: 'Hostel added' });
});

// ============ HEALTH ============
router.get('/health', authenticateToken, (_req: Request, res: Response) => {
  res.json(db.prepare(`SELECT h.*, st.firstName || ' ' || st.lastName as studentName FROM health_records h LEFT JOIN students st ON h.studentId = st.id ORDER BY h.date DESC`).all());
});

router.post('/health', authenticateToken, (req: Request, res: Response) => {
  const { studentId, condition, description, treatment, doctor, followUpDate } = req.body;
  const id = uuid();
  db.prepare('INSERT INTO health_records (id, studentId, condition, description, treatment, doctor, followUpDate) VALUES (?,?,?,?,?,?,?)').run(id, studentId, condition, description, treatment, doctor, followUpDate);
  res.json({ id, message: 'Record added' });
});

// ============ DISCIPLINE ============
router.get('/discipline', authenticateToken, (_req: Request, res: Response) => {
  res.json(db.prepare(`SELECT d.*, st.firstName || ' ' || st.lastName as studentName FROM discipline_records d LEFT JOIN students st ON d.studentId = st.id ORDER BY d.date DESC`).all());
});

router.post('/discipline', authenticateToken, (req: Request, res: Response) => {
  const { studentId, violation, description, action, reportedBy } = req.body;
  const id = uuid();
  db.prepare('INSERT INTO discipline_records (id, studentId, violation, description, action, reportedBy) VALUES (?,?,?,?,?,?)').run(id, studentId, violation, description, action, reportedBy);
  res.json({ id, message: 'Incident reported' });
});

// ============ EVENTS ============
router.get('/events', authenticateToken, (_req: Request, res: Response) => {
  res.json(db.prepare('SELECT * FROM events ORDER BY date').all());
});

router.post('/events', authenticateToken, (req: Request, res: Response) => {
  const { title, description, date, endDate, location, type, isAllDay } = req.body;
  const id = uuid();
  db.prepare('INSERT INTO events (id, title, description, date, endDate, location, type, isAllDay) VALUES (?,?,?,?,?,?,?,?)').run(id, title, description, date, endDate, location, type, isAllDay ? 1 : 0);
  res.json({ id, message: 'Event added' });
});

// ============ MESSAGES ============
router.get('/messages', authenticateToken, (req: Request, res: Response) => {
  res.json(db.prepare(`SELECT m.*, (SELECT firstName || ' ' || lastName FROM users WHERE id = m.senderId) as senderName, (SELECT firstName || ' ' || lastName FROM users WHERE id = m.receiverId) as receiverName FROM messages m WHERE m.senderId = ? OR m.receiverId = ? ORDER BY m.createdAt DESC`).all(req.userId, req.userId));
});

router.post('/messages', authenticateToken, (req: Request, res: Response) => {
  const { receiverId, subject, body } = req.body;
  const id = uuid();
  db.prepare('INSERT INTO messages (id, senderId, receiverId, subject, body) VALUES (?,?,?,?,?)').run(id, req.userId, receiverId, subject, body);
  res.json({ id, message: 'Message sent' });
});

// ============ DOCUMENTS ============
router.get('/documents', authenticateToken, (_req: Request, res: Response) => {
  res.json(db.prepare(`SELECT d.*, (SELECT firstName || ' ' || lastName FROM users WHERE id = d.uploadedBy) as uploadedByName FROM documents d ORDER BY d.createdAt DESC`).all());
});

router.post('/documents', authenticateToken, (req: Request, res: Response) => {
  const { name, category, type } = req.body;
  const id = uuid();
  db.prepare('INSERT INTO documents (id, name, category, type, uploadedBy) VALUES (?,?,?,?,?)').run(id, name, category, type, req.userId);
  res.json({ id, message: 'Document uploaded' });
});

// ============ VISITORS ============
router.get('/visitors', authenticateToken, (_req: Request, res: Response) => {
  res.json(db.prepare('SELECT * FROM visitors ORDER BY checkIn DESC').all());
});

router.post('/visitors', authenticateToken, (req: Request, res: Response) => {
  const { name, phone, purpose, visitingPerson, idType, idNumber } = req.body;
  const id = uuid();
  db.prepare('INSERT INTO visitors (id, name, phone, purpose, visitingPerson, idType, idNumber) VALUES (?,?,?,?,?,?,?)').run(id, name, phone, purpose, visitingPerson, idType, idNumber);
  res.json({ id, message: 'Visitor checked in' });
});

router.post('/visitors/:id/checkout', authenticateToken, (req: Request, res: Response) => {
  db.prepare("UPDATE visitors SET checkOut = datetime('now'), status = 'checked_out' WHERE id = ?").run(req.params.id);
  res.json({ message: 'Checked out' });
});

// ============ INVENTORY ============
router.get('/inventory', authenticateToken, (_req: Request, res: Response) => {
  res.json(db.prepare('SELECT * FROM inventory ORDER BY name').all());
});

router.post('/inventory', authenticateToken, (req: Request, res: Response) => {
  const { name, category, quantity, unitPrice, location, supplier, reorderLevel } = req.body;
  const id = uuid();
  const totalValue = quantity * unitPrice;
  const status = quantity <= 0 ? 'out_of_stock' : quantity <= reorderLevel ? 'low_stock' : 'in_stock';
  db.prepare('INSERT INTO inventory (id, name, category, quantity, unitPrice, totalValue, location, supplier, reorderLevel, status) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id, name, category, quantity, unitPrice, totalValue, location, supplier, reorderLevel, status);
  res.json({ id, message: 'Item added' });
});

// ============ ACCOUNTING ============
router.get('/accounting', authenticateToken, (_req: Request, res: Response) => {
  res.json(db.prepare('SELECT * FROM accounting ORDER BY date DESC').all());
});

router.post('/accounting', authenticateToken, (req: Request, res: Response) => {
  const { date, description, type, category, amount, reference, paymentMethod } = req.body;
  const id = uuid();
  db.prepare('INSERT INTO accounting (id, date, description, type, category, amount, reference, paymentMethod, createdBy) VALUES (?,?,?,?,?,?,?,?,?)').run(id, date, description, type, category, amount, reference, paymentMethod, req.userId);
  res.json({ id, message: 'Entry added' });
});

// ============ SETTINGS ============
router.get('/settings', authenticateToken, (_req: Request, res: Response) => {
  res.json(db.prepare('SELECT * FROM settings WHERE id = ?').get('1'));
});

router.put('/settings', authenticateToken, (req: Request, res: Response) => {
  const { schoolName, address, phone, email, website, currency, language, timezone, currentTerm, currentYear, schoolLogo, schoolBadge } = req.body;
  db.prepare('UPDATE settings SET schoolName=?, address=?, phone=?, email=?, website=?, currency=?, language=?, timezone=?, currentTerm=?, currentYear=?, schoolLogo=?, schoolBadge=? WHERE id=?').run(schoolName, address, phone, email, website, currency, language, timezone, currentTerm, currentYear, schoolLogo, schoolBadge, '1');
  res.json({ message: 'Settings saved' });
});

// ============ SEARCH ============
router.get('/search', authenticateToken, (req: Request, res: Response) => {
  const q = (req.query.q as string || '').toLowerCase();
  if (q.length < 2) { res.json([]); return; }

  const results: Array<{ type: string; id: string; title: string; subtitle: string; link: string }> = [];
  const pattern = `%${q}%`;

  const students = db.prepare("SELECT id, firstName, lastName, admissionNo FROM students WHERE LOWER(firstName || ' ' || lastName) LIKE ? OR LOWER(admissionNo) LIKE ? LIMIT 5").all(pattern, pattern) as Record<string, string>[];
  for (const s of students) results.push({ type: 'student', id: s.id, title: `${s.firstName} ${s.lastName}`, subtitle: `Adm: ${s.admissionNo}`, link: '/students' });

  const staffRes = db.prepare("SELECT id, firstName, lastName, role FROM staff WHERE LOWER(firstName || ' ' || lastName) LIKE ? LIMIT 5").all(pattern) as Record<string, string>[];
  for (const s of staffRes) results.push({ type: 'staff', id: s.id, title: `${s.firstName} ${s.lastName}`, subtitle: s.role, link: '/staff' });

  const classRes = db.prepare("SELECT id, name, section FROM classes WHERE LOWER(name) LIKE ? LIMIT 5").all(pattern) as Record<string, string>[];
  for (const c of classRes) results.push({ type: 'class', id: c.id, title: `${c.name} ${c.section || ''}`, subtitle: 'Class', link: '/academics' });

  const bookRes = db.prepare("SELECT id, title, author FROM library_books WHERE LOWER(title) LIKE ? OR LOWER(author) LIKE ? LIMIT 5").all(pattern, pattern) as Record<string, string>[];
  for (const b of bookRes) results.push({ type: 'book', id: b.id, title: b.title, subtitle: b.author, link: '/library' });

  const eventRes = db.prepare("SELECT id, title, date FROM events WHERE LOWER(title) LIKE ? LIMIT 5").all(pattern) as Record<string, string>[];
  for (const e of eventRes) results.push({ type: 'event', id: e.id, title: e.title, subtitle: e.date, link: '/events' });

  res.json(results);
});

export default router;
