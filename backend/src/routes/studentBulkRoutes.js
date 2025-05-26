const express = require("express");
const router = express.Router();
const studentBulkController = require("../controllers/studentBulkController");
const upload = require("../middleware/uploadCSV");

router.post("/bulk-upload", upload.single("file"), function(){return "Hello"});

module.exports = router;
