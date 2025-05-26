// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.adminLogin);
router.post("/register", authController.createAdmin); // Only for initial setup
router.post("/logout", authController.adminLogout);

module.exports = router;
