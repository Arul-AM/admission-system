const { db } = require('../config/firebase');

const ROUND_PREFIX = {
'Round 1': 'R1',
'Round 2': 'R2',
'Upward Movement': 'UP',
};

// ===============================
// Calculate Admission Day (D1,D2,D3...)
// ===============================
const getAdmissionDay = () => {
const startDate = new Date(
process.env.ADMISSION_START_DATE
);

const today = new Date();

startDate.setHours(0, 0, 0, 0);
today.setHours(0, 0, 0, 0);

const diffDays = Math.floor(
(today - startDate) /
(1000 * 60 * 60 * 24)
);

return `D${diffDays + 1}`;
};

// ===============================
// Admission Token
// Example:
// D1-R1-CSE-0001
// ===============================
const generateAdmissionToken = async (
round,
department
) => {
const admissionDay = getAdmissionDay();

const prefix =
ROUND_PREFIX[round] || 'R1';

const dept = department
.toUpperCase()
.replace(/\s+/g, '');

const tokenPrefix =
`${admissionDay}-${prefix}-${dept}`;

const snapshot = await db
.collection('tokens')
.where('prefix', '==', tokenPrefix)
.orderBy('sequence', 'desc')
.limit(1)
.get();

let sequence = 1;

if (!snapshot.empty) {
sequence =
snapshot.docs[0].data().sequence + 1;
}

const token =
`${tokenPrefix}-${String(sequence).padStart(4, '0')}`;

await db.collection('tokens').add({
token,
prefix: tokenPrefix,
sequence,
admissionDay,
round,
department,
type: 'admission',
createdAt: new Date().toISOString(),
});

return token;
};

// ===============================
// Help Desk Token
// Example:
// HD-001
// ===============================
const generateHelpDeskToken =
async () => {
const snapshot = await db
.collection('tokens')
.where('type', '==', 'helpdesk')
.orderBy('sequence', 'desc')
.limit(1)
.get();


let sequence = 1;

if (!snapshot.empty) {
  sequence =
    snapshot.docs[0].data().sequence + 1;
}

const token =
  `HD-${String(sequence).padStart(3, '0')}`;

await db.collection('tokens').add({
  token,
  prefix: 'HD',
  sequence,
  type: 'helpdesk',
  createdAt: new Date().toISOString(),
});

return token;


};

module.exports = {
generateAdmissionToken,
generateHelpDeskToken,
getAdmissionDay,
};
