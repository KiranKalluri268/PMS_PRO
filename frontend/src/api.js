import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const API = axios.create({
  baseURL: API_URL,
});

export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common["x-auth-token"] = token;
  } else {
    delete API.defaults.headers.common["x-auth-token"];
  }
};

// Register a new user (student)
export const registerUser = (userData) => {
  return API.post("/api/auth/register", userData);
};

// Login user (student)
export const loginUser = (userData) => {
  return API.post("/api/auth/login", userData);
};

// Upload a paper with authentication
export const uploadPaper = (data, token) => {
  return API.post("/api/papers/upload", data, {
    headers: {
      "x-auth-token": token,
      "Content-Type": "multipart/form-data",
    },
  });
};

// Fetch papers for a specific student using their email (Authenticated)
export const getPapers = (facultyId, token) => {
  return API.get(`/api/papers/faculty/${facultyId}`, {
    headers: {
      "x-auth-token": token,
    },
  });
};

// Fetch all papers (Admin only)
export const fetchAllPapers = (token) => {
  return API.get('/api/papers', {
    headers: {
      "x-auth-token": token,
    },
  });
};

// Fetch list of batches
export const fetchBatches = () => {
  return API.get('/api/batches');
};

// Fetch students by batch (Admin)
export const fetchStudentsByBatch = (batchId, token) => {
  return API.get(`/api/students/batch/${batchId}`, {
    headers: {
      "x-auth-token": token,
    },
  });
};

// Fetch papers by academic year for filtering (Admin)
export const fetchPapersByYear = (year, token) => {
  return API.get(`/api/papers/year/${year}`, {
    headers: {
      "x-auth-token": token,
    },
  });
};