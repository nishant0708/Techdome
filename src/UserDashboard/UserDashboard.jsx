import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

const UserDashboard = () => {
  const [loanApplications, setLoanApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false); // Loading state for payment submission
  const [selectedLoan, setSelectedLoan] = useState(null); // Track selected loan for payment
  const [paymentAmount, setPaymentAmount] = useState(''); // Track entered payment amount
  const [showModal, setShowModal] = useState(false); // Show/hide modal
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId'); // Assuming userId is stored in localStorage
  const token = localStorage.getItem('token'); // Retrieve the token from localStorage

  // Fetch loan applications
  useEffect(() => {
    const fetchLoanApplications = async () => {
      if (!token) {
        // Redirect to login if no token is found
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/user/applications/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Send the token as a Bearer token
          },
        });
        setLoanApplications(response.data);
      } catch (error) {
        setLoanApplications([]); // Handle if no applications are found or error occurred
      } finally {
        setLoading(false);
      }
    };

    fetchLoanApplications();
  }, [token, userId, navigate]);

  // Handle payment submission
  const handleMakePayment = (loan) => {
    setSelectedLoan(loan);
    setShowModal(true);
  };

  const handlePaymentSubmit = async () => {
    const repaymentToPay = selectedLoan.scheduledRepayments.find(
      (repayment) => repayment.status === 'PENDING'
    );
    if (parseFloat(paymentAmount) < repaymentToPay.amount) {
      toast.error(`Payment amount must be at least $${repaymentToPay.amount}`);
      return;
    }
    if (repaymentToPay && parseFloat(paymentAmount) >= repaymentToPay.amount) {
      setPaymentLoading(true); // Set payment button to loading state
      try {
        // Update repayment status to PAID
        await axios.post(`${process.env.REACT_APP_BACKEND_URL}/user/pay`, {
          loanId: selectedLoan._id,
          repaymentId: repaymentToPay._id,
          paymentAmount,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(() => {
          toast.success("Payment Successful!!");
        });

        setShowModal(false); // Close modal after payment
        window.location.reload(); // Refresh page to show updated status
      } catch (error) {
        toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
        console.error('Error making payment:', error);
      } finally {
        setPaymentLoading(false); // Reset loading state after submission
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/user/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col items-center px-4">
      <ToastContainer  />

      {/* Logout Button */}
      <div className="absolute top-6 right-6">
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <div className="max-w-7xl w-full">
        {loanApplications.length === 0 ? (
          <>
            <h1 className="text-3xl text-center mb-6 mt-12 font-bold text-blue-600 md:text-4xl">Your Loan Applications</h1>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-700 text-lg mb-4">No loan applications found. Create one now!</p>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                onClick={() => navigate('/user/loanapplication')}
              >
                Apply for Loan
              </button>
            </div>
          </>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-8 flex-col md:flex-row mt-12">
              <h1 className="text-3xl mb-6 font-bold text-blue-600 md:text-4xl md:mb-0">Your Loan Applications</h1>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                onClick={() => navigate('/user/loanapplication')}
              >
                Apply for Loan
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {loanApplications.map((application) => (
                <div key={application._id} className="bg-white shadow-lg p-6 rounded-md w-full flex flex-col sm:flex-row justify-between items-start">
                  <div className="flex-grow">
                    <h2 className="text-2xl font-semibold text-blue-600 mb-4">Loan #{application._id}</h2>
                    <p className="text-gray-700"><strong>Amount:</strong> ${application.amountRequired}</p>
                    <p className="text-gray-700"><strong>Term:</strong> {application.loanTerm} weeks</p>
                    <p className="text-gray-700"><strong>Repayment Frequency:</strong> {application.repaymentFrequency}</p>
                    <p className="text-gray-700"><strong>Applied Date:</strong> {new Date(application.appliedDate).toLocaleDateString()}</p>

                    <h3 className="text-lg font-semibold mt-4 mb-2">Repayment Schedule</h3>
                    <ul className="pl-4 list-disc">
                      {application.scheduledRepayments.map((repayment, index) => (
                        <li key={index} className="text-gray-700">
                          {new Date(repayment.dueDate).toLocaleDateString()}: ${repayment.amount} - {repayment.status}
                        </li>
                      ))}
                    </ul>
                    {application.status === 'APPROVED' && (
                      <button
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        onClick={() => handleMakePayment(application)}
                      >
                        Make Payment
                      </button>
                    )}
                  </div>

                  <div className="mt-4 sm:mt-0 sm:ml-6">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold text-white ${
                      application.status === 'PENDING' ? 'bg-yellow-500' : 
                      application.status === 'APPROVED' ? 'bg-green-500' : 
                      application.status === 'PAID' ? 'bg-blue-500' : 'bg-red-500'
                    }`}>
                      {application.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showModal && selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-2xl mb-4 font-bold">Make Payment for Loan #{selectedLoan._id}</h2>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Enter payment amount"
              className="w-full px-4 py-2 border rounded-lg mb-4"
            />
            <div className="flex justify-end space-x-4">
              <button
                className="bg-gray-500 text-black font-bold px-4 py-2 rounded-md hover:bg-gray-600"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className={` text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
                onClick={handlePaymentSubmit}
                disabled={paymentLoading}
              >
                {paymentLoading ? 'Processing...' : 'Submit Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
