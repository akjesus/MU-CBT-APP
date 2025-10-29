const express = require("express");
const router = express.Router();
const examQuestionController = require("../controllers/examQuestionController");
const upload = require("../middleware/uploadCSV");

// Get questions for a specific exam
router.get("/:exam_id", examQuestionController.getQuestionsByExam);
router.post("/", examQuestionController.addQuestionToExam);
router.post("/addNew", examQuestionController.addNewQuestionAndLinkToExam);
router.post("/:exam_id/bulk-upload", examQuestionController.bulkUploadNewQuestions);
router.delete("/:exam_id/:question_id", examQuestionController.removeQuestionFromExam);
router.delete("/:exam_id/remove-all", examQuestionController.removeAllQuestionsFromExam);

module.exports = router;
