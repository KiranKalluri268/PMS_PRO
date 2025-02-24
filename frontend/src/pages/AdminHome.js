import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../adminhome.css";

const AdminHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      alert("Unauthorized Access! Login First!");
      navigate("/");
    }
  }, [navigate]);

  const paperTypes = ["Journal", "Conference", "Book Chapter", "Textbook", "Patent"];

  const handlePaperTypeSelect = (paperType) => {
    navigate(`/admin-report/${paperType}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  return (
    <div className="admin-home-container">
      <header className="AdminHeader">
        <img src="/images/Vaagdevi.png" alt="Logo" className="AdminHeader-logo" />
        <img
          src="/images/logout-icon.png"
          alt="Logout"
          className="AdminHeader-Logout-Logo"
          onClick={handleLogout}
        />
      </header>

      <div className="paper-type-list">
        <h2>Select a Paper Type</h2>
        <div className="paperTypeList">
          <ul>
            {paperTypes.map((type) => (
              <li key={type}>
                <button onClick={() => handlePaperTypeSelect(type)}>{type}</button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; 2024 Vaagdevi Colleges. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default AdminHome;