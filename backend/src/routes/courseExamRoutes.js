const express = require("express");
const router = express.Router();
const courseExamController = require("../controllers/courseExamController");

router.get("/:course_id/exams", courseExamController.getExamsByCourse);

module.exports = router;
