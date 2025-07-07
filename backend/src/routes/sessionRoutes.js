const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/sessionController");

router.get("/", sessionController.getAllSessions);
router.get("/active", sessionController.getActiveSession);
router.get("/:id", sessionController.getSessionById);
router.post("/", sessionController.createSession);
router.put("/:id", sessionController.updateSession);
router.delete("/:id", sessionController.deleteSession);
router.patch("/:id/activate", sessionController.activateSession);

module.exports = router;
