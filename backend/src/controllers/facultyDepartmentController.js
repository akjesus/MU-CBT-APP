const db = require("../config/database");

exports.getDepartmentsByFaculty = async (req, res) => {
    try {
        const facultyId = req.params.faculty_id;
        const [departments] = await db.query("SELECT * FROM departments WHERE faculty_id = ?", [facultyId]);
        res.json(departments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
