const { db } = require('../config/firebase');

// ===============================
// Round → Prefix mapping
// All 4 rounds supported
// ===============================
const ROUND_PREFIX = {
  'Round 1':         'R1',
  'Round 1 Upward':  'R1U',
  'Round 2':         'R2',
  'Round 2 Upward':  'R2U',
  'Upward Movement': 'UP',   // legacy fallback
};

// ===============================
// Department full name → short code
// Handles both code (new) and full name (legacy)
// ===============================
const DEPT_CODE_MAP = {
  'BME':     'BME',
  'CIVIL':   'CIVIL',
  'CIVIL-TM':'CIVIL-TM',
  'CSE':     'CSE',
  'EEE':     'EEE',
  'ECE':     'ECE',
  'VLSI':    'VLSI',
  'GEO':     'GEO',
  'IE':      'IE',
  'IT':      'IT',
  'MFGE':    'MFGE',
  'MSE':     'MSE',
  'MECH':    'MECH',
  'MECH-TM': 'MECH-TM',
  'MINE':    'MINE',
  'PPT':     'PPT',
  // Legacy full-name fallbacks
  'BIO MEDICAL ENGINEERING':                       'BME',
  'CIVIL ENGINEERING':                             'CIVIL',
  'CIVIL ENGINEERING TAMIL MEDIUM':                'CIVIL-TM',
  'COMPUTER SCIENCE AND ENGINEERING':              'CSE',
  'ELECTRICAL AND ELECTRONICS ENGINEERING':        'EEE',
  'ELECTRONICS AND COMMUNICATION ENGINEERING':     'ECE',
  'ELECTRONICS ENGINEERING (VLSI DESIGN AND TECHNOLOGY)': 'VLSI',
  'GEO INFORMATICS':                               'GEO',
  'INDUSTRIAL ENGINEERING':                        'IE',
  'INFORMATION TECHNOLOGY (SS)':                   'IT',
  'MANUFACTURING ENGINEERING':                     'MFGE',
  'MATERIALS SCIENCE AND ENGINEERING':             'MSE',
  'MECHANICAL ENGINEERING':                        'MECH',
  'MECHANICAL ENGINEERING TAMIL MEDIUM':           'MECH-TM',
  'MINING ENGINEERING':                            'MINE',
  'PRINTING AND PACKAGING TECHNOLOGY':             'PPT',
  // Original short names
  'OTHER': 'OTH',
};

// ===============================
// Calculate Admission Day (D1, D2, D3...)
// ===============================
const getAdmissionDay = () => {
  const startDate = new Date(process.env.ADMISSION_START_DATE || new Date().toISOString());
  const today = new Date();

  startDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  return `D${diffDays + 1}`;
};

// ===============================
// Admission Token
// Format: D1-R1-CSE-0001
//         D1-R1U-MINE-0001
// ===============================
const generateAdmissionToken = async (round, department) => {
  const admissionDay = getAdmissionDay();

  // Get round prefix — trim spaces to handle "Round 1 Upward " with trailing space
  const roundKey = round?.trim();
  const prefix = ROUND_PREFIX[roundKey] || 'R1';

  // Get department code — handle both short codes and full names
  const deptKey = department?.trim().toUpperCase();
  const dept = DEPT_CODE_MAP[deptKey] || deptKey.replace(/\s+/g, '-').slice(0, 8);

  const tokenPrefix = `${admissionDay}-${prefix}-${dept}`;

  const snapshot = await db.collection('tokens')
    .where('prefix', '==', tokenPrefix)
    .orderBy('sequence', 'desc')
    .limit(1)
    .get();

  let sequence = 1;
  if (!snapshot.empty) {
    sequence = snapshot.docs[0].data().sequence + 1;
  }

  const token = `${tokenPrefix}-${String(sequence).padStart(4, '0')}`;

  await db.collection('tokens').add({
    token,
    prefix: tokenPrefix,
    sequence,
    admissionDay,
    round: roundKey,
    department: dept,
    type: 'admission',
    createdAt: new Date().toISOString(),
  });

  console.log(`✅ Token generated: ${token}`);
  return token;
};

// ===============================
// Help Desk Token
// Format: HD-001
// ===============================
const generateHelpDeskToken = async () => {
  const snapshot = await db.collection('tokens')
    .where('type', '==', 'helpdesk')
    .orderBy('sequence', 'desc')
    .limit(1)
    .get();

  let sequence = 1;
  if (!snapshot.empty) {
    sequence = snapshot.docs[0].data().sequence + 1;
  }

  const token = `HD-${String(sequence).padStart(3, '0')}`;

  await db.collection('tokens').add({
    token,
    prefix: 'HD',
    sequence,
    type: 'helpdesk',
    createdAt: new Date().toISOString(),
  });

  console.log(`✅ Help Desk Token generated: ${token}`);
  return token;
};

module.exports = { generateAdmissionToken, generateHelpDeskToken, getAdmissionDay };
