const express = require("express");
const router = express.Router();
const departmentStaffController = require("../controllers/departmentStaffController");

router.get("/:department_id/staffs", departmentStaffController.getStaffsByDepartment);

module.exports = router;
