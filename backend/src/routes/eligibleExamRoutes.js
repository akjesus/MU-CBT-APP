const express = require("express");
const router = express.Router();
const eligibleExamController = require("../controllers/eligibleExamController");

router.get("/student/:student_id", eligibleExamController.getEligibleExams);

module.exports = router;
