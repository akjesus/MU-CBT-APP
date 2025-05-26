const express = require("express");
const router = express.Router();
const examResultsController = require("../controllers/examResultsController");

router.get("/department/:department_id", examResultsController.getResultsByDepartment);
router.get("/course/:course_id", examResultsController.getResultsByCourse);

module.exports = router;
