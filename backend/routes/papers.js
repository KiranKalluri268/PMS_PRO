const express = require("express");
const {
  uploadPaper,
  getPapersByFaculty,
  getPaperById,
  updatePaper,
  deletePaper,
} = require("../controllers/paperController");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({ storage });
const router = express.Router();

// Route to upload a certificate PDF
router.post("/upload", authMiddleware.authenticate, upload.single("pdf"), uploadPaper);

// Route to get certificates by student ID
router.get("/faculty/:id", authMiddleware.authenticate, (req, res, next) => {
  console.log("API HIT: /faculty/:id", req.params.id, req.query.paperType);
  next();
}, getPapersByFaculty);

// Route to get a certificate by ID
router.get("/papers/:id", getPaperById);

// Route to update a certificate
router.put("/papers/:id", upload.single("pdf"), updatePaper);

// Route to delete a certificate by ID
router.delete("/papers/:id", authMiddleware.authenticate, deletePaper);

module.exports = router,upload;
