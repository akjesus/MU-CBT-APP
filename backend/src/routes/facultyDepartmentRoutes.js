const express = require("express");
const router = express.Router();
const facultyDepartmentController = require("../controllers/facultyDepartmentController");

router.get("/:faculty_id/departments", facultyDepartmentController.getDepartmentsByFaculty);

module.exports = router;
