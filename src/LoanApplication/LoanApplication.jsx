import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const LoanApplication = () => {
  const [formData, setFormData] = useState({
    amountRequired: '',
    loanTerm: '',
    repaymentFrequency: 'weekly',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { amountRequired, loanTerm, repaymentFrequency } = formData;

  
    if (parseFloat(amountRequired) <= 0) {
      toast.error('Loan amount must be greater than $0!');
      return;
    }

    if (parseInt(loanTerm) < 1) {
      toast.error('Loan term must be at least 1 week!');
      return;
    }

    try {
      setLoading(true);

    
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/user/apply`, 
        {
          amountRequired,
          loanTerm,
          repaymentFrequency,
          userId,  
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,  
          },
        }
      );

      if (response.status === 200) {
        toast.success('Loan application submitted successfully!');
        setTimeout(() => navigate('/user/dashboard'), 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit loan application!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-blue-600 mb-4 text-center">Apply for Loan</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Amount Required ($)</label>
            <input
              type="number"
              name="amountRequired"
              placeholder="Enter Loan Amount"
              value={formData.amountRequired}
              onChange={handleChange}
              min="1"  
              className="w-full px-4 py-2 border border-sky-900 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Loan Term (in weeks)</label>
            <input
              type="number"
              name="loanTerm"
              placeholder="Enter Loan Term (weeks)"
              value={formData.loanTerm}
              onChange={handleChange}
              min="1"  
              className="w-full px-4 py-2 border border-sky-900 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Repayment Frequency</label>
            <select
              name="repaymentFrequency"
              value={formData.repaymentFrequency}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-sky-900 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            >
              <option value="weekly">Weekly</option>
              <option value="bi-weekly">Bi-Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200 ${loading ? 'opacity-50' : ''}`}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Apply for Loan'}
          </button>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default LoanApplication;
