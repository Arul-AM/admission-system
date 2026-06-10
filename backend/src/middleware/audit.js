const { db } = require('../config/firebase');

const auditLog = async (userId, role, action, details = {}) => {
  try {
    await db.collection('auditLogs').add({
      userId,
      role,
      action,
      details,
      timestamp: new Date().toISOString(),
      ip: details.ip || 'unknown',
    });
  } catch (err) {
    console.error('Audit log error:', err);
  }
};

module.exports = { auditLog };
