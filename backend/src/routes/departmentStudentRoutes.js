const express = require("express");
const router = express.Router();
const departmentStudentController = require("../controllers/departmentStudentController");

router.get("/:department_id/students", departmentStudentController.getStudentsByDepartment);

module.exports = router;
