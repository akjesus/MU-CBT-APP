const db = require("../config/database");

exports.getStaffsByDepartment = async (req, res) => {
    try {
        const departmentId = req.params.department_id;
        const [staffs] = await db.query("SELECT * FROM staff WHERE department_id = ?", [departmentId]);
        res.json(staffs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
