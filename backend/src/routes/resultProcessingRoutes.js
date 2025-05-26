const express = require("express");
const router = express.Router();
const resultProcessingController = require("../controllers/resultProcessingController");

router.post("/:exam_id/student/:student_id/auto-grade", resultProcessingController.autoGradeExam);
router.get("/student/:student_id", resultProcessingController.getStudentResults);
router.get("/exam/:exam_id", resultProcessingController.getExamResults);
router.get("/department/:department_id", resultProcessingController.getDepartmentResults);
router.get("/export/exam/:exam_id", resultProcessingController.exportExamResultsToCSV);

module.exports = router;
