const express = require("express");
const router = express.Router();
const resultController = require("../controllers/resultController");

// GET results for an exam, optionally filtered by department
// e.g. GET /api/results/exam/123?department_id=5
router.get("/exam/:exam_id", resultController.getResultsByExam);
router.get("/", resultController.getResults);
router.get("/:student_id", resultController.getResultsByStudent);
module.exports = router;
