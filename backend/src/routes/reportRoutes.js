const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

// GET detailed report for an exam (optional department filter)
router.get("/exam/:exam_id", reportController.getExamDetailedReport);

module.exports = router;
