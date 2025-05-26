const express = require("express");
const router = express.Router();
const courseStudentController = require("../controllers/courseStudentController");

router.get("/:course_id/students", courseStudentController.getStudentsByCourse);

module.exports = router;
