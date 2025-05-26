// routes/examExaminerRoutes.js
const express = require("express");
const router = express.Router();
const examExaminerController = require("../controllers/examExaminerController");

// Get all examiners for a particular exam
router.get("/exam/:exam_id", examExaminerController.getExaminersByExam);

// Get all exams assigned to a particular examiner
router.get("/staff/:staff_id", examExaminerController.getExamsByExaminer);

// Assign an examiner to an exam
router.post("/assign", examExaminerController.assignExaminerToExam);

// Assign multiple examiners to an exam
router.post("/:exam_id/assign-multiple", examExaminerController.assignMultipleExaminers);

// Remove a particular examiner from an exam
router.delete("/remove", examExaminerController.removeExaminerFromExam);

// Remove all examiners from an exam
router.delete("/remove-all/:exam_id", examExaminerController.removeAllExaminersFromExam);

module.exports = router;
