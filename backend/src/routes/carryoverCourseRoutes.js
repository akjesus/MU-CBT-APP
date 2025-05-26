const express = require("express");
const router = express.Router();
const carryoverCourseController = require("../controllers/carryoverCourseController");

router.get("/student/:student_id", carryoverCourseController.getCarryoverCoursesByStudent);
router.get("/course/:course_id", carryoverCourseController.getStudentsByCarryoverCourse);
router.post("/assign", carryoverCourseController.assignCarryoverCourse);
router.delete("/remove", carryoverCourseController.removeCarryoverCourse);
router.delete("/remove-all/:student_id", carryoverCourseController.removeAllCarryoversByStudent);

module.exports = router;
