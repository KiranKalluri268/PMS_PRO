import React, { useEffect, useState } from "react";
import { getPapers } from "../api";
import { useNavigate, useParams } from "react-router-dom";
import "../facultyhome.css";

const FacultyHome = () => {
  const { id: facultyId } = useParams();
  const [papers, setPapers] = useState([]);
  const [selectedPaperType, setSelectedPaperType] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

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

  const handleEdit = (paperId) => {
    navigate(`/edit-paper/${paperId}`);
  };

  const decodedToken = JSON.parse(atob(token.split(".")[1]));
  const userName = decodedToken.userName;

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  // 🔹 Field mappings to match API response keys
  const defaultHeader = {
    All : {
      "Title": "title",
      "Authors": "authors",
      "Indexing": "indexing",
      "Transactions": "transactions",
      "DOI": "doi",
      "Date of Acceptance": "dateOfAcceptance",
      "Date of Publishing": "dateOfPublishing",
      "Volume": "volume",
      "Page Numbers": "pageNumbers",
      "Year of Conference": "yearOfConference",
      "Book Title": "bookTitle",
      "Publisher": "nameOfPublisher",
      "Total Pages": "pageNumbers",
      "Application Number": "patentAppNum",
      "Field of Study": "filedOfStudy",
      "Filed Date": "filingDate",
      "Granted Date": "grantDate",
    },
  };

  const tableHeaders = {
    Journal: {
      "Title": "title",
      "Authors": "authors",
      "Indexing": "indexing",
      "Transactions": "transactions",
      "DOI": "doi",
      "Date of Acceptance": "dateOfAcceptance",
      "Date of Publishing": "dateOfPublishing",
      "Volume": "volume",
      "Page Numbers": "pageNumbers",
    },
    Conference: {
      "Title": "title",
      "Authors": "authors",
      "Indexing": "indexing",
      "Transactions": "transactions",
      "Year of Conference": "yearOfConference",
      "Date of Acceptance": "dateOfAcceptance",
      "Date of Publishing": "dateOfPublishing",
      "DOI": "doi",
    },
    "Book Chapter": {
      "Title": "title",
      "Indexing": "indexing",
      "Transactions": "transactions",
      "Date of Acceptance": "dateOfAcceptance",
      "Date of Publishing": "dateOfPublishing",
      "DOI": "doi",
    },
    Textbook: {
      "Title": "title",
      "Authors": "authors",
      "Publisher": "nameOfPublisher",
      "Indexing": "indexing",
      "Transactions": "transactions",
      "Date of Acceptance": "dateOfAcceptance",
      "Date of Publishing": "dateOfPublishing",
      "DOI": "doi",
      "Total Pages": "pageNumbers",
    },
    Patent: {
      "Application Number": "patentAppNum",
      "Title": "title",
      "Authors": "authors",
      "Field of Study": "filedOfStudy",
      "Date of Publishing": "dateOfPublishing",
      "Filed Date": "filingDate",
      "Granted Date": "grantDate",
    },
  };

  const selectedHeaders = selectedPaperType
    ? tableHeaders[selectedPaperType] || {}
    : defaultHeader["All"];

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
            {Object.keys(tableHeaders).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="FacultyTable-wrapper">
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                {Object.keys(selectedHeaders).map((column, index) => (
                  <th key={index}>{column}</th>
                ))}
                <th>Actions</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              {papers.length > 0 ? (
                papers.map((paper, index) => (
                  <tr key={paper.paperId}>
                    {/* ✅ Fixed S.No Column */}
                    <td>{index + 1}</td>

                    {/* ✅ Correctly Mapped Columns */}
                    {Object.values(selectedHeaders).map((field, i) => (
                      <td key={i}>
                        {field === "title" ? (
                          <span
                            style={{
                              color: paper.paperLink ? "blue" : "black",
                              cursor: paper.paperLink ? "pointer" : "default",
                            }}
                            onClick={() => handlePaperLinkClick(paper.paperLink)}
                          >
                            {paper[field] || ""}
                          </span>
                        ) : (
                          paper[field] || ""
                        )}
                      </td>
                    ))}

                    {/* ✅ Actions Column */}
                    <td>
                      <button onClick={() => handleEdit(paper.paperId)}>Edit</button>
                    </td>

                    {/* ✅ Download Column */}
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
                <tr>
                  <td colSpan={Object.keys(selectedHeaders).length + 3} style={{ textAlign: "center", color: "red" }}>
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