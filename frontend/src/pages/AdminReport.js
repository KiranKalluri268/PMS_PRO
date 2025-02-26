import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import "../adminreport.css";

const AdminReport = () => {
  const { paperType } = useParams();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    let isFetching = false;

    const fetchPapers = async () => {
      console.log(`Fetching ${paperType} papers...`);

      if (isFetching) return;
      isFetching = true;
      setLoading(true);
      let nextKey = lastEvaluatedKey;

      try {
        do {
          const response = await axios.get(`/api/admin/papers`, {
            params: {
              type: paperType,
              lastEvaluatedKey: nextKey ? JSON.stringify(nextKey) : undefined,
            },
            headers: { "x-auth-token": localStorage.getItem("authToken") },
          });

          console.log("API Response:", response.data);

          const newPapers = response.data.papers || [];
          if (newPapers.length === 0 && !response.data.lastEvaluatedKey) {
            console.log("No more papers to fetch.");
            setLastEvaluatedKey(null);
            break;
          }

          setPapers((prevPapers) => [...prevPapers, ...newPapers]);

          nextKey = response.data.lastEvaluatedKey || null;
          setLastEvaluatedKey(nextKey);
        } while (nextKey);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          alert("Session expired. Please log in again.");
          localStorage.removeItem("authToken");
          navigate("/");
        } else {
          console.error("Error fetching papers:", error);
        }
      } finally {
        setLoading(false);
        isFetching = false;
      }
    };

    fetchPapers();
  }, [paperType, navigate]);

  // Define different column structures for each paper type
  const tableHeaders = {
    Journal: { "Title": "title", "Authors": "authors", "Indexing": "indexing", "Transactions": "transactions", "DOI": "doi", "Date of Acceptance": "dateOfAcceptance", "Date of Publishing": "dateOfPublishing", "Volume": "volume", "Page Numbers": "pageNumbers" },
    Conference: { "Title": "title", "Authors": "authors", "Indexing": "indexing", "Transactions": "transactions", "Year of Conference": "yearOfConference", "Date of Acceptance": "dateOfAcceptance", "Date of Publishing": "dateOfPublishing", "DOI": "doi" },
    "Book Chapter": { "Title": "title", "Indexing": "indexing", "Transactions": "transactions", "Date of Acceptance": "dateOfAcceptance", "Date of Publishing": "dateOfPublishing", "DOI": "doi" },
    Textbook: { "Title": "title", "Authors": "authors", "Publisher": "nameOfPublisher", "Indexing": "indexing", "Transactions": "transactions", "Date of Acceptance": "dateOfAcceptance", "Date of Publishing": "dateOfPublishing", "DOI": "doi", "Total Pages": "pageNumbers" },
    Patent: { "Application Number": "patentAppNum", "Title": "title", "Authors": "authors", "Field of Study": "filedOfStudy", "Date of Publishing": "dateOfPublishing", "Filed Date": "filingDate", "Granted Date": "grantDate" },
  };

  const selectedHeaders = tableHeaders[paperType] || {};

  const handleDownload = async (downloadLink, fileName) => {
    if (!downloadLink) {
      alert("No download link available.");
      return;
    }

    const fileNameWithExtension = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  
    try {
      const response = await fetch(downloadLink);
      if (!response.ok) {
        throw new Error('Failed to fetch the file.');
      }
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileNameWithExtension;
  
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download the file.');
    }
  };

  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      papers.map((paper, index) => {
        let rowData = { SNo: index + 1 };
        Object.entries(selectedHeaders).forEach(([column, field]) => {
          rowData[column] = paper[field] || "N/A";
        });
        return rowData;
      })
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${paperType}_Papers`);

    XLSX.writeFile(wb, `${paperType}_Papers_Report.xlsx`);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  return (
    <div className="admin-report-container">
      <header className="AdminReportHeader">
        <img src="/images/Vaagdevi.png" alt="Logo" className="AdminReportHeader-logo" />
        <img
          src="/images/logout-icon.png"
          alt="Logout"
          className="AdminReportLogout-logo"
          onClick={handleLogout}
        />
      </header>

      <div className="report-list">
        <h2 className="batch-title">Papers for {paperType}</h2>

        <button className="download-report-btn" onClick={handleDownloadExcel}>
          Download Report as Excel
        </button>

        {papers.length > 0 ? (
          <div className="FacultyTable-wrapper">
            <table>
              <thead>
                <tr>
                  <th>S.No</th>
                  {Object.keys(selectedHeaders).map((column, index) => (
                    <th key={index}>{column}</th>
                  ))}
                  <th>Download</th>
                </tr>
              </thead>
              <tbody>
                {papers.map((paper, index) => (
                  <tr key={paper.paperId}>
                    <td>{index + 1}</td>
                    {Object.values(selectedHeaders).map((field, i) => (
                      <td key={i}>
                        {field === "title" ? (
                          <span
                            style={{
                              color: paper.paperLink ? "blue" : "black",
                              cursor: paper.paperLink ? "pointer" : "default",
                            }}
                            onClick={() => paper.paperLink && window.open(paper.paperLink, "_blank")}
                          >
                            {paper[field] || ""}
                          </span>
                        ) : (
                          paper[field] || ""
                        )}
                      </td>
                    ))}
                    <td>
                      <button onClick={() => handleDownload(paper.downloadLink, paper.title)} disabled={!paper.downloadLink}>
                        {paper.downloadLink ? "Download" : "No PDF Available"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !loading && <p>No papers found for the selected type.</p>}

        {loading && <p>Loading papers...</p>}
      </div>

      <footer className="Adminreport-footer">
        <p>&copy; 2024 Vaagdevi Colleges. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default AdminReport;