import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // New loading state
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("admintoken");
    const adminId = localStorage.getItem("adminId");
    if (token && adminId) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when login starts

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/admin/login`, 
        { email, password }
      );
      localStorage.setItem('adminId', response.data.admin._id); 
      localStorage.setItem('admintoken', response.data.token); 
      localStorage.setItem('loggedinAs', 'Admin');

      toast.success("Login successful!");
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);
    } catch (err) {
      // Handle login error and show error toast
      if (err.response) {
        toast.error(err.response.data.message); // Show error message from the response
      } else {
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false); // Set loading to false after login attempt finishes
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleBackClick = () => {
    localStorage.removeItem('loggedinAs');
    navigate('/');
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-blue-50">
      <ToastContainer /> {/* Toastify container */}

      {/* Back Button */}
      <button
        onClick={handleBackClick}
        className="absolute top-4 left-4 text-blue-600 flex items-center space-x-2"
      >
        <FaArrowLeft />
        <span>Back</span>
      </button>

      <div className="bg-white shadow-lg rounded-lg p-8 max-w-sm w-full">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              placeholder="Enter Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-sky-900 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>
          <div className="mb-6 relative">
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-sky-900 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
            <div
              className="absolute top-[34px] inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <FaEyeSlash className="text-gray-600" />
              ) : (
                <FaEye className="text-gray-600" />
              )}
            </div>
          </div>
          <button
            type="submit"
            className={`w-full py-2 rounded-md text-white transition duration-200 ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={loading} // Disable button while loading
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Want to sign up?{' '}
            <span
              className="text-blue-600 hover:underline cursor-pointer"
              onClick={() => navigate('/admin/signup')}
            >
              Signup
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
