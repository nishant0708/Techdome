import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AdminLogin from "./AdminLogin/AdminLogin";
import UserLogin from "./UserLogin/UserLogin";
import LandingPage from "./Home/LandingPage";
import UserSignup from "./UserSignup/UserSignup";
import AdminSignup from "./AdminSignup/AdminSignup";
import UserDashboard from "./UserDashboard/UserDashboard";
import AdminPasscode from "./AdminPasscode/AdminPasscode";
import AdminDashboard from "./AdminDashboard/AdminDashboard";
import LoanApplication from "./LoanApplication/LoanApplication";
import ApplicationDetail from "./ApplicationDetail/ApplicationDetail";

const App = () => {
  const [loggedInAs, setLoggedInAs] = useState(localStorage.getItem("loggedinAs"));
  const [userAuthenticated, setUserAuthenticated] = useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);

  // Continuously check for authentication status every second
  useEffect(() => {
    const interval = setInterval(() => {
      setLoggedInAs(localStorage.getItem("loggedinAs"));

      // Update user authentication status
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      setUserAuthenticated(!!token && !!userId);

      // Update admin authentication status
      const adminToken = localStorage.getItem("admintoken");
      const adminId = localStorage.getItem("adminId");
      setAdminAuthenticated(!!adminToken && !!adminId);
      
    }, 100); // Check every second

    return () => {
      clearInterval(interval);
    };
  }, []); // Empty dependency array to run this effect on component mount

  return (
    <Router>
      <Routes>
        {/* Common Route */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/user/login" element={<UserLogin />} />

        {/* Admin routes: Only accessible if admin is authenticated */}
        {loggedInAs === "Admin" && (
          <>
            <Route path="/admin/signup" element={<AdminSignup />} />

            {/* Admin Passcode Route: Redirect to login if not authenticated */}
            <Route
              path="/admin/passcode"
              element={
                <AdminPasscode />  
              }
            />

            {/* Admin Dashboard Route: Redirect to login if not authenticated */}
            <Route
              path="/admin/dashboard"
              element={
                adminAuthenticated ? <AdminDashboard /> : <Navigate to="/admin/login" />
              }
            />

            {/* Admin Application Details Route: Redirect to login if not authenticated */}
            <Route
              path="/admin/applicationdetails/:id"
              element={
                adminAuthenticated ? <ApplicationDetail /> : <Navigate to="/admin/login" />
              }
            />
          </>
        )}

        {/* User routes: Only accessible if user is authenticated */}
        {loggedInAs === "User" && (
          <>
            <Route path="/user/signup" element={<UserSignup />} />

            {/* User Dashboard Route: Redirect to login if not authenticated */}
            <Route
              path="/user/dashboard"
              element={
                userAuthenticated ? <UserDashboard /> : <Navigate to="/user/login" />
              }
            />

            {/* Loan Application Route: Redirect to login if not authenticated */}
            <Route
              path="/user/loanapplication"
              element={
                userAuthenticated ? <LoanApplication /> : <Navigate to="/user/login" />
              }
            />
          </>
        )}

        {/* Redirect to LandingPage if no role is found */}
        <Route path="/*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
