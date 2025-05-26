const express = require("express");
const router = express.Router();
const studentResultController = require("../controllers/studentResultController");

router.get("/:student_id/results", studentResultController.getResultsByStudent);

module.exports = router;
