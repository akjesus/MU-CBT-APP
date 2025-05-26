const express = require("express");
const router = express.Router();
const examController = require("../controllers/examController");

router.get("/", examController.getAllExams);
router.get("/coursesession", examController.getAllExamsWithCourseSession);
router.get("/:id", examController.getExamById);
router.post("/", examController.createExam);
router.put("/:id", examController.updateExam);
router.delete("/:id", examController.deleteExam);
router.get("/:id/questions", examController.getQuestions);

module.exports = router;
