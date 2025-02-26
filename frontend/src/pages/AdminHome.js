import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../adminhome.css";

const AdminHome = () => {
  const navigate = useNavigate();
  const paperTypes = ["Journal", "Conference", "Book Chapter", "Textbook", "Patent"];
  const [displayedPapers, setDisplayedPapers] = useState([...paperTypes, ...paperTypes]); // Start with a duplicated list
  const listRef = useRef(null);

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      alert("Unauthorized Access! Login First!");
      navigate("/");
    }
  }, [navigate]);

  const handlePaperTypeSelect = (paperType) => {
    navigate(`/admin-report/${paperType}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  const handleScroll = () => {
    const list = listRef.current;
    
    if (list.scrollTop + list.clientHeight >= list.scrollHeight - 10) {
      // When reaching the bottom, duplicate the list to create an infinite effect
      setDisplayedPapers((prev) => [...prev, ...paperTypes]);
    }
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
        <div className="paperTypeList" ref={listRef} onScroll={handleScroll}>
          <ul>
            {displayedPapers.map((type, index) => (
              <li key={index}>
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