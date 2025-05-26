const db = require("../config/database");

exports.getStudentsByDepartment = async (req, res) => {
    try {
        const departmentId = req.params.department_id;
        const [students] = await db.query(
            `SELECT students.id, students.registration_number, students.first_name, students.last_name, 
                    students.email, students.username, students.photo, levels.name AS level_name
             FROM students
             JOIN levels ON students.level_id = levels.id
             WHERE students.department_id = ?`,
            [departmentId]
        );

        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
