const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const multer = require("multer");
const upload = multer();

router.get("/", studentController.getAllStudents);
router.get("/:id", studentController.getStudentById);
router.post("/", studentController.createStudent);
router.post("/:id/reset-password", studentController.resetStudentPassword);
router.put("/:id", studentController.updateStudent);
router.delete("/:id", studentController.deleteStudent);
router.post("/login", studentController.studentLogin);
router.get(
  "/departments/:departmentId/levels/:levelId",
  studentController.getStudentsByDepartmentAndLevel,
);
router.post(
  "/bulk-upload",
  upload.single("file"),
  studentController.bulkUploadStudents,
);

module.exports = router;
