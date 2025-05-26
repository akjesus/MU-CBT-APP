const express = require("express");
const router = express.Router();
const studentCourseController = require("../controllers/studentCourseController");

router.get("/student/:student_id", studentCourseController.getCoursesByStudent);
router.get("/course/:course_id", studentCourseController.getStudentsByCourse);
router.post("/assign", studentCourseController.assignStudentToCourse);
router.delete("/remove", studentCourseController.removeStudentFromCourse);
router.delete("/remove-all/:student_id", studentCourseController.removeAllCoursesByStudent);

module.exports = router;
