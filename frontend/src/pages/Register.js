import React, { useState } from 'react';
import axios from "axios";
import '../register.css';

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [passwordRules, setPasswordRules] = useState({
    hasLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const validatePassword = (password) => {
    setPasswordRules({
      hasLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('/api/auth/register', {
        email,
        name,
        password,
      });

      if (response && response.data) {
        alert('Registration successful! Please verify your email before logging in.');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="register-container">
      <header className="header">
        <img src="/images/Vaagdevi.png" alt="Logo" className="RegisterHeader-logo" />
      </header>

      <div className="register-box">
        <h1 className="register-title">Faculty Registration</h1>
        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <label htmlFor="name">Name:</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group-password">
          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            </div>
            <div className="password-rules">
            <ul>
              <li className={passwordRules.hasLength ? "valid" : "invalid"}>At least 8 characters</li>
              <li className={passwordRules.hasUppercase ? "valid" : "invalid"}>At least one uppercase letter</li>
              <li className={passwordRules.hasLowercase ? "valid" : "invalid"}>At least one lowercase letter</li>
              <li className={passwordRules.hasNumber ? "valid" : "invalid"}>At least one number</li>
              <li className={passwordRules.hasSpecialChar ? "valid" : "invalid"}>At least one special character (!@#$%^&*)</li>
            </ul>
            </div>
          </div>

          <button type="submit">Register</button>
          <br />
          <a href="./">Already have an account? Login here</a>
        </form>
      </div>

      <footer className="Registerfooter">
        <p>&copy; 2024 Vaagdevi Colleges. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Register;
