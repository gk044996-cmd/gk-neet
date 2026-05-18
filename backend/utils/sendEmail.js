const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  console.log('\n--- EMAIL CONFIGURATION CHECK ---');
  console.log('EMAIL_USER exists:', !!process.env.EMAIL_USER);
  if (process.env.EMAIL_USER) {
    console.log('EMAIL_USER length:', process.env.EMAIL_USER.length);
  }
  console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
  console.log('-----------------------------------\n');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, // 587 with secure false is the standard for non-blocked networks like Vercel/Railway
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
  } catch (error) {
    console.error('❌ SMTP Connection Error:', error);
    throw new Error('SMTP Verification Failed: ' + error.message);
  }

  const mailOptions = {
    from: `"GK NEET MOCK" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4f46e5;">GK NEET MOCK</h2>
        <p>${options.message.replace(/\n/g, '<br>')}</p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888;">This is an automated message. Please do not reply.</p>
      </div>`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error('Failed to send email: ' + error.message);
  }
};

module.exports = sendEmail;
