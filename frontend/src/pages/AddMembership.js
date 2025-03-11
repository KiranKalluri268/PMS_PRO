import React, { useState } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../register.css';

const Membership = () => {
  const [name, setName] = useState("");
  const [membershipBody, setMembershipBody] = useState("");
  const [membershipType, setMembershipType] = useState("");
  const [customMembershipType, setCustomMembershipType] = useState("");
  const [membershipYear, setMembershipYear] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const token = localStorage.getItem("authToken");
  const decodedToken = JSON.parse(atob(token.split(".")[1]));
  const navigate = useNavigate();
  

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('/api/membership/register', {
        name,
        membershipBody,
        membershipType: membershipType === "Custom" ? customMembershipType : membershipType,
        membershipYear,
        expiryDate: membershipType === "Lifetime" ? "N/A" : expiryDate, // Store "N/A" when Lifetime is selected
      }, {
        headers: { "x-auth-token": localStorage.getItem("authToken") },
      });

      if (response && response.data) {
        alert('Membership information submitted successfully!');
        navigate(`/faculty-home/${decodedToken.userId}`);
      }
    } catch (error) {
      console.error('Error submitting membership details:', error);
      alert(error.response?.data?.message || 'Submission failed');
    }
  };

  return (
    <div className="register-container">
      <header className="header">
        <img src="/images/Vaagdevi.png" alt="Logo" className="RegisterHeader-logo" />
      </header>

      <div className="register-box">
        <h1 className="register-title">Membership in Professional Bodies</h1>
        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <label htmlFor="name">Your Name:</label>
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
            <label htmlFor="membershipBody">Name of the Body:</label>
            <input
              id="membershipBody"
              type="text"
              placeholder="Enter the organization name"
              value={membershipBody}
              onChange={(e) => setMembershipBody(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="membershipType">Validity of Membership:</label>
            <select
              id="membershipType"
              value={membershipType}
              onChange={(e) => {
                setMembershipType(e.target.value);
                if (e.target.value === "Lifetime") {
                  setExpiryDate(""); // Clear expiry date when Lifetime is selected
                }
              }}
              required
            >
              <option value="">Select Type</option>
              <option value="One Year">One Year</option>
              <option value="Lifetime">Lifetime</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          {/* Show custom membership input field only if "Custom" is selected */}
          {membershipType === "Custom" && (
            <div className="input-group">
              <label htmlFor="customMembershipType">Enter Custom Validity:</label>
              <input
                id="customMembershipType"
                type="text"
                placeholder="Enter custom type"
                value={customMembershipType}
                onChange={(e) => setCustomMembershipType(e.target.value)}
                required
              />
            </div>
          )}

          <div className="input-group">
            <label htmlFor="membershipYear">Year of Membership:</label>
            <input
              id="membershipYear"
              type="number"
              placeholder="Enter the year"
              value={membershipYear}
              onChange={(e) => setMembershipYear(e.target.value)}
              required
            />
          </div>

          {/* Expiry Date field appears only if type is NOT Lifetime */}
          {membershipType !== "Lifetime" && (
            <div className="input-group">
              <label htmlFor="expiryDate">Expiry Date:</label>
              <input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />
            </div>
          )}

          <button type="submit">Submit</button>
        </form>
      </div>

      <footer className="Registerfooter">
        <p>&copy; 2024 Vaagdevi Colleges. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Membership;
