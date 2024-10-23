# Project Setup Guide

This guide will help you set up the project on your local machine to get it running.

## Prerequisites

Before starting, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/)

## Frontend Setup (React)

1. Clone the repository and navigate to the project directory:

   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. Install the necessary dependencies:

   ```bash
     npm install
   ```

3. Create a .env file in the root of the frontend directory and add the following environment variable:

   ```bash
   REACT_APP_BACKEND_URL=http://localhost:5000
   ```

4. Start the React frontend:
   ```bash
   npm start
   ```

---

### Backend Setup (Node.js + Express)

1. Open a new terminal, navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:

   ```bash
   npm install
   ```

3. Create a .env file in the backend directory and add the following environment variables:

   ```bash
     MONGO_URI=your_mongo_uri
    PORT=5000
    JWT_SECRET=your_jwt_secret_key
    SuperAdmin_EMAIL=your_email_address
    EMAIL_USER="your_email_address"
    EMAIL_PASS=your_mail_app_password
   ```

#### Explanation of Environment Variables:

- MONGO_URI: This is the connection string to your MongoDB database.
  PORT: The port on which the backend will run (in this case, 5000).
- JWT_SECRET: A secret key used to sign JSON Web Tokens (JWT) for authentication.
- SuperAdmin_EMAIL: This is the email address of the SuperAdmin. When an admin signs up, the SuperAdmin will receive an OTP via email to verify the signup process.
- EMAIL_USER: The email address from which emails (such as OTPs) will be sent.
- EMAIL_PASS: The mail app password or SMTP password for sending emails through the email address.

These email-related environment variables are necessary because the application needs to send OTPs to the admin for verification. The SuperAdmin email ensures that only the designated person can verify new admin accounts.

4. Start the backend server:
   ```bash
    npm start
   ```
5. The backend will be running on http://localhost:5000.

### Running the Application

Now that both the frontend and backend are running:

- Open http://localhost:3000 in your browser to access the application.

- Make sure the backend is running on http://localhost:5000 for proper API communication.

### Additional Information

- The application uses JWT for authentication. Ensure that the JWT_SECRET in the backend's .env is secure.
- For email functionality, ensure that you have created an app-specific password (or similar) for your email provider (e.g., Gmail).

### Troubleshooting

- If the frontend or backend doesn't start, ensure that you have correctly set up the .env files and installed all dependencies.
- If you encounter any issues with MongoDB, verify your MONGO_URI and ensure MongoDB is running on your machine or in the cloud.
