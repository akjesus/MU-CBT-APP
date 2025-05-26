const StudentBulkUpload = require("../models/StudentBulkUpload");

exports.bulkUploadStudents = async (req, res) => {
    res.json(["Hello"]);
    /*
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const result = await StudentBulkUpload.importStudents(req.file.path);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    */
};
