const express = require("express");
const router = express.Router();
const blocklistController = require("../controllers/blocklistController");

// Admin Dashboard Data (Protected Route)
router.get("/", blocklistController.getBlockList);
router.post("/bulk-upload", blocklistController.bulkUploadBlockList);
router.get("/:id", blocklistController.getBlockListById);
router.delete("/:id", blocklistController.removeFromBlockList);
router.post("/:exam_id", blocklistController.addStudentToBlockList);


module.exports = router;


