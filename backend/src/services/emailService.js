const nodemailer = require('nodemailer');
const { db } = require('../config/firebase');

// ─── Email Templates ──────────────────────────────────────────────────────────
const EMAIL_TEMPLATES = {
  registration: (name, token, dept, round) => ({
    subject: `✅ Admission Registration Successful – Token: ${token}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:32px;text-align:center">
          <h1 style="color:white;margin:0;font-size:24px">Anna University</h1>
          <p style="color:#bfdbfe;margin:4px 0 0">College of Engineering, Guindy</p>
        </div>
        <div style="padding:32px">
          <h2 style="color:#1e3a8a;margin-top:0">Registration Successful! 🎉</h2>
          <p style="color:#374151">Dear <strong>${name}</strong>,</p>
          <p style="color:#374151">Your admission registration has been successfully completed.</p>
          <div style="background:#eff6ff;border:2px solid #bfdbfe;border-radius:12px;padding:24px;text-align:center;margin:24px 0">
            <p style="color:#1e40af;font-size:13px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px">Your Token Number</p>
            <h1 style="color:#1d4ed8;font-size:36px;margin:0;font-family:monospace;letter-spacing:2px">${token}</h1>
            <p style="color:#64748b;font-size:13px;margin:8px 0 0">${dept} · ${round}</p>
          </div>
          <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0">
            <p style="margin:0;color:#374151;font-size:14px">📋 <strong>Next Step:</strong> Please proceed to the <strong>Document Verification</strong> counter with your token number.</p>
          </div>
          <p style="color:#64748b;font-size:13px">Please report according to your assigned schedule. Keep this email for reference.</p>
        </div>
        <div style="background:#f1f5f9;padding:16px;text-align:center">
          <p style="color:#94a3b8;font-size:12px;margin:0">Anna University Admissions · College of Engineering, Guindy, Chennai – 600025</p>
        </div>
      </div>
    `,
  }),

  stage1: (name, token) => ({
    subject: `📄 Document Verification Completed – ${token}`,
    html: stageEmailHTML(name, token, '📄', 'Document Verification', 'Completed', 'Certificate Verification', '#10b981', 1),
  }),

  stage2: (name, token) => ({
    subject: `🏆 Certificate Verification Completed – ${token}`,
    html: stageEmailHTML(name, token, '🏆', 'Certificate Verification', 'Completed', 'Online Verification', '#10b981', 2),
  }),

  stage3: (name, token) => ({
    subject: `🌐 Online Verification Completed – ${token}`,
    html: stageEmailHTML(name, token, '🌐', 'Online Verification', 'Completed', 'Photo Capture', '#10b981', 3),
  }),

  stage4: (name, token) => ({
    subject: `📸 Photo Capture Completed – ${token}`,
    html: stageEmailHTML(name, token, '📸', 'Photo Capture', 'Completed', 'Admission Completion', '#10b981', 4),
  }),

  stage5: (name, token) => ({
    subject: `🎓 Admission Complete – Welcome to Anna University!`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#065f46,#10b981);padding:32px;text-align:center">
          <h1 style="color:white;margin:0;font-size:28px">🎓 Congratulations!</h1>
          <p style="color:#a7f3d0;margin:4px 0 0">Admission Successfully Completed</p>
        </div>
        <div style="padding:32px;text-align:center">
          <p style="color:#374151;font-size:16px">Dear <strong>${name}</strong>,</p>
          <p style="color:#374151">Your admission to <strong>Anna University, College of Engineering, Guindy</strong> has been successfully completed.</p>
          <div style="background:#ecfdf5;border:2px solid #6ee7b7;border-radius:12px;padding:24px;margin:24px 0">
            <p style="color:#065f46;font-size:13px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px">Token Number</p>
            <h2 style="color:#059669;font-family:monospace;margin:0">${token}</h2>
            <p style="color:#10b981;font-weight:bold;margin:8px 0 0">✅ Admission Complete</p>
          </div>
          <p style="color:#374151;font-size:15px"><strong>Welcome to the Anna University family!</strong></p>
          <p style="color:#64748b;font-size:13px">Please collect your admission letter from the office. Best wishes for your academic journey.</p>
        </div>
        <div style="background:#f1f5f9;padding:16px;text-align:center">
          <p style="color:#94a3b8;font-size:12px;margin:0">Anna University · College of Engineering, Guindy, Chennai – 600025</p>
        </div>
      </div>
    `,
  }),
};

// ─── Stage email helper ───────────────────────────────────────────────────────
function stageEmailHTML(name, token, icon, stageName, stageStatus, nextStage, color, stageNum) {
  const progress = Math.round((stageNum / 5) * 100);
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:24px 32px">
        <h2 style="color:white;margin:0;font-size:20px">Anna University Admissions</h2>
        <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px">Stage Update Notification</p>
      </div>
      <div style="padding:32px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
          <span style="font-size:32px">${icon}</span>
          <div>
            <h2 style="color:#1e3a8a;margin:0;font-size:20px">${stageName} ${stageStatus}!</h2>
            <p style="color:#64748b;margin:2px 0 0;font-size:13px">Token: <strong style="font-family:monospace">${token}</strong></p>
          </div>
        </div>
        <p style="color:#374151">Dear <strong>${name}</strong>,</p>
        <p style="color:#374151">Your <strong>${stageName}</strong> has been completed successfully.</p>

        <!-- Progress bar -->
        <div style="margin:20px 0">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:12px;color:#64748b">Progress</span>
            <span style="font-size:12px;font-weight:bold;color:#2563eb">${progress}%</span>
          </div>
          <div style="background:#e2e8f0;border-radius:99px;height:8px">
            <div style="background:linear-gradient(90deg,#2563eb,#3b82f6);width:${progress}%;height:8px;border-radius:99px"></div>
          </div>
        </div>

        <div style="background:#eff6ff;border-left:4px solid #2563eb;border-radius:0 8px 8px 0;padding:16px;margin:20px 0">
          <p style="margin:0;color:#1e40af;font-size:14px">
            ➡️ <strong>Next Step:</strong> Please proceed to the <strong>${nextStage}</strong> counter.
          </p>
        </div>
        <p style="color:#64748b;font-size:13px">Please show this email or your token number at the next counter.</p>
      </div>
      <div style="background:#f1f5f9;padding:16px;text-align:center">
        <p style="color:#94a3b8;font-size:12px;margin:0">Anna University · College of Engineering, Guindy, Chennai – 600025</p>
      </div>
    </div>
  `;
}

// ─── Nodemailer transporter ───────────────────────────────────────────────────
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail App Password
    },
  });
  return transporter;
};

