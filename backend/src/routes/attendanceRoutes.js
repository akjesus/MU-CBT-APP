const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");

// Admin Dashboard Data (Protected Route)
router.get("/", attendanceController.getAttendance);
router.get("/today", attendanceController.getTodaysAttendance);
router.post("/", attendanceController.markAttendance);
router.put("/", attendanceController.signAttendance);

module.exports = router;
