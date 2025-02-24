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
  const paperFields = {
    Journal: ["title", "indexing", "transactions", "dateOfAcceptance", "dateOfPublishing", "doi", "volume", "pageNumbers", "paperLink", "onlineLink"],
    Conference: ["title", "indexing", "transactions", "dateOfAcceptance", "dateOfPublishing", "doi", "conferenceName", "paperLink", "onlineLink"],
    "Book Chapter": ["title", "indexing", "transactions", "dateOfAcceptance", "dateOfPublishing", "doi", "bookTitle", "paperLink", "onlineLink"],
    Textbook: ["title", "indexing", "transactions", "dateOfAcceptance", "dateOfPublishing", "doi", "bookTitle", "paperLink", "onlineLink"],
    Patent: ["title", "filingDate", "dateOfPublishing", "GrantDate", "paperLink", "onlineLink"]
  };

  // Get column names dynamically based on paperType
  const columns = paperFields[paperType] || [];

  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      papers.map((paper, index) => {
        let rowData = { SNo: index + 1 };
        columns.forEach((col) => {
          rowData[col] = paper[col.toLowerCase().replace(/\s+/g, "")] || "N/A";
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
          <div className="table-wrapper">
            <table className="report-table">
              <thead>
      <tr>
        {columns.map((col) => (
          <th key={col}>{col.replace(/([A-Z])/g, " $1").trim()}</th> // Format field names
        ))}
      </tr>
    </thead>
    <tbody>
      {papers.map((row, index) => (
        <tr key={index}>
          {columns.map((col) => (
            <td key={col}>{row[col] || "-"}</td> // Show data or fallback
          ))}
        </tr>
      ))}
    </tbody>
            </table>
          </div>
        ) : !loading && <p>No papers found for this type.</p>}

        {loading && <p>Loading papers...</p>}
      </div>

      <footer className="Adminreport-footer">
        <p>&copy; 2024 Vaagdevi Colleges. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default AdminReport;