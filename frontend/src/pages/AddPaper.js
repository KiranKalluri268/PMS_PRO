// AddPaper.js
import React, { useState, useEffect } from "react";
import { uploadPaper } from "../api";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../addpaper.css";

const AddPaper = ({ id }) => {
  const [formData, setFormData] = useState({
    title: "",
    indexing: "",
    transactions: "",
    dateOfAcceptance: "",
    dateOfPublishing: "",
    doi: "",
    volume: "",
    pageNumbers: "",
    paperLink: "",
  });
  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("authToken");
  const decodedToken = JSON.parse(atob(token.split(".")[1]));

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    setPdf(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate that at least one of "pdf" or "paperLink" is provided
    if (!pdf && !formData.paperLink) {
      alert("Please provide either a PDF or a Paper Link.");
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("indexing", formData.indexing);
    data.append("transactions", formData.transactions);
    data.append("dateOfAcceptance", formData.dateOfAcceptance);
    data.append("dateOfPublishing", formData.dateOfPublishing);
    data.append("doi", formData.doi);
    data.append("volume", formData.volume);
    data.append("pageNumbers", formData.pageNumbers);

    if (formData.paperLink) {
      data.append("paperLink", formData.paperLink);
    }

    if (pdf) {
      data.append("pdf", pdf);
    }

    console.log("Data being sent to backend:", Object.fromEntries(data.entries()));

    try {
      await uploadPaper(data, token);
      alert("Paper uploaded successfully!");
      navigate(`/faculty-home/${decodedToken.userId}`);
    } catch (error) {
      console.error("Failed to upload paper:", error);

      if (error.response && error.response.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("authToken");
        navigate("/");
      } else if (error.response) {
        alert(`Error: ${error.response.data.message || "Failed to upload paper."}`);
      } else {
        alert("An unknown error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-form-container">
      <header className="AddPaperHeader">
        <img src="/images/Vaagdevi.png" alt="Logo" className="AddPaperHeader-logo" />
      </header>
      <div className="upload-box">
        <h1 className="upload-title">Upload Paper</h1>
        <form className="upload" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="title">Title of the Paper:</label>
            <input id="title" type="text" name="title" onChange={handleChange} placeholder="Enter Title" required />
          </div>
          <div className="input-group">
            <label htmlFor="indexing">Indexing:</label>
            <input id="indexing" type="text" name="indexing" onChange={handleChange} placeholder="Enter Indexing" required />
          </div>
          <div className="input-group">
            <label htmlFor="transactions">Transactions:</label>
            <input id="transactions" type="text" name="transactions" onChange={handleChange} placeholder="Enter Transactions" required />
          </div>
          <div className="input-group">
            <label htmlFor="dateOfAcceptance">Date of Acceptance:</label>
            <input id="dateOfAcceptance" type="date" name="dateOfAcceptance" onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label htmlFor="dateOfPublishing">Date of Publishing:</label>
            <input id="dateOfPublishing" type="date" name="dateOfPublishing" onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label htmlFor="doi">DOI:</label>
            <input id="doi" type="text" name="doi" onChange={handleChange} placeholder="Enter DOI" required />
          </div>
          <div className="input-group">
            <label htmlFor="volume">Volume:</label>
            <input id="volume" type="text" name="volume" onChange={handleChange} placeholder="Enter Volume" required />
          </div>
          <div className="input-group">
            <label htmlFor="pageNumbers">Page Numbers:</label>
            <input id="pageNumbers" type="text" name="pageNumbers" onChange={handleChange} placeholder="Enter Page Numbers" required />
          </div>
          <div className="input-group">
            <label htmlFor="paperLink">Paper Link:</label>
            <input id="paperLink" type="url" name="paperLink" onChange={handleChange} placeholder="Enter Paper Link" />
          </div>
          <div className="input-group">
            <label htmlFor="pdf">Upload PDF:</label>
            <input id="pdf" type="file" accept="application/pdf" onChange={handleFileChange} />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
          <br />
          <Link to={`/faculty-home/${decodedToken.userId}`}>Go back to home</Link>
        </form>
      </div>
      <footer className="footer">
        <p>&copy; 2024 Vaagdevi Colleges. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default AddPaper;