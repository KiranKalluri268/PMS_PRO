import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from "axios";
import '../login.css';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
  
    const handleSubmit = async (event) => {
      event.preventDefault();
    
      try {
        const response = await axios.post('/api/auth/login', {
          email,
          password,
        });
    
        // Check if `response` and `response.data` exist
        if (response && response.data) {
          console.log('Login successful:', response.data);
        
          // Store the token in localStorage
          const token = response.data.token;
          localStorage.setItem('authToken', token);
        
          // Decode the token to extract userRole
          const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decoding the JWT
          console.log("Decoded in frontend login:",decodedToken);
          const userRole = decodedToken.userRole; // Extract the role from the token
          const useremail = decodedToken.useremail;

          console.log('Decoded rollNumber:', useremail);
          console.log('Decoded user role:', userRole);
        
          // Redirect based on userRole
          if (userRole === 'faculty') {
            window.location.href = `/faculty-home/${decodedToken.userId}`; // Assuming userId is rollNumber
          } else if (userRole === 'admin') {
            window.location.href = '/admin-home'; // Admin doesn't need rollNumber in URL
          } else {
            console.error('Unknown role. Cannot navigate.');
          }
        } else {
          console.log('Unexpected response structure:', response);
        }
      } catch (error) {
        console.error('Error during login:', error);
        setError(error.response?.data?.message || "Login failed. Please try again.");
      }
    };

  return (
    <div className="login-container">
      {/* Header Section */}
      <header className="LoginHeader">
        <img src="/images/Vaagdevi.png" alt="Logo" className="LoginHeader-logo" />
      </header>

      <div className="login-box">
        <h1 className="login-title">Faculty Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="userID">Email :</label>
            <input
              id="userID"
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              title="Enter mail (e.g.,)."
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p style={{ color: 'red', margin: '10px 0' }}>{error}</p>}
          <button type="submit">Login</button>
          <br />
          <div className="links">
            <Link to="/forgot-password">Forgot Password?</Link>
            <br />
            <Link to="/register">Don't have an account? Register here</Link>
          </div>
        </form>
      </div>

      {/* Footer Section */}
      <footer className="footer">
        <p>&copy; 2024 Vaagdevi Colleges. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Login;
