const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const examQuestionController = require("../controllers/examQuestionController");
const { auth } = require("../controllers/authController");

router.use(auth);
router.delete(
  "/remove/:exam_id",
  examQuestionController.removeAllQuestionsFromExam,
);
router.get("/:exam_id", examQuestionController.getQuestionsByExam);
router.post("/", examQuestionController.addQuestionToExam);
router.post("/addNew", examQuestionController.addNewQuestionAndLinkToExam);
router.post(
  "/:exam_id/bulk-upload",
  upload.single("file"),
  examQuestionController.bulkUploadNewQuestions,
);
router.delete(
  "/:exam_id/:question_id",
  examQuestionController.removeQuestionFromExam,
);

module.exports = router;
