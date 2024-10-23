const mongoose = require('mongoose');

const loanApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Assuming you have a User schema
    required: true,
  },
  amountRequired: {
    type: Number,
    required: true,
  },
  loanTerm: {
    type: Number,  // Term in weeks or months, depending on your application
    required: true,
  },
  repaymentFrequency: {
    type: String,
    enum: ['weekly', 'bi-weekly', 'monthly'],  // Possible repayment frequencies
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'PAID'],  // Application status
    default: 'PENDING',
  },
  appliedDate: {
    type: Date,
    default: Date.now,  // Automatically set to current date on application
  },
  scheduledRepayments: [
    {
      dueDate: {
        type: Date,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        enum: ['PENDING', 'PAID', 'OVERDUE'],
        default: 'PENDING',
      },
    },
  ],
  totalRepayments: {
    type: Number,  // Total amount to be repaid including interest
  },
  interestRate: {
    type: Number,  // Interest rate applied on the loan
  },
  repaymentCompleted: {
    type: Boolean,
    default: false,  // Track if the loan has been fully repaid
  },
});

module.exports = mongoose.model('LoanApplication', loanApplicationSchema);
