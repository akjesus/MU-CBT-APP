const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const upload = require("../middleware/uploadCSV"); // Middleware for handling CSV uploads


router.get("/", questionController.getAllQuestions);
router.get("/:id", questionController.getQuestionById);
router.get("/course/:course_id", questionController.getAllQuestionsForCourse);
;
router.post("/", questionController.createQuestion); // Add to Question Bank
router.post("/:exam_id/add-to-exam", questionController.addQuestionToExam);
router.post("/bulk-upload", questionController.bulkUploadQuestions);
router.post("/:exam_id/bulk-upload-exam", upload.single("file"), questionController.bulkUploadExamQuestions);
router.put("/:id", questionController.updateQuestion);
router.delete("/:id", questionController.deleteQuestion);
router.delete("/move-from-db/:question_id", questionController.removeQuestionFromDB);

module.exports = router;