// ─── Main send function ───────────────────────────────────────────────────────
const sendEmail = async (toEmail, templateKey, templateData, studentId) => {
  let status = 'sent';
  let errorMsg = null;

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`[EMAIL DEV MODE] To: ${toEmail} | Type: ${templateKey}`);
      console.log(`[EMAIL DEV MODE] Data:`, templateData);
      status = 'dev_mode';
    } else {
      const template = EMAIL_TEMPLATES[templateKey];
      if (!template) throw new Error(`Unknown template: ${templateKey}`);

      const { subject, html } = template(...Object.values(templateData));
      const transport = getTransporter();

      await transport.sendMail({
        from: `"CEG Admissions" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject,
        html,
      });

      console.log(`[Email] ✅ Sent ${templateKey} to ${toEmail}`);
    }
  } catch (err) {
    console.error(`[Email] ❌ Failed to send to ${toEmail}:`, err.message);
    status = 'failed';
    errorMsg = err.message;
  }

  // Log to Firestore
  try {
    await db.collection('emailLogs').add({
      studentId,
      toEmail,
      templateKey,
      sentAt: new Date().toISOString(),
      status,
      ...(errorMsg && { error: errorMsg }),
    });
  } catch (logErr) {
    console.error('[Email] Log error:', logErr.message);
  }

  return status === 'sent' || status === 'dev_mode';
};

module.exports = { sendEmail, EMAIL_TEMPLATES };
