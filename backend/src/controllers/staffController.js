const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase');
const { auditLog } = require('../middleware/audit');

const STAGE_NAMES = {
  1: 'Document Verification',
  2: 'Certificate Verification',
  3: 'Online Verification',
  4: 'Photo Capture',
  5: 'Admission Completion',
};

const createStaff = async (req, res) => {
  try {
    const { name, username, password, stage } = req.body;
    if (!name || !username || !password || !stage)
      return res.status(400).json({ message: 'All fields required' });

    if (stage < 1 || stage > 5)
      return res.status(400).json({ message: 'Stage must be between 1 and 5' });

    // Check staff count limit
    const staffCount = await db.collection('users').where('role', '==', 'staff').get();
    if (staffCount.size >= 20)
      return res.status(400).json({ message: 'Maximum 20 staff accounts allowed' });

    // Check username unique
    const existing = await db.collection('users').where('username', '==', username).get();
    if (!existing.empty)
      return res.status(409).json({ message: 'Username already exists' });

    const hashed = await bcrypt.hash(password, 12);
    const docRef = await db.collection('users').add({
      name, username,
      password: hashed,
      role: 'staff',
      stage: parseInt(stage),
      stageName: STAGE_NAMES[stage],
      isActive: true,
      createdBy: req.user.uid,
      createdAt: new Date().toISOString(),
    });

    await auditLog(req.user.uid, 'admin', 'STAFF_CREATED', { username, stage });

    res.status(201).json({ message: 'Staff account created', staffId: docRef.id, username, stage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllStaff = async (req, res) => {
  try {
    const snapshot = await db.collection('users').where('role', '==', 'staff').get();
    const staff = snapshot.docs.map(d => {
      const data = d.data();
      delete data.password;
      return { uid: d.id, ...data };
    });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, password, stage, isActive } = req.body;

    const doc = await db.collection('users').doc(id).get();
    if (!doc.exists) return res.status(404).json({ message: 'Staff not found' });

    const updates = { updatedAt: new Date().toISOString() };
    if (name) updates.name = name;
    if (stage) { updates.stage = parseInt(stage); updates.stageName = STAGE_NAMES[stage]; }
    if (typeof isActive === 'boolean') updates.isActive = isActive;
    if (password) updates.password = await bcrypt.hash(password, 12);

    await db.collection('users').doc(id).update(updates);
    await auditLog(req.user.uid, 'admin', 'STAFF_UPDATED', { staffId: id });

    res.json({ message: 'Staff updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const toggleStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('users').doc(id).get();
    if (!doc.exists) return res.status(404).json({ message: 'Staff not found' });

    const current = doc.data().isActive;
    await db.collection('users').doc(id).update({ isActive: !current });
    await auditLog(req.user.uid, 'admin', current ? 'STAFF_DISABLED' : 'STAFF_ENABLED', { staffId: id });

    res.json({ message: `Staff ${!current ? 'enabled' : 'disabled'}`, isActive: !current });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createStaff, getAllStaff, updateStaff, toggleStaff };
