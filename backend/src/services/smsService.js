const { db } = require('../config/firebase');

const SMS_TEMPLATES = {
  registration: (name, token) =>
    `Dear ${name}, Your admission registration has been successfully completed. Token Number: ${token}. Please report according to your assigned schedule. - CEG Admissions`,
  stage1: (name) =>
    `Dear ${name}, Document Verification completed successfully. Please proceed to Certificate Verification counter. - CEG Admissions`,
  stage2: (name) =>
    `Dear ${name}, Certificate Verification completed successfully. Please proceed to Online Verification counter. - CEG Admissions`,
  stage3: (name) =>
    `Dear ${name}, Online Verification completed successfully. Please proceed to Photo Capture counter. - CEG Admissions`,
  stage4: (name) =>
    `Dear ${name}, Photo Capture completed successfully. Please proceed to Admission Completion counter. - CEG Admissions`,
  stage5: (name) =>
    `Congratulations ${name}! Your admission has been successfully completed. Welcome to Anna University! - CEG Admissions`,
};

const sendViaFast2SMS = async (mobile, message) => {
  const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: {
      authorization: process.env.FAST2SMS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      route: 'q',
      message,
      language: 'english',
      flash: 0,
      numbers: mobile,
    }),
  });
  const data = await response.json();
  console.log('Fast2SMS response:', JSON.stringify(data));
  if (!data.return) throw new Error(data.message || 'Fast2SMS failed');
  return data;
};

const sendSMS = async (mobile, message, studentId, type) => {
  let status = 'sent';
  let errorMsg = null;

  try {
    if (process.env.FAST2SMS_API_KEY) {
      console.log(`[Fast2SMS] Sending to ${mobile}...`);
      await sendViaFast2SMS(mobile, message);
    } else {
      console.log(`[SMS DEV MODE] To: ${mobile} | ${message}`);
      status = 'dev_mode';
    }
  } catch (err) {
    console.error('SMS send error:', err.message);
    status = 'failed';
    errorMsg = err.message;
  }

  try {
    await db.collection('smsLogs').add({
      studentId, mobile, message, type,
      sentAt: new Date().toISOString(),
      status,
      ...(errorMsg && { error: errorMsg }),
    });
  } catch (logErr) {
    console.error('SMS log error:', logErr.message);
  }

  return status === 'sent' || status === 'dev_mode';
};

module.exports = { sendSMS, SMS_TEMPLATES };