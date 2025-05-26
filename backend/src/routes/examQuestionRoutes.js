const express = require("express");
const router = express.Router();
const examQuestionController = require("../controllers/examQuestionController");
const upload = require("../middleware/uploadCSV");

// Get questions for a specific exam
router.get("/:exam_id", examQuestionController.getQuestionsByExam);

// Add an existing question to an exam (if we want to link an already existing question)
router.post("/", examQuestionController.addQuestionToExam);

// Add a BRAND-NEW question & link it to exam
router.post("/addNew", examQuestionController.addNewQuestionAndLinkToExam);

// Bulk CSV upload of brand-new questions + link each to exam
router.post("/:exam_id/bulk-upload", examQuestionController.bulkUploadNewQuestions);

// Remove a single question from exam
router.delete("/:exam_id/:question_id", examQuestionController.removeQuestionFromExam);

// Remove all questions from exam
router.delete("/:exam_id/remove-all", examQuestionController.removeAllQuestionsFromExam);

module.exports = router;
