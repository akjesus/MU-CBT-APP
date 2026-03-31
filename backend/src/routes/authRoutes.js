// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.login);
router.post("/register", authController.createAdmin); // Only for initial setup
router.post("/logout", authController.adminLogout);
router.post("/reset-password", authController.resetpassword);

module.exports = router;
