const { db } = require('../config/firebase');
console.log("MSG91 Key Loaded:", !!process.env.MSG91_AUTH_KEY);

const SMS_TEMPLATES = {
  registration: (name, token) =>
    `Dear ${name}, Your admission registration has been successfully completed. Token Number: ${token}. Please report according to your assigned schedule. - University Admissions`,
  stage1: (name) =>
    `Dear ${name}, Document Verification completed successfully. Please proceed to Certificate Verification counter. - University Admissions`,
  stage2: (name) =>
    `Dear ${name}, Certificate Verification completed successfully. Please proceed to Online Verification counter. - University Admissions`,
  stage3: (name) =>
    `Dear ${name}, Online Verification completed successfully. Please proceed to Photo Capture counter. - University Admissions`,
  stage4: (name) =>
    `Dear ${name}, Photo Capture completed successfully. Please proceed to Admission Completion counter. - University Admissions`,
  stage5: (name) =>
    `Congratulations ${name}! Your admission has been successfully completed. Welcome to the University! - University Admissions`,
};

const sendSMS = async (mobile, message, studentId, type) => {
  try {
    // MSG91 integration
    if (process.env.MSG91_AUTH_KEY) {
      const response = await fetch('https://api.msg91.com/api/v5/flow/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authkey': process.env.MSG91_AUTH_KEY,
        },
        body: JSON.stringify({
          template_id: process.env.MSG91_TEMPLATE_ID,
          sender: process.env.MSG91_SENDER_ID,
          short_url: '0',
          mobiles: `91${mobile}`,
          VAR1: message,
        }),
      });
      const data = await response.json();
      console.log('SMS sent:', data);
    } else {
      // Dev mode - just log
      console.log(`[SMS DEV MODE] To: ${mobile} | Message: ${message}`);
    }

    // Log SMS
    await db.collection('smsLogs').add({
      studentId,
      mobile,
      message,
      type,
      sentAt: new Date().toISOString(),
      status: 'sent',
    });

    return true;
  } catch (err) {
    console.error('SMS error:', err);
    await db.collection('smsLogs').add({
      studentId,
      mobile,
      message,
      type,
      sentAt: new Date().toISOString(),
      status: 'failed',
      error: err.message,
    });
    return false;
  }
};

module.exports = { sendSMS, SMS_TEMPLATES };
