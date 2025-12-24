const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// FR1.1: User registration
router.post("/register", authController.register);

// FR1.1: User login
router.post("/login", authController.login);

router.get("/profile", authMiddleware, authController.getProfile);

module.exports = router;
