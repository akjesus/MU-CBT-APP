const db = require("../config/database");

exports.getResultsByStudent = async (req, res) => {
    try {
        const studentId = req.params.student_id;
        const [results] = await db.query(
            `SELECT results.id, results.exam_id, exams.exam_name, exams.course_id, courses.name AS course_name,
                exams.semester,exams.level,exams.max_score_obtainable,exams.exam_mode,exams.start_time,exams.duration,exams.unit_of_time,
                    results.score, results.status, results.start_time, results.submitted_time, results.active_duration,
                    results.extra_time, results.grace_time, results.remark, results.comment, results.created_at, results.updated_at
             FROM results
             JOIN exams ON results.exam_id = exams.id
             JOIN courses ON exams.course_id = courses.id
             WHERE results.student_id = ?`,
            [studentId]
        );

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
