const jwt = require("jsonwebtoken");
const User = require("../Model/UserModal");
const bcrypt = require("bcryptjs");
const LoanApplication = require("../Model/LoanApplication");

exports.usersignup = async (req, res) => {
  const { userName, email, mobile, password, confirmPassword } = req.body;


  if (!userName || !email || !mobile || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }


  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    user = new User({ userName, email, mobile, password });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "6h",
    });

    res.status(201).json({ message: "Signup successful", token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.userlogin = async (req, res) => {
  const { email, password } = req.body;


  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "6h",
    });

    res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

function generateRepaymentSchedule(amount, term, startDate, frequency) {
  const schedule = [];
  const amountPerTerm = parseFloat((amount / term).toFixed(2));
  const extraCents = parseFloat((amount - amountPerTerm * term).toFixed(2));

  let currentDate = new Date(startDate);

  for (let i = 0; i < term; i++) {
    const repaymentDate = new Date(currentDate);
    const repaymentAmount =
      i === term - 1 ? amountPerTerm + extraCents : amountPerTerm;

    schedule.push({
      dueDate: repaymentDate.toISOString().split("T")[0], 
      amount: repaymentAmount.toFixed(2),
      status: "PENDING",
    });

    // Increment the date based on the frequency
    if (frequency === "weekly") {
      currentDate.setDate(currentDate.getDate() + 7);
    } else if (frequency === "bi-weekly") {
      currentDate.setDate(currentDate.getDate() + 14);
    } else if (frequency === "monthly") {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }

  return schedule;
}

// Endpoint to apply for a loan
exports.Loan = async (req, res) => {
  const { amountRequired, loanTerm, repaymentFrequency, userId } = req.body;

  if (!amountRequired || !loanTerm || !repaymentFrequency) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  // Assuming loan starts today
  const startDate = new Date();

  // Generate the repayment schedule
  const schedule = generateRepaymentSchedule(
    amountRequired,
    loanTerm,
    startDate,
    repaymentFrequency
  );
  const newApplication = new LoanApplication({
    userId,
    amountRequired,
    loanTerm,
    repaymentFrequency,
    status: "PENDING",
    scheduledRepayments: schedule, // Logic to calculate repayments goes here
  });

  await newApplication.save();
  res.status(200).json({ message: "Loan application submitted successfully!" });
};

exports.getapplication = async (req, res) => {
  try {
    const { userId } = req.params;
    const applications = await LoanApplication.find({ userId });

    if (!applications.length) {
      return res
        .status(404)
        .json({ message: "No loan applications found for this user." });
    }

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};


exports.paynment = async (req, res) => {
    const { loanId, repaymentId, paymentAmount } = req.body;
  
    try {
      // Input validation
      if (!loanId || !repaymentId || !paymentAmount) {
        return res.status(400).json({ 
          message: "Missing required fields: loanId, repaymentId, and paymentAmount are mandatory" 
        });
      }
  
      if (paymentAmount <= 0) {
        return res.status(400).json({ 
          message: "Payment amount must be greater than 0" 
        });
      }
  
  
      const loan = await LoanApplication.findById(loanId);
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }
  
      // Validate loan status
      if (loan.status === "PAID") {
        return res.status(400).json({ 
          message: "This loan has already been fully paid" 
        });
      }
  
      // Calculate total remaining amount
      const totalRemainingAmount = loan.scheduledRepayments.reduce((sum, repayment) => {
        return repayment.status !== "PAID" ? sum + repayment.amount : sum;
      }, 0);
  
      // Validate against overpayment
      if (paymentAmount > totalRemainingAmount) {
        return res.status(400).json({
          message: `Payment amount (${paymentAmount}) exceeds the total remaining amount (${totalRemainingAmount})`,
          totalRemainingAmount
        });
      }
  
      // Get the specific repayment and validate
      const repayment = loan.scheduledRepayments.id(repaymentId);
      if (!repayment) {
        return res.status(404).json({ 
          message: "Repayment schedule not found" 
        });
      }
  
      if (repayment.status === "PAID") {
        return res.status(400).json({ 
          message: "This repayment has already been paid" 
        });
      }
  
      // Validate if trying to pay an earlier repayment when there are unpaid ones before it
      const repaymentIndex = loan.scheduledRepayments.findIndex(r => r._id.toString() === repaymentId);
      const hasUnpaidEarlierRepayments = loan.scheduledRepayments
        .slice(0, repaymentIndex)
        .some(r => r.status !== "PAID");
  
      if (hasUnpaidEarlierRepayments) {
        return res.status(400).json({
          message: "Please pay earlier repayments first"
        });
      }
  
      // Validate minimum payment amount
      if (paymentAmount < repayment.amount) {
        return res.status(400).json({
          message: `Payment amount must be at least ${repayment.amount} for this repayment`
        });
      }
  
      let remainingPayment = paymentAmount;
  
      // Process payments starting from the current repayment
      for (let i = repaymentIndex; i < loan.scheduledRepayments.length; i++) {
        const currentRepayment = loan.scheduledRepayments[i];
        
        if (currentRepayment.status === "PAID") continue;
  
        if (remainingPayment >= currentRepayment.amount) {
          // Full payment for this repayment
          remainingPayment -= currentRepayment.amount;
          currentRepayment.status = "PAID";
          currentRepayment.paidAmount = currentRepayment.amount;
          currentRepayment.paidDate = new Date();
        } else {
          // Partial payment - should only happen if this is the last repayment being processed
          currentRepayment.amount -= remainingPayment;
          currentRepayment.paidAmount = remainingPayment;
          currentRepayment.partiallyPaid = true;
          remainingPayment = 0;
          break;
        }
      }
  
      // Update loan status if all repayments are paid
      const allPaid = loan.scheduledRepayments.every(r => r.status === "PAID");
      if (allPaid) {
        loan.status = "PAID";
        loan.completionDate = new Date();
      }
  
      // Save the changes
      await loan.save();
  
      return res.json({
        message: "Payment processed successfully",
        loan,
        paymentDetails: {
          amountPaid: paymentAmount,
          remainingLoanBalance: totalRemainingAmount - paymentAmount,
          loanStatus: loan.status
        }
      });
  
    } catch (error) {
      console.error('Payment processing error:', error);
      return res.status(500).json({ 
        message: "Error processing payment", 
        error: error.message 
      });
    }
  };