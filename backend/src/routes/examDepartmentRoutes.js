const express = require("express");
const router = express.Router();
const examDepartmentController = require("../controllers/examDepartmentController");

router.get("/:exam_id/departments", examDepartmentController.getDepartmentsByExam);
router.post("/:exam_id/assign", examDepartmentController.assignDepartment);
router.post("/:exam_id/assign-multiple", examDepartmentController.assignMultipleDepartments);
router.delete("/:exam_id/remove/:department_id", examDepartmentController.removeDepartment);
router.delete("/:exam_id/remove-all", examDepartmentController.removeAllByExam);

module.exports = router;
