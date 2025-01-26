import React, { useEffect, useState } from 'react';
import { getPapers } from '../api';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import '../facultyhome.css';

const FacultyHome = () => {
  const { id: facultyId } = useParams();
  const [papers, setPapers] = useState([]); // Updated to papers
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');
  console.log("token in facultyhome:", token);
  console.log("UserId",facultyId)

  useEffect(() => {
    if (!token) {
      navigate('/');
    }
  }, [navigate, token]);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const res = await getPapers(facultyId, token);
        const sortedPapers = (res.data || []).sort(
          (a, b) => new Date(a.publishDate) - new Date(b.publishDate)
        );
        setPapers(sortedPapers);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          alert("Session expired. Please log in again.");
          localStorage.removeItem("authToken");
          navigate("/");
        } else {
          console.error('Error fetching papers:', error);
        }
      }
    };
    fetchPapers();
  }, [facultyId, token, navigate]);

  const handleDownload = async (downloadLink, fileName) => {
    if (!downloadLink) {
      alert("No download link available.");
      return;
    }
  
    // Ensure the filename ends with .pdf
    const fileNameWithExtension = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  
    try {
      // Fetch the file as a blob
      const response = await fetch(downloadLink);
      if (!response.ok) {
        throw new Error('Failed to fetch the file.');
      }
      const blob = await response.blob();
  
      // Create a download link with the blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileNameWithExtension;
  
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      // Revoke the object URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download the file.');
    }
  };

  const handlePaperLinkClick = (paperLink) => {
    if (paperLink) {
      window.open(paperLink, '_blank');
    } else {
      alert('No link available for this paper.');
    }
  };

  const decodedToken = JSON.parse(atob(token.split('.')[1]));
  const userName = decodedToken.userName;

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/';
  };

  return (
    <div className="Faculty-container">
      <header className="FacultyHeader">
        <img src="/images/Vaagdevi.png" alt="Logo" className="FacultyHeader-logo" />
        <img
          src="/images/logout-icon.png"
          alt="Logout"
          className='FacultyLogout-logo'
          onClick={handleLogout}
        />
      </header>

      <div className="list">
        <div className="nav">
          <h1>Welcome, {userName}</h1>
          <button onClick={() => navigate('/add-paper')}>Add New Paper</button>
        </div>

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
              papers.map((paper, index) => {
                const publishDate = new Date(paper.publishDate).toLocaleDateString();
                const acceptDate = new Date(paper.acceptDate).toLocaleDateString();

                return (
                  <tr key={paper.paperId}>
                    <td>{index + 1}</td>
                    <td>
                      <span
                        style={{ color: paper.paperLink ? 'blue' : 'black', cursor: paper.paperLink ? 'pointer' : 'default' }}
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
                        {paper.downloadLink ? 'Download' : 'No PDF Available'}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9">No Papers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="footer">
        <p>&copy; 2024 Vaagdevi Colleges. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default FacultyHome;
