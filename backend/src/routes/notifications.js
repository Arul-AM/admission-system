const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { db } = require('../config/firebase');
const { sendSMS } = require('../services/smsService');

router.get('/sms-logs', authenticate, authorize('admin'), async (req, res) => {
  try {
    const snapshot = await db.collection('smsLogs').orderBy('sentAt', 'desc').limit(200).get();
    const logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/send-sms', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { mobile, message, studentId } = req.body;
    if (!mobile || !message) return res.status(400).json({ message: 'Mobile and message required' });
    await sendSMS(mobile, message, studentId || 'manual', 'manual');
    res.json({ message: 'SMS sent' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/audit-logs', authenticate, authorize('admin'), async (req, res) => {
  try {
    const snapshot = await db.collection('auditLogs').orderBy('timestamp', 'desc').limit(500).get();
    const logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
