import React, { useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import FacultyHome from "./pages/FacultyHome";
import AdminHome from "./pages/AdminHome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminReport from './pages/AdminReport';
import VerifyEmail from './pages/EmailVerification';
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AddPaper from './pages/AddPaper';
import EditPaper from './pages/EditPaper';

// Set the global baseURL for all Axios requests
axios.defaults.baseURL = process.env.REACT_APP_API_URL; // or use an environment variable for flexibility

function App() {
  useEffect(() => {
    // You can add other global configurations or logic here if needed
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/faculty-home/:id" element={<FacultyHome />} />
        <Route path="/admin-home" element={<AdminHome />} />
        <Route path="/add-paper" element={<AddPaper />} />
        <Route path="/edit-paper/:id" element={<EditPaper/>} />
        <Route path="/admin-report/:batchYear" element={<AdminReport/>} />
        <Route path="/verify-email" element={<VerifyEmail/>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;