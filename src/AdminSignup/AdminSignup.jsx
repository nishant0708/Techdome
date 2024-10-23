import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const AdminSignup = () => {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false); // New loading state
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

  const validateMobile = (mobile) => {
    return /^[0-9]{10}$/.test(mobile);
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { userName, email, mobile, password, confirmPassword } = formData;

    // Check for empty fields
    if (!userName || !email || !mobile || !password || !confirmPassword) {
      toast.error('All fields are required!');
      return;
    }

    // Validate mobile number
    if (!validateMobile(mobile)) {
      toast.error('Mobile number should be exactly 10 digits and numeric only!');
      return;
    }

    // Validate password strength
    if (!validatePassword(password)) {
      toast.error('Password must be 8-16 characters long, include at least one uppercase letter, one special character, and one number.');
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    setLoading(true); // Set loading to true when signup starts

    try {
      // API call to signup admin
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/admin/signup`, {
        name: userName,
        email,
        mobileNumber: mobile,
        password
      });

      // On success, show toast and navigate to the passcode verification
      if (response.status === 200) {
        toast.success(
          'Signup successful! Collect the OTP from SuperAdmin within 2 days, then go to verify the passcode to complete your signup.'
        );
        setTimeout(() => navigate('/admin/passcode'), 4000);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Something went wrong during signup!');
    } finally {
      setLoading(false); // Set loading to false when signup is complete
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-sm w-full">
        <h2 className="text-2xl font-bold text-blue-600 mb-4 text-center">Admin Signup</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">User Name</label>
            <input
              type="text"
              name="userName"
              placeholder="Enter Your Name"
              value={formData.userName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-sky-900 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>
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
            <label className="block text-gray-700 font-semibold mb-2">Mobile Number</label>
            <input
              type="text"
              name="mobile"
              placeholder="Enter Your Mobile Number"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-sky-900 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              maxLength="10"
              pattern="[0-9]*"
              required
            />
          </div>
          <div className="mb-4 relative">
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter Your Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-sky-900 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
            <div
              className="absolute top-[44px] right-3 cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>
          <div className="mb-6 relative">
            <label className="block text-gray-700 font-semibold mb-2">Confirm Password</label>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Your Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-sky-900 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
            <div
              className="absolute top-[44px] right-3 cursor-pointer"
              onClick={toggleConfirmPasswordVisibility}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>
          <button
            type="submit"
            className={`w-full py-2 rounded-md text-white transition duration-200 ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={loading} // Disable the button when loading
          >
            {loading ? 'Signing up...' : 'Signup'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <span
              className="text-blue-600 hover:underline cursor-pointer"
              onClick={() => navigate('/admin/login')}
            >
              Login
            </span>
          </p>
          <p>OR</p>
          <p className="text-gray-600">
            Already have a Passcode?{' '}
            <span
              className="text-blue-600 hover:underline cursor-pointer"
              onClick={() => navigate('/admin/passcode')}
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

export default AdminSignup;
