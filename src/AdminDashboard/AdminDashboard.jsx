import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminDashboard = () => {
  const [loanApplications, setLoanApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("admintoken"); // Retrieve the admin token from localStorage

  useEffect(() => {
    const fetchLoanApplications = async () => {
      if (!token) {
        // Redirect to login if no token is found
        navigate("/admin/login");
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/admin/applications`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Send the token as a Bearer token
            },
          }
        );
        setLoanApplications(response.data);
      } catch (error) {
        setLoanApplications([]); // Handle if no applications are found or error occurred
      } finally {
        setLoading(false);
      }
    };

    fetchLoanApplications();
  }, [token, navigate]);

  // Function to handle logout
  const handleLogout = () => {
    // Remove token and adminId from localStorage
    localStorage.removeItem("admintoken");
    localStorage.removeItem("adminId");
    // Navigate back to the login page
    navigate("/admin/login");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col items-center px-4">
      <div className="max-w-7xl w-full">
        {/* Top bar with logout button */}
        <div className="flex justify-end mb-8">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg"
          >
            Logout
          </button>
        </div>

        <h1 className="text-4xl font-bold text-blue-600 mb-8 text-center">
          All Loan Applications
        </h1>

        <div className="grid grid-cols-1 gap-6">
          {loanApplications.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-700 text-lg mb-4">
                No loan applications found.
              </p>
            </div>
          ) : (
            loanApplications.map((application) => (
              <div
                key={application._id}
                className="bg-white shadow-lg p-6 rounded-md w-full flex flex-col sm:flex-row justify-between items-start  hover:cursor-pointer hover:shadow-xl transition-shadow duration-200"
                onClick={() =>
                  navigate(`/admin/applicationdetails/${application._id}`)
                } // Navigate to application details
              >
                <div className="flex-grow">
                  <h2 className="text-2xl font-semibold text-blue-600 mb-4">
                    Loan #{application._id}
                  </h2>
                  <p className="text-gray-700">
                    <strong>Applicant Name:</strong> {application.applicantName}
                  </p>
                  <p className="text-gray-700">
                    <strong>Amount:</strong> ${application.amountRequired}
                  </p>
                  <p className="text-gray-700">
                    <strong>Term:</strong> {application.loanTerm} weeks
                  </p>
                  <p className="text-gray-700">
                    <strong>Repayment Frequency:</strong>{" "}
                    {application.repaymentFrequency}
                  </p>
                  <p className="text-gray-700">
                    <strong>Applied Date:</strong>{" "}
                    {new Date(application.appliedDate).toLocaleDateString()}
                  </p>
                </div>

                {/* Highlight the status */}
                <div className="mt-4 sm:mt-0 sm:ml-6">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-bold text-white ${
                      application.status === "PENDING"
                        ? "bg-yellow-500"
                        : application.status === "APPROVED"
                        ? "bg-green-500"
                        : application.status === "PAID"
                        ? "bg-blue-500"
                        : "bg-red-500"
                    }`}
                  >
                    {application.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
