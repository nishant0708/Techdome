const Admin = require('../Model/Admin');
const UnverifiedAdmin = require('../Model/unverified_Admin');
const { sendOtpToEmail,sendEmailToApplicant } = require('../Config/NodeMailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const LoanApplication = require('../Model/LoanApplication'); 
const adminsignUp = async (req, res) => {
  const { name, email, mobileNumber, password } = req.body;

  try {

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = Date.now() + 2 * 24 * 60 * 60 * 1000; // 2 days expiry

    // Create new unverified admin
    const newAdmin = new UnverifiedAdmin({
      name,
      email,
      mobileNumber,
      password: hashedPassword,
      otp,
      otpExpiry,
    });

    await newAdmin.save();

    // Custom message for Super Admin
    const customText = `${name} is trying to sign up. Their email is ${email} and the OTP is ${otp}.`;


    await sendOtpToEmail(process.env.SuperAdmin_EMAIL, otp, customText);

    res.status(200).json({ message: 'OTP sent to admin. Awaiting verification.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const adminverifyPasscode = async (req, res) => {
  const { email, otp } = req.body;

  try {
  
    const unverifiedAdmin = await UnverifiedAdmin.findOne({ email });
    if (!unverifiedAdmin) {
      return res.status(404).json({ error: 'Unverified user not found.' });
    }
    console.log('Provided OTP:', otp);
    console.log('Stored OTP:', unverifiedAdmin.otp);
    console.log('OTP Expiry:', unverifiedAdmin.otpExpiry);
  
    if (unverifiedAdmin.otp !== otp || unverifiedAdmin.otpExpiry < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    
    const { name, mobileNumber, password } = unverifiedAdmin;
    const admin = new Admin({
      name,
      email,
      mobileNumber,
      password,
    });

    await admin.save();
    await UnverifiedAdmin.deleteOne({ email });

    res.status(200).json({ success: true, message: 'Verification successful. You can now log in.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
const Adminlogin = async (req, res) => {
    const { email, password } = req.body;
  
    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
  
    try {

      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Generate JWT token
      const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '6h' });
  
      res.status(200).json({ message: 'Login successful', token,admin });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };


    const getallapplication = async (req, res) => {
    try {
      const applications = await LoanApplication.find();
      res.status(200).json(applications);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching loan applications', error });
    }
  };

    const applicationdetailsbyId = async (req, res) => {
    try {
      const loanApplication = await LoanApplication.findById(req.params.id).populate('userId');
      if (!loanApplication) {
        return res.status(404).json({ message: 'Application not found' });
      }
      res.json(loanApplication);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  const applicationDecison = async (req, res) => {
    const { decision } = req.body; 
    try {
      const loanApplication = await LoanApplication.findById(req.params.id).populate('userId');
      if (!loanApplication) {
        return res.status(404).json({ message: 'Application not found' });
      }
  
      if (decision !== 'APPROVED' && decision !== 'REJECTED') {
        return res.status(400).json({ message: 'Invalid decision' });
      }
  
      // Update application status
      loanApplication.status = decision;
      await loanApplication.save();
  
      // Get user information (email)
      const applicant = loanApplication.userId;
  
      // Send notification email to the applicant
      const subject = decision === 'APPROVED' 
        ? 'Loan Application Approved'
        : 'Loan Application Rejected';
      
      const message = decision === 'APPROVED'
        ? `Dear ${applicant.userName},\n\nCongratulations! Your loan application has been approved. You will be contacted with further details soon.`
        : `Dear ${applicant.userName},\n\nWe regret to inform you that your loan application has been rejected. Please contact support for more details.`;
  
      // Send email
      await sendEmailToApplicant(applicant.email, subject, message);
  
      res.json({ message: `Application has been ${decision.toLowerCase()}`, loanApplication });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };
  

module.exports = { adminsignUp, adminverifyPasscode,Adminlogin ,getallapplication,applicationdetailsbyId,applicationDecison};