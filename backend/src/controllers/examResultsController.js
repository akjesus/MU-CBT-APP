const db = require("../config/database");

exports.getResultsByDepartment = async (req, res) => {
    try {
        const departmentId = req.params.department_id;
        const [results] = await db.query(
            `SELECT students.id AS student_id, results.id, results.exam_id, exams.exam_name, courses.name AS course_name, students.first_name, students.last_name, 
                    students.registration_number, results.score, results.status, results.start_time, results.submitted_time, 
                    results.active_duration, results.extra_time, results.grace_time, results.remark, results.comment
             FROM results
             JOIN exams ON results.exam_id = exams.id
             JOIN courses ON exams.course_id = courses.id
             JOIN students ON results.student_id = students.id
             JOIN departments ON students.department_id = departments.id
             WHERE departments.id = ?`,
            [departmentId]
        );
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getResultsByCourse = async (req, res) => {
    try {
        const courseId = req.params.course_id;
        const [results] = await db.query(
            `SELECT students.id AS student_id, results.id, results.exam_id, exams.exam_name, courses.name AS course_name, students.first_name, students.last_name, 
                    students.registration_number, results.score, results.status, results.start_time, results.submitted_time, 
                    results.active_duration, results.extra_time, results.grace_time, results.remark, results.comment
             FROM results
             JOIN exams ON results.exam_id = exams.id
             JOIN courses ON exams.course_id = courses.id
             JOIN students ON results.student_id = students.id
             WHERE courses.id = ?`,
            [courseId]
        );
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getResultsByStudent = async (req, res) => {
  try {
    const studentId = req.params.student_id;
    const [results] = await db.query(
      `SELECT results.id, results.exam_id, exams.exam_name, courses.name AS course_name, students.first_name, students.last_name, 
                    students.registration_number, results.score, results.status, results.start_time, results.submitted_time, 
                    results.active_duration, results.extra_time, results.grace_time, results.remark, results.comment
             FROM results
             JOIN exams ON results.exam_id = exams.id
             JOIN courses ON exams.course_id = courses.id
             JOIN students ON results.student_id = students.id
             WHERE results.student_id= ?`,
      [studentId]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
