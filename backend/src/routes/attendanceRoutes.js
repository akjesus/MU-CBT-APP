const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");

// Admin Dashboard Data (Protected Route)
router.get("/", attendanceController.getAttendance);

module.exports = router;
