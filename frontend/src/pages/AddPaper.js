import React, { useState, useEffect } from "react";
import { uploadPaper } from "../api";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../addpaper.css";

const AddPaper = ({ id }) => {
  const [formData, setFormData] = useState({
    type: "Journal",
    publisherName: "",
    title: "",
    authors: "", //new
    patentAppNum: "", //new
    filedOfStudy: "", //new
    confenrenceProceedings: "", //new
    yearOfConference: "", //new
    nameOfPublisher: "", //new
    grantDate: "", //new
    indexing: "",
    transactions: "",
    dateOfAcceptance: "",
    dateOfPublishing: "",
    doi: "",
    volume: "",
    pageNumbers: "",
    paperLink: "",
    onlineLink: "",
    conferenceName: "",
    bookTitle: "",
    patentNumber: "",
    filingDate: "",
    publicationDate: "",
  });

  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("authToken");
  const decodedToken = JSON.parse(atob(token.split(".")[1]));

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setPdf(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    if (!pdf && !formData.paperLink) {
      alert("Please provide either a PDF or a Paper Link.");
      setLoading(false);
      return;
    }
  
    // Create a new object with only non-empty fields
    const filteredFormData = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => value.trim() !== "")
    );
  
    const data = new FormData();
    Object.keys(filteredFormData).forEach((key) => {
      data.append(key, filteredFormData[key]);
    });
  
    if (pdf) {
      data.append("pdf", pdf);
    }
  
    console.log("Data being sent:", Object.fromEntries(data));
  
    try {
      await uploadPaper(data, token);
      alert("Paper uploaded successfully!");
      navigate(`/faculty-home/${decodedToken.userId}`);
    } catch (error) {
      console.error("Failed to upload paper:", error);
      if (error.response?.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("authToken");
        navigate("/");
      } else {
        alert(`Error: ${error.response?.data?.message || "Failed to upload paper."}`);
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
          {/* Type Selection */}
          <div className="input-group">
            <label htmlFor="type">Type:</label>
            <select id="type" name="type" value={formData.type} onChange={handleChange} required>
              <option value="Journal">Journal</option>
              <option value="Conference">Conference</option>
              <option value="Book Chapter">Book Chapter</option>
              <option value="Textbook">Textbook</option>
              <option value="Patent">Patent</option>
            </select>
          </div>

          {/* Common Fields */}
          {/* <div className="input-group">
            <label htmlFor="title">Title of the Paper:</label>
            <input id="title" type="text" name="title" onChange={handleChange} placeholder="Enter Title" required />
          </div> */}

          {/* Conditional Fields */}
          {formData.type === "Journal" && (
            <>
          <div className="input-group">
            <label htmlFor="title">Title of the Journal:</label>
            <input id="title" type="text" name="title" onChange={handleChange} placeholder="Enter Title" required />
          </div>
          <div className="input-group">
            <label htmlFor="authors">Authors:</label>
            <input id="authors" type="text" name="authors" onChange={handleChange} placeholder="Enter author's names" required />
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
            <label htmlFor="doi">DOI Link:</label>
            <input id="doi" type="url" name="doi" onChange={handleChange} placeholder="Enter DOI Link" required />
          </div>
              <div className="input-group">
                <label htmlFor="volume">Volume:</label>
                <input id="volume" type="text" name="volume" onChange={handleChange} placeholder="Enter Volume" required />
              </div>
              <div className="input-group">
                <label htmlFor="pageNumbers">Page Numbers:</label>
                <input id="pageNumbers" type="text" name="pageNumbers" onChange={handleChange} placeholder="Enter PageNumbers" required />
              </div>
          <div className="input-group">
            <label htmlFor="onlineLink">Online Link of Journal:</label>
            <input id="onlineLink" type="url" name="onlineLink" onChange={handleChange} placeholder="Enter Online Link to journal(optional)" />
          </div>
            </>
          )}

          {formData.type === "Conference" && (
            <>
          <div className="input-group">
            <label htmlFor="title">Title of the Conference:</label>
            <input id="title" type="text" name="title" onChange={handleChange} placeholder="Enter Conference Title" required />
          </div>
          <div className="input-group">
            <label htmlFor="authors">Authors:</label>
            <input id="authors" type="text" name="authors" onChange={handleChange} placeholder="Enter author's names" required />
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
            <label htmlFor="yearOfConference">Year of Conference:</label>
            <input id="yearOfConference" type="text" name="yearOfConference" onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label htmlFor="doi">DOI Link:</label>
            <input id="doi" type="url" name="doi" onChange={handleChange} placeholder="Enter DOI Link" required />
          </div>
            </>
          )}

          {formData.type === "Book Chapter" && (
            <>
            <div className="input-group">
            <label htmlFor="title">Title of the Book Chapter:</label>
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
            </>
          )}

          {formData.type === "Textbook" && (
            <>
            <div className="input-group">
            <label htmlFor="title">Title of the Book:</label>
            <input id="title" type="text" name="title" onChange={handleChange} placeholder="Enter Title" required />
          </div>
          <div className="input-group">
            <label htmlFor="authors">Authors:</label>
            <input id="authors" type="text" name="authors" onChange={handleChange} placeholder="Enter author's names" required />
          </div>
          <div className="input-group">
            <label htmlFor="nameOfPublisher">Publisher:</label>
            <input id="nameOfPublisher" type="text" name="nameOfPublisher" onChange={handleChange} placeholder="Enter Publisher's names" required />
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
            <label htmlFor="onlineLink">Online Link of Textbook:</label>
            <input id="onlineLink" type="url" name="onlineLink" onChange={handleChange} placeholder="Enter Online Link to paper(optional)" />
          </div>
          <div className="input-group">
            <label htmlFor="pageNumbers">Page Numbers:</label>
            <input id="pageNumbers" type="text" name="pageNumbers" onChange={handleChange} placeholder="Enter PageNumbers" required />
          </div>
            </>
          )}

          {formData.type === "Patent" && (
            <>
            <div className="input-group">
              <label htmlFor="patentAppNum">Application Number:</label>
              <input id="patentAppNum" type="text" name="patentAppNum" onChange={handleChange} placeholder="Enter patent's application number" required />
            </div>
            <div className="input-group">
            <label htmlFor="title">Title of the Patent:</label>
            <input id="title" type="text" name="title" onChange={handleChange} placeholder="Enter Title" required />
          </div>
          <div className="input-group">
            <label htmlFor="authors">Authors:</label>
            <input id="authors" type="text" name="authors" onChange={handleChange} placeholder="Enter author's names" required />
          </div>
          <div className="input-group">
            <label htmlFor="filedOfStudy">Field of Study:</label>
            <input id="filedOfStudy" type="text" name="filedOfStudy" onChange={handleChange} placeholder="Field of study of patent" required />
          </div>
          <div className="input-group">
            <label htmlFor="dateOfPublishing">Date of Publishing:</label>
            <input id="dateOfPublishing" type="date" name="dateOfPublishing" onChange={handleChange} required />
          </div>
              <div className="input-group">
                <label htmlFor="filingDate">Date of Filling:</label>
                <input id="filingDate" type="date" name="filingDate" onChange={handleChange} placeholder="Enter filing Date" required />
              </div>
              <div className="input-group">
                <label htmlFor="grantDate">Date fo grant:</label>
                <input id="grantDate" type="date" name="grantDate" onChange={handleChange} placeholder="Enter grant Date" required />
              </div>
            </>
          )}

          <div className="input-group">
            <label htmlFor="paperLink">Paper Link:</label>
            <input id="paperLink" type="url" name="paperLink" onChange={handleChange} placeholder="Enter Paper Link of drive" />
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
      <footer className="upload-footer">
        <p>&copy; 2024 Vaagdevi Colleges. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default AddPaper;