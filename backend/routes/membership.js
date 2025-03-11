const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const membershipController = require("../controllers/membershipController");

// Register Membership (requires authentication middleware)
router.post("/register", authMiddleware.authenticate, membershipController.registerMembership);

// Get memberships for a specific user
router.get("/", authMiddleware.authenticate, membershipController.getMemberships);

// Get membership by ID
router.get("/:id", authMiddleware.authenticate, membershipController.getMembershipById);

module.exports = router;