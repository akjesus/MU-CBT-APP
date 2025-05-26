const db = require("../config/database");

exports.getCoursesByDepartment = async (req, res) => {
    try {
        const departmentId = req.params.department_id;
        const [courses] = await db.query("SELECT * FROM courses WHERE department_id = ?", [departmentId]);
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
