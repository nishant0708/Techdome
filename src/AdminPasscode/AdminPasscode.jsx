import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const AdminPasscode = () => {
  const [formData, setFormData] = useState({
    email: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("admintoken");
    const adminId = localStorage.getItem("adminId");
    if (token && adminId) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, otp } = formData;

    if (!email || !otp) {
      toast.error('Both email and OTP are required!');
      return;
    }

    try {
      setLoading(true);
      // API call to verify the passcode
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/admin/verifypasscode`, { email, otp });

      if (response.status === 200) {
        toast.success('Verification successful! You can now log in.');
        setTimeout(() => navigate('/admin/login'), 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid or expired OTP!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-sm w-full">
        <h2 className="text-2xl font-bold text-blue-600 mb-4 text-center">Admin Passcode</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter Your Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-sky-900 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">OTP</label>
            <input
              type="text"
              name="otp"
              placeholder="Enter Your OTP"
              value={formData.otp}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-sky-900 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200 ${loading ? 'opacity-50' : ''}`}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Passcode'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-gray-600">
           Want to Go back?{' '}
            <span
              className="text-blue-600 hover:underline cursor-pointer"
              onClick={() => navigate('/admin/signup')}
            >
              Click here
            </span>
          </p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminPasscode;
