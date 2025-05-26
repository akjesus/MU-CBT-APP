const express = require("express");
const router = express.Router();
const levelController = require("../controllers/levelController");

router.get("/", levelController.getAllLevels);
router.get("/:id", levelController.getLevelById);
router.post("/", levelController.createLevel);
router.put("/:id", levelController.updateLevel);
router.delete("/:id", levelController.deleteLevel);

module.exports = router;
