const express = require("express");
const router = express.Router();

const examMonitoringController = require("../controllers/examMonitoringController");
const { auth } = require("../controllers/authController");
router.use(auth);

router.get("/", examMonitoringController.getActiveExamSessions);
router.get("/:id/students", examMonitoringController.getStudents);
router.put("/update", examMonitoringController.updateExamSession);
router.post("/create", examMonitoringController.createExamMonitoringSession);
router.post("/end", examMonitoringController.endExamSession);
router.post("/session", examMonitoringController.getExamSession);
module.exports = router;
