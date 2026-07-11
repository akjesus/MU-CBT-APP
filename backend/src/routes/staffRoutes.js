const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");
const { verifyToken } = require("../controllers/authController");

router.get("/", staffController.getAllStaff);
router.get("/:id", staffController.getStaffById);
router.patch("/:id", staffController.resetPassword);
router.post("/", staffController.createStaff);
router.put("/:id", staffController.updateStaff);
router.delete("/:id", staffController.deleteStaff);
router.post("/login", staffController.staffLogin);
router.post("/change-password", verifyToken, staffController.changePassword);

module.exports = router;
