const db = require("../config/database");

exports.getExamsByCourse = async (req, res) => {
    try {
        const courseId = req.params.course_id;
        const [exams] = await db.query(
            `SELECT * FROM exams WHERE course_id = ?`,
            [courseId]
        );

        res.json(exams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
