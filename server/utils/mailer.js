const nodemailer = require('nodemailer');

function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error('EMAIL_USER and EMAIL_PASS must be set for email verification');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });
}

async function sendVerificationEmail(toEmail, name, code) {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `NoteHub <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Verify your NoteHub account',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
        <h2 style="margin-bottom: 8px;">Email Verification</h2>
        <p>Hello ${name || 'User'},</p>
        <p>Your NoteHub verification code is:</p>
        <p style="font-size: 24px; font-weight: 700; letter-spacing: 2px; margin: 12px 0;">${code}</p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not create this account, please ignore this email.</p>
      </div>
    `,
  });
}

module.exports = {
  sendVerificationEmail,
};
