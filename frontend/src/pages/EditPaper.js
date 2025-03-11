import React, { useState, useEffect } from "react";
import { uploadPaper } from "../api"; // Replace this with an appropriate API method for updating papers
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import "../editpaper.css";

const EditPaper = () => {
  const { paperId } = useParams(); // Assuming paperId is passed as a route parameter
  const [formData, setFormData] = useState({
    title: "",
    indexing: "",
    transactions: "",
    dateOfAcceptance: "",
    dateOfPublishing: "",
    doi: "",
    volume: "",
    pageNumbers: "",
  });
  const [pdf, setPdf] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/");
    } else {
      // Fetch existing paper data using paperId
      const fetchPaper = async () => {
        try {
          // Example API call to get paper details
          const response = await axios.get(`/api/papers/papers/${paperId}`);
          setFormData(response.data);
        } catch (error) {
          console.error("Failed to fetch paper details:", error);
        }
      };
      fetchPaper();
    }
  }, [navigate, paperId]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setPdf(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    if (pdf) {
      data.append("pdf", pdf);
    }

    try {
      const token = localStorage.getItem("authToken");
      await uploadPaper(data, token); // Replace with appropriate API for updating papers
      alert("Paper updated successfully");
      navigate("/faculty-home");
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("authToken");
        navigate("/");
      } else {
        console.error("Failed to update paper:", error);
      }
    }
  };

  return (
    <div className="edit-form-container">
      <header className="EditPaperHeader">
        <img src="/images/Vaagdevi.png" alt="Logo" className="EditPaperHeader-logo" />
      </header>
      <div className="edit-box">
        <h1 className="edit-title">Edit Paper</h1>
        <form className="edit" onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="input-group">
            <label htmlFor="title">Title of the Paper:</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter Title of Paper"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="indexing">Indexing:</label>
            <input
              id="indexing"
              type="text"
              name="indexing"
              value={formData.indexing}
              onChange={handleChange}
              placeholder="Enter Indexing Details"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="transactions">Transactions:</label>
            <input
              id="transactions"
              type="text"
              name="transactions"
              value={formData.transactions}
              onChange={handleChange}
              placeholder="Enter Transactions"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="dateOfAcceptance">Date of Acceptance:</label>
            <input
              id="dateOfAcceptance"
              type="date"
              name="dateOfAcceptance"
              value={formData.dateOfAcceptance}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="dateOfPublishing">Date of Publishing:</label>
            <input
              id="dateOfPublishing"
              type="date"
              name="dateOfPublishing"
              value={formData.dateOfPublishing}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="doi">DOI:</label>
            <input
              id="doi"
              type="text"
              name="doi"
              value={formData.doi}
              onChange={handleChange}
              placeholder="Enter DOI"
            />
          </div>
          <div className="input-group">
            <label htmlFor="volume">Volume:</label>
            <input
              id="volume"
              type="text"
              name="volume"
              value={formData.volume}
              onChange={handleChange}
              placeholder="Enter Volume"
            />
          </div>
          <div className="input-group">
            <label htmlFor="pageNumbers">Page Numbers:</label>
            <input
              id="pageNumbers"
              type="text"
              name="pageNumbers"
              value={formData.pageNumbers}
              onChange={handleChange}
              placeholder="Enter Page Numbers"
            />
          </div>
          <div className="input-group">
            <label htmlFor="pdf">Upload PDF:</label>
            <input id="pdf" type="file" accept="application/pdf" onChange={handleFileChange} />
          </div>
          <button type="submit">Update Paper</button>
        </form>
      </div>
      <footer className="Edit-footer">
        <p>&copy; 2024 Vaagdevi Colleges. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default EditPaper;