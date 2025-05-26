const express = require("express");
const router = express.Router();
const departmentCourseController = require("../controllers/departmentCourseController");

router.get("/:department_id/courses", departmentCourseController.getCoursesByDepartment);

module.exports = router;
