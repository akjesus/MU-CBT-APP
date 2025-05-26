const express = require("express");
const router = express.Router();
const examTakingController = require("../controllers/examTakingController");

router.get("/:exam_id/student/:student_id/eligibility", examTakingController.checkEligibility);
router.get("/:exam_id/questions", examTakingController.getExamQuestions);
router.post("/:exam_id/student/:student_id/submit", examTakingController.submitExam);

module.exports = router;
