const nodemailer = require('nodemailer');
const { db } = require('../config/firebase');

// ─── Templates ────────────────────────────────────────────────────────────────
const EMAIL_TEMPLATES = {
  registration: (name, token, department, round) => ({
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
            <p style="color:#64748b;font-size:13px;margin:8px 0 0">${department} · ${round}</p>
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
    html: stageHTML(name, token, '📄', 'Document Verification', 'Certificate Verification', 2),
  }),
  stage2: (name, token) => ({
    subject: `🏆 Certificate Verification Completed – ${token}`,
    html: stageHTML(name, token, '🏆', 'Certificate Verification', 'Online Verification', 3),
  }),
  stage3: (name, token) => ({
    subject: `🌐 Online Verification Completed – ${token}`,
    html: stageHTML(name, token, '🌐', 'Online Verification', 'Photo Capture', 4),
  }),
  stage4: (name, token) => ({
    subject: `📸 Photo Capture Completed – ${token}`,
    html: stageHTML(name, token, '📸', 'Photo Capture', 'Admission Completion', 5),
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

function stageHTML(name, token, icon, stageDone, nextStage, stageNum) {
  const pct = Math.round((stageNum / 5) * 100);
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:24px 32px">
        <h2 style="color:white;margin:0;font-size:20px">Anna University Admissions</h2>
        <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px">Stage Update Notification</p>
      </div>
      <div style="padding:32px">
        <div style="margin-bottom:20px">
          <span style="font-size:32px">${icon}</span>
          <h2 style="color:#1e3a8a;margin:8px 0 0">${stageDone} Completed!</h2>
          <p style="color:#64748b;margin:4px 0 0;font-size:13px">Token: <strong style="font-family:monospace">${token}</strong></p>
        </div>
        <p style="color:#374151">Dear <strong>${name}</strong>,</p>
        <p style="color:#374151">Your <strong>${stageDone}</strong> has been completed successfully.</p>
        <div style="margin:20px 0">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:12px;color:#64748b">Admission Progress</span>
            <span style="font-size:12px;font-weight:bold;color:#2563eb">${pct}%</span>
          </div>
          <div style="background:#e2e8f0;border-radius:99px;height:10px">
            <div style="background:linear-gradient(90deg,#2563eb,#3b82f6);width:${pct}%;height:10px;border-radius:99px"></div>
          </div>
        </div>
        <div style="background:#eff6ff;border-left:4px solid #2563eb;border-radius:0 8px 8px 0;padding:16px;margin:20px 0">
          <p style="margin:0;color:#1e40af;font-size:14px">➡️ <strong>Next Step:</strong> Please proceed to the <strong>${nextStage}</strong> counter.</p>
        </div>
        <p style="color:#64748b;font-size:13px">Show this email or your token number at the next counter.</p>
      </div>
      <div style="background:#f1f5f9;padding:16px;text-align:center">
        <p style="color:#94a3b8;font-size:12px;margin:0">Anna University · College of Engineering, Guindy, Chennai – 600025</p>
      </div>
    </div>
  `;
}

// ─── Transporter (compatible with nodemailer v6/v7/v8) ────────────────────────
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  transporter.verify((err) => {
    if (err) console.error('[Email] ❌ SMTP verify failed:', err.message);
    else console.log('[Email] ✅ Gmail SMTP ready');
  });

  return transporter;
};

// ─── Send Email ───────────────────────────────────────────────────────────────
const sendEmail = async (toEmail, templateKey, templateData, studentId) => {
  let status = 'sent';
  let errorMsg = null;

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`[EMAIL DEV MODE] To: ${toEmail} | Template: ${templateKey}`);
      console.log('[EMAIL DEV MODE] Data:', templateData);
      status = 'dev_mode';
    } else {
      const template = EMAIL_TEMPLATES[templateKey];
      if (!template) throw new Error(`Unknown email template: ${templateKey}`);

      // Pass templateData values in order to the template function
      const values = Object.values(templateData);
      const { subject, html } = template(...values);

      const transport = getTransporter();
      const info = await transport.sendMail({
        from: `"CEG Admissions - Anna University" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject,
        html,
      });

      console.log(`[Email] ✅ Sent "${subject}" to ${toEmail} — MessageId: ${info.messageId}`);
    }
  } catch (err) {
    console.error(`[Email] ❌ Failed (${templateKey}) to ${toEmail}:`, err.message);
    status = 'failed';
    errorMsg = err.message;
  }

  // Always log to Firestore
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
    console.error('[Email] Firestore log error:', logErr.message);
  }

  return status === 'sent' || status === 'dev_mode';
};

module.exports = { sendEmail, EMAIL_TEMPLATES };
