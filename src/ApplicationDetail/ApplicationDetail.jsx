import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ApplicationDetails = () => {
  const { id } = useParams(); // Get loan application ID from the URL
  const [loanApplication, setLoanApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [decisionLoading, setDecisionLoading] = useState(false); // New state for decision buttons
  const navigate = useNavigate();
  const token = localStorage.getItem('admintoken'); // Retrieve admin token

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/admin/applicationdetails/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLoanApplication(response.data);
      } catch (error) {
        toast.error('Error fetching loan application details.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [id, token]);

  const handleDecision = async (decision) => {
    setDecisionLoading(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/admin/application/${id}/decision`,
        { decision },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(`Application ${decision.toLowerCase()} successfully!`);
      setTimeout(() => navigate('/admin/dashboard'), 2000); // Redirect after 2 seconds
    } catch (error) {
      toast.error(`Error ${decision.toLowerCase()} the application.`);
    } finally {
      setDecisionLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!loanApplication) {
    return <div>Application not found</div>;
  }

  const isApproved = loanApplication.status === 'APPROVED' || loanApplication.status === 'PAID';
  const isRejected = loanApplication.status === 'REJECTED';

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col items-center px-4">
      <div className="max-w-4xl w-full bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6">Loan Application Details</h1>

        {/* User Details */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Applicant Information</h2>
          <p><strong>Name:</strong> {loanApplication.userId.userName}</p>
          <p><strong>Email:</strong> {loanApplication.userId.email}</p>
          <p><strong>Mobile:</strong> {loanApplication.userId.mobile}</p>
        </div>

        {/* Loan Application Details */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Loan Application</h2>
          <p><strong>Amount Requested:</strong> ${loanApplication.amountRequired}</p>
          <p><strong>Loan Term:</strong> {loanApplication.loanTerm} weeks</p>
          <p><strong>Repayment Frequency:</strong> {loanApplication.repaymentFrequency}</p>

          <p>
            <strong>Status:</strong>{' '}
            <span
              className={`font-bold ${
                loanApplication.status === 'PENDING' ? 'text-yellow-500' :
                loanApplication.status === 'APPROVED' ? 'text-green-500' : 
                loanApplication.status === 'PAID' ? 'text-blue-500' : 'text-red-500'
              }`}
            >
              {loanApplication.status}
            </span>
          </p>

          <p><strong>Applied Date:</strong> {new Date(loanApplication.appliedDate).toLocaleDateString()}</p>
        </div>

        {/* Payment Schedule - Show only if the loan is approved or paid */}
        {isApproved && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Payment Schedule</h2>
            {loanApplication.scheduledRepayments.length > 0 ? (
              <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-2 px-4 text-left">Due Date</th>
                    <th className="py-2 px-4 text-left">Amount</th>
                    <th className="py-2 px-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loanApplication.scheduledRepayments.map((repayment, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-4">{new Date(repayment.dueDate).toLocaleDateString()}</td>
                      <td className="py-2 px-4">${repayment.amount.toFixed(2)}</td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-bold ${
                            repayment.status === 'PENDING' ? 'bg-yellow-500' :
                            repayment.status === 'PAID' ? 'bg-green-500' : 'bg-red-500'
                          } text-white`}
                        >
                          {repayment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No repayment schedule available.</p>
            )}
          </div>
        )}

        {/* Approve and Reject Buttons - Hide if loan is already approved, paid, or rejected */}
        {!isApproved && !isRejected && (
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 bg-green-500 text-white font-bold rounded-lg ${decisionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleDecision('APPROVED')}
              disabled={decisionLoading}
            >
              {decisionLoading ? 'Processing...' : 'Approve'}
            </button>
            <button
              className={`px-4 py-2 bg-red-500 text-white font-bold rounded-lg ${decisionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleDecision('REJECTED')}
              disabled={decisionLoading}
            >
              {decisionLoading ? 'Processing...' : 'Reject'}
            </button>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default ApplicationDetails;
