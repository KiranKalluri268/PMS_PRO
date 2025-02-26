import React, { useEffect, useState } from "react";
import { getPapers } from "../api";
import { useNavigate, useParams } from "react-router-dom";
import "../facultyhome.css";

const FacultyHome = () => {
  const { id: facultyId } = useParams();
  const [papers, setPapers] = useState([]);
  const [selectedPaperType, setSelectedPaperType] = useState(""); // Store selected paper type
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  console.log("token in facultyhome:", token);
  console.log("UserId", facultyId);

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [navigate, token]);

  const fetchPapers = async (selectedPaperType) => {
    try {
      const res = await getPapers(facultyId, token, selectedPaperType);
      const sortedPapers = (res.data || []).sort(
        (a, b) => new Date(a.publishDate) - new Date(b.publishDate)
      );
      setPapers(sortedPapers);

      if (sortedPapers.length === 0) {
        console.log("No papers found for this type.");
      }

    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("authToken");
        navigate("/");
      } else {
        console.error("Error fetching papers:", error);
      }
    }
  };

  useEffect(() => {
    fetchPapers(selectedPaperType);
  }, [facultyId, token, selectedPaperType, navigate]);  

  const handlePaperTypeChange = (event) => {
    const selectedType = event.target.value;
    setSelectedPaperType(selectedType);
    fetchPapers(selectedType);
  };

  const handleDownload = async (downloadLink, fileName) => {
    if (!downloadLink) {
      alert("No download link available.");
      return;
    }

    const fileNameWithExtension = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;

    try {
      const response = await fetch(downloadLink);
      if (!response.ok) {
        throw new Error("Failed to fetch the file.");
      }
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileNameWithExtension;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download the file.");
    }
  };

  const handlePaperLinkClick = (paperLink) => {
    if (paperLink) {
      window.open(paperLink, "_blank");
    } else {
      alert("No link available for this paper.");
    }
  };

  const decodedToken = JSON.parse(atob(token.split(".")[1]));
  const userName = decodedToken.userName;

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  return (
    <div className="Faculty-container">
      <header className="FacultyHeader">
        <img src="/images/Vaagdevi.png" alt="Logo" className="FacultyHeader-logo" />
        <img
          src="/images/logout-icon.png"
          alt="Logout"
          className="FacultyLogout-logo"
          onClick={handleLogout}
        />
      </header>

      <div className="Faculty-list">
        <div className="nav">
          <h1>Welcome, {userName}</h1>
          <button onClick={() => navigate("/add-paper")}>Add New Paper</button>
        </div>

        {/* Paper Type Dropdown */}
        <div className="paper-type-filter">
          <label htmlFor="paperType">Select Paper Type: </label>
          <select id="paperType" onChange={handlePaperTypeChange}>
            <option value="">All</option>
            <option value="Journal">Journal</option>
            <option value="Conference">Conference</option>
            <option value="Book Chapter">Book Chapter</option>
            <option value="Textbook">Textbook</option>
            <option value="Patent">Patent</option>
          </select>
        </div>

        <div className="FacultyTable-wrapper">
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Title of the Paper</th>
                <th>Indexing</th>
                <th>Transactions</th>
                <th>Date of Acceptance</th>
                <th>Date of Publishing</th>
                <th>DOI</th>
                <th>Volume</th>
                <th>Page Numbers</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
  {papers.length > 0 ? (
    papers.map((paper, index) => (
      <tr key={paper.paperId}>
        <td>{index + 1}</td>
        <td>
          <span
            style={{
              color: paper.paperLink ? "blue" : "black",
              cursor: paper.paperLink ? "pointer" : "default",
            }}
            onClick={() => handlePaperLinkClick(paper.paperLink)}
          >
            {paper.title}
          </span>
        </td>
        <td>{paper.indexing}</td>
        <td>{paper.transactions}</td>
        <td>{paper.dateOfAcceptance}</td>
        <td>{paper.dateOfPublishing}</td>
        <td>{paper.doi}</td>
        <td>{paper.volume}</td>
        <td>{paper.pageNumbers}</td>
        <td>
          <button
            onClick={() => handleDownload(paper.downloadLink, `${paper.title}.pdf`)}
            disabled={!paper.downloadLink}
          >
            {paper.downloadLink ? "Download" : "No PDF Available"}
          </button>
        </td>
      </tr>
    ))
  ) : (
    // ✅ Show this message when no papers are found
    <tr>
      <td colSpan="10" style={{ textAlign: "center", color: "red" }}>
        No papers found for the selected type.
      </td>
    </tr>
  )}
</tbody>
          </table>
        </div>
      </div>

      <footer className="Faculty-footer">
        <p>&copy; 2024 Vaagdevi Colleges. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default FacultyHome;