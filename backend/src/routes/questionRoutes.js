const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const multer = require("multer");
const upload = multer();
const { auth } = require("../controllers/authController");

router.use(auth);
router.get("/", questionController.getAllQuestions);
router.get("/:id", questionController.getQuestionById);
router.get("/course/:course_id", questionController.getAllQuestionsForCourse);
router.post(
  "/:exam_id/add-to-exam",
  upload.single("file"),
  questionController.createQuestionAndAddtoExam,
);
router.post("/bulk-upload", questionController.bulkUploadQuestions);
router.post(
  "/:exam_id/bulk-upload-exam",
  upload.single("file"),
  questionController.bulkUploadExamQuestions,
);
router.put("/:question_id", upload.single("file"), questionController.updateQuestion);
router.delete("/:question_id", questionController.deleteQuestion);
router.delete(
  "/move-from-db/:question_id",
  questionController.removeQuestionFromDB,
);

module.exports = router;
