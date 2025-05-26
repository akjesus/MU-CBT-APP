const db = require("../config/database");

exports.getResults = async (req, res) => {
  try {
    // Optional query params
    const { student_id, exam_id } = req.query;

    // Start building SQL dynamically
    let sql = `
      SELECT r.*,
             s.first_name,
             s.last_name,
             s.registration_number,
             e.exam_name
      FROM results r
      JOIN students s ON r.student_id = s.id
      JOIN exams e ON r.exam_id = e.id
      WHERE 1=1
    `;
    const params = [];

    // If student_id is provided, add to WHERE clause
    if (student_id) {
      sql += " AND r.student_id = ?";
      params.push(student_id);
    }

    // If exam_id is provided, add to WHERE clause
    if (exam_id) {
      sql += " AND r.exam_id = ?";
      params.push(exam_id);
    }

    // Example ordering
    sql += " ORDER BY r.id DESC";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("getResults error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getResultsByStudent = async (req, res) => {
  try {
    const studentId = req.params.student_id;
    const [results] = await db.query(
      `SELECT exams.exam_name, courses.name AS course_name, results.score, exams.max_score_obtainable
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


exports.getResultsByExam = async (req, res) => {
    try {
      const { exam_id } = req.params;
      const { department_id } = req.query; // e.g. /exam/123?department_id=5
  
      let sql = `
        SELECT 
          r.id AS result_id,
          r.score,
          s.first_name,
          s.last_name,
          s.registration_number,
          s.level_id,
          l.name AS level_name,
          d.name AS department_name,
          e.exam_name,
          e.max_score_obtainable
        FROM results r
        JOIN students s ON r.student_id = s.id
        JOIN levels l ON s.level_id = l.id
        JOIN departments d ON s.department_id = d.id
        JOIN exams e ON r.exam_id = e.id
        WHERE r.exam_id = ?
      `;
  
      let params = [exam_id];
  
      // If department_id is present, add it to the WHERE clause
      if (department_id) {
        sql += " AND s.department_id = ?";
        params.push(department_id);
      }
  
      // Sort by department name first, then last name
      sql += " ORDER BY d.name ASC, s.last_name ASC";
  
      const [rows] = await db.query(sql, params);
  
      res.json(rows);
    } catch (err) {
      console.error("Get Results Error:", err);
      res.status(500).json({ error: err.message });
    }
  };
  