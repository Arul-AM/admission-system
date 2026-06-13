const { db } = require('../config/firebase');
const { generateAdmissionToken, generateHelpDeskToken } = require('../services/tokenService');
const { sendSMS, SMS_TEMPLATES } = require('../services/smsService');
const { auditLog } = require('../middleware/audit');

// Safe email import — won't crash if emailService.js is missing
let sendEmail = null;
try {
  sendEmail = require('../services/emailService').sendEmail;
  console.log('✅ Email service loaded');
} catch (e) {
  console.warn('⚠️ emailService not found — emails disabled');
}

const STAGES = [
  'Registered',
  'Document Verification',
  'Certificate Verification',
  'Online Verification',
  'Photo Capture',
  'Admission Completion',
  'Completed',
];

// ─── Register Student ─────────────────────────────────────────────────────────
const registerStudent = async (req, res) => {
  try {
    const {
      name, applicationNumber, allotmentCategory, department,
      mobile, email, round, onlineAdmissionDone, semesterFeePaid,
    } = req.body;

    console.log('📝 Registration attempt:', { applicationNumber, department, round });

    // Check duplicate
    const existing = await db.collection('students')
      .where('applicationNumber', '==', applicationNumber).get();
    if (!existing.empty)
      return res.status(409).json({ message: 'Application number already registered' });

    // Token logic
    let tokenType = 'admission';
    let token = null;
    let helpDeskReason = null;

    if (onlineAdmissionDone === false || onlineAdmissionDone === 'false') {
      token = await generateHelpDeskToken();
      helpDeskReason = 'Online Admission Submission Pending. Please report to Help Desk.';
      tokenType = 'helpdesk';
    } else if (semesterFeePaid === false || semesterFeePaid === 'false') {
      token = await generateHelpDeskToken();
      helpDeskReason = 'Semester Fee Payment Pending. Please report to Help Desk.';
      tokenType = 'helpdesk';
    } else {
      token = await generateAdmissionToken(round, department);
    }

    console.log('🎟️ Token generated:', token, '| Type:', tokenType);

    const studentData = {
      name, applicationNumber, allotmentCategory, department,
      mobile, email, round,
      onlineAdmissionDone: onlineAdmissionDone === true || onlineAdmissionDone === 'true',
      semesterFeePaid: semesterFeePaid === true || semesterFeePaid === 'true',
      token, tokenType, helpDeskReason,
      currentStage: tokenType === 'helpdesk' ? 0 : 1,
      stageHistory: [{ stage: 0, name: 'Registered', timestamp: new Date().toISOString() }],
      admissionStatus: tokenType === 'helpdesk' ? 'Help Desk' : 'In Progress',
      registeredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save student
    const docRef = await db.collection('students').add(studentData);
    console.log('✅ Student saved:', docRef.id);

    // Send SMS (non-blocking)
    try {
      await sendSMS(mobile, SMS_TEMPLATES.registration(name, token), docRef.id, 'registration');
      console.log('✅ SMS sent');
    } catch (smsErr) {
      console.error('❌ SMS ERROR:', smsErr.message);
    }

    // Send Email (non-blocking, only if service is loaded)
    try {
      if (sendEmail && email) {
        await sendEmail(
          email,
          'registration',
          { name, token, department, round },
          docRef.id
        );
        console.log('✅ Email sent to:', email);
      }
    } catch (emailErr) {
      console.error('❌ EMAIL ERROR:', emailErr.message);
    }

    // Audit log (non-blocking)
    try {
      await auditLog('system', 'system', 'STUDENT_REGISTERED', { applicationNumber, token });
      console.log('✅ Audit log saved');
    } catch (auditErr) {
      console.error('❌ AUDIT ERROR:', auditErr.message);
    }

    return res.status(201).json({
      message: tokenType === 'helpdesk' ? helpDeskReason : 'Registration successful',
      token,
      tokenType,
      studentId: docRef.id,
    });

  } catch (err) {
    console.error('❌ STUDENT SAVE ERROR:', err);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

// ─── Get My Profile (Student) ─────────────────────────────────────────────────
const getMyProfile = async (req, res) => {
  try {
    const snapshot = await db.collection('students')
      .where('applicationNumber', '==', req.user.applicationNumber || '')
      .limit(1).get();

    let studentDoc;
    if (snapshot.empty) {
      studentDoc = await db.collection('students').doc(req.user.uid).get();
      if (!studentDoc.exists) return res.status(404).json({ message: 'Student not found' });
    } else {
      studentDoc = snapshot.docs[0];
    }

    res.json({ uid: studentDoc.id, ...studentDoc.data() });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Get All Students (Admin / Staff) ────────────────────────────────────────
const getAllStudents = async (req, res) => {
  try {
    const { department, round, status, stage, search, limit = 100, page = 1 } = req.query;

    console.log('REQ.USER:', req.user);
    console.log('REQ.QUERY:', req.query);

    const snapshot = await db.collection('students').get();
    let students = snapshot.docs.map(d => ({ uid: d.id, ...d.data() }));

    if (department) students = students.filter(s => s.department === department);
    if (round)      students = students.filter(s => s.round === round);
    if (status)     students = students.filter(s => s.admissionStatus === status);
    if (stage && stage !== 'undefined' && !isNaN(stage)) {
      students = students.filter(s => s.currentStage === Number(stage));
    }
    if (search) {
      const q = search.toLowerCase();
      students = students.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.applicationNumber?.toLowerCase().includes(q) ||
        s.token?.toLowerCase().includes(q)
      );
    }

    students.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

    const total = students.length;
    const start = (parseInt(page) - 1) * parseInt(limit);
    const paginated = students.slice(start, start + parseInt(limit));

    console.log('Students Returned:', paginated.length);
    res.json({ students: paginated, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('GET ALL STUDENTS ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Get Student By ID ────────────────────────────────────────────────────────
const getStudentById = async (req, res) => {
  try {
    const doc = await db.collection('students').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ message: 'Student not found' });
    res.json({ uid: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Advance Stage ────────────────────────────────────────────────────────────
const advanceStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const staffStage = req.user.stage;

    const doc = await db.collection('students').doc(id).get();
    if (!doc.exists) return res.status(404).json({ message: 'Student not found' });

    const student = doc.data();

    console.log('========== ADVANCE STAGE ==========');
    console.log('USER:', req.user);
    console.log('STAFF STAGE:', req.user.stage);
    console.log('STUDENT CURRENT STAGE:', student.currentStage);
    console.log('===================================');

    if (req.user.role === 'staff' && student.currentStage !== staffStage) {
      return res.status(403).json({
        message: `Access Denied. This student is at Stage ${student.currentStage}, not your assigned stage (${staffStage}).`
      });
    }

    const nextStage = student.currentStage + 1;
    if (nextStage > 6) return res.status(400).json({ message: 'Student already completed' });

    const stageName = STAGES[nextStage];
    const stageHistory = student.stageHistory || [];
    stageHistory.push({
      stage: nextStage,
      name: stageName,
      timestamp: new Date().toISOString(),
      approvedBy: req.user.uid,
      notes: notes || '',
    });

    const isCompleted = nextStage === 6;
    await db.collection('students').doc(id).update({
      currentStage: nextStage,
      stageHistory,
      admissionStatus: isCompleted ? 'Completed' : 'In Progress',
      updatedAt: new Date().toISOString(),
    });

    // Send SMS (non-blocking)
    try {
      const smsMap = { 2: 'stage1', 3: 'stage2', 4: 'stage3', 5: 'stage4', 6: 'stage5' };
      const smsKey = smsMap[nextStage];
      if (smsKey) {
        const msg = SMS_TEMPLATES[smsKey]?.(student.name);
        if (msg) await sendSMS(student.mobile, msg, id, smsKey);
        console.log('✅ Stage SMS sent');
      }
    } catch (smsErr) {
      console.error('❌ Stage SMS ERROR:', smsErr.message);
    }

    // Send Email (non-blocking)
    try {
      if (sendEmail && student.email) {
        const emailMap = { 2: 'stage1', 3: 'stage2', 4: 'stage3', 5: 'stage4', 6: 'stage5' };
        const emailKey = emailMap[nextStage];
        if (emailKey) {
          await sendEmail(
            student.email,
            emailKey,
            { name: student.name, token: student.token },
            id
          );
          console.log('✅ Stage email sent to:', student.email);
        }
      }
    } catch (emailErr) {
      console.error('❌ Stage EMAIL ERROR:', emailErr.message);
    }

    await auditLog(req.user.uid, req.user.role, 'STAGE_ADVANCED', {
      studentId: id, fromStage: student.currentStage, toStage: nextStage,
    });

    res.json({ message: `Student moved to ${stageName}`, currentStage: nextStage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Get Stats (Admin) ────────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const snapshot = await db.collection('students').get();
    const students = snapshot.docs.map(d => d.data());

    const stats = {
      total: students.length,
      completed: students.filter(s => s.admissionStatus === 'Completed').length,
      inProgress: students.filter(s => s.admissionStatus === 'In Progress').length,
      helpDesk: students.filter(s => s.admissionStatus === 'Help Desk').length,
      byDepartment: {},
      byRound: {},
      byStage: {},
    };

    students.forEach(s => {
      stats.byDepartment[s.department] = (stats.byDepartment[s.department] || 0) + 1;
      stats.byRound[s.round] = (stats.byRound[s.round] || 0) + 1;
      stats.byStage[s.currentStage] = (stats.byStage[s.currentStage] || 0) + 1;
    });

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { registerStudent, getMyProfile, getAllStudents, getStudentById, advanceStage, getStats };
