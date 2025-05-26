const db = require("../config/database");

exports.getStudentsByCourse = async (req, res) => {
    try {
        const courseId = req.params.course_id;
        const [students] = await db.query(
            `SELECT students.id, students.registration_number, students.first_name, students.last_name, 
                    students.email, students.username, students.photo, levels.name AS level_name
             FROM student_courses
             JOIN students ON student_courses.student_id = students.id
             JOIN levels ON students.level_id = levels.id
             WHERE student_courses.course_id = ?`,
            [courseId]
        );

        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
