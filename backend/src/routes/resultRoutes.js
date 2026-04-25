const express = require("express");
const router = express.Router();
const resultController = require("../controllers/resultController");
const { verifyToken } = require("../controllers/authController");

router.use(verifyToken);

router.delete("/:id", resultController.deleteResult);
router.get("/exam/:exam_id", resultController.getResultsByExam);
router.get("/", resultController.getResults);
router.get("/:student_id", resultController.getResultsByStudent);

module.exports = router;
