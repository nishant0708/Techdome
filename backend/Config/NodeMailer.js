const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpToEmail = async (toEmail, otp, customText) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Admin Signup OTP',
    text: `${customText}. OTP: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending OTP email:', error);
  }
};
const sendEmailToApplicant = async (toEmail, subject, text) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: subject,
      text: text,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent to applicant:', toEmail);
    } catch (error) {
      console.error('Error sending email to applicant:', error);
    }
  };

module.exports = { sendOtpToEmail, sendEmailToApplicant };
