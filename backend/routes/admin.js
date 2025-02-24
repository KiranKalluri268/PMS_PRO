const express = require("express");
const router = express.Router();
const { getPapersByType } = require("../controllers/adminController");
const { authenticate, adminOnly } = require("../middleware/authMiddleware");

// Route to fetch certificates for a specific batch (Admin only)
router.get("/papers", authenticate, adminOnly, getPapersByType);

module.exports = router;