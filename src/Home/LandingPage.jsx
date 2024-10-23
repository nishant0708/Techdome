import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLogin = (role) => {
    localStorage.setItem('loggedinAs', role);
    // Programmatically navigate based on the role
    if (role === 'Admin') {
      navigate('/admin/login');
    } else {
      navigate('/user/login');
    }
  };

  // UseEffect to handle redirect based on localStorage
  useEffect(() => {
    const loggedinAs = localStorage.getItem('loggedinAs');
    if (loggedinAs === 'Admin') {
      navigate('/admin/login');
    } else if (loggedinAs === 'User') {
      navigate('/user/login');
    }
  }, [navigate]);

  return (
    <div className="w-full min-h-screen px-5 flex justify-center items-center bg-blue-50">
      <div className="w-full bg-white shadow-lg rounded-lg p-12 max-w-md text-center">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">
          How do you want to enter as:
        </h2>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => handleLogin('Admin')}
            className="bg-blue-600 w-[200px] text-white text-xl px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Admin
          </button>
          <button
            onClick={() => handleLogin('User')}
            className="bg-blue-600 w-[200px] text-white text-xl px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            User
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
