const db = require("../config/database");

class Exam {
  static async getAll() {
    const [rows] = await db.query(
      `SELECT exams.id, exams.course_id, courses.name AS course_name,courses.code AS course_code, 
                    exams.session_id, sessions.name AS session_name, levels.name AS course_level,
                    exams.semester, exams.level, exams.exam_name, 
                    exams.max_score_obtainable, exams.exam_mode, exams.server_time,
                    exams.start_time, exams.duration, exams.unit_of_time, exams.active,
                    exams.exam_date, exams.instruction, exams.venue, exams.display_question_randomly, 
                    exams.allow_multiple_attempts, exams.unordered_answering, 
                    exams.created_at, exams.updated_at, 
                    GROUP_CONCAT(DISTINCT departments.name ORDER BY departments.name SEPARATOR ', ') AS departments
             FROM exams
             JOIN courses ON exams.course_id = courses.id
             JOIN levels ON courses.level_id = levels.id
             JOIN sessions ON exams.session_id = sessions.id
             LEFT JOIN exam_departments ON exams.id = exam_departments.exam_id
             LEFT JOIN departments ON exam_departments.department_id = departments.id
             GROUP BY exams.id, courses.name, sessions.name
             ORDER BY exams.start_time DESC`
    );
    return rows;
  }

  static async getAllWithDepartments() {
    const sql = `
            SELECT 
                e.*, 
                c.name AS course_name, 
                s.name AS session_name,
                GROUP_CONCAT(d.name ORDER BY d.name SEPARATOR ', ') AS departments
            FROM exams e
            LEFT JOIN courses c ON e.course_id = c.id
            LEFT JOIN sessions s ON e.session_id = s.id
            LEFT JOIN exam_departments ed ON e.id = ed.exam_id
            LEFT JOIN departments d ON ed.department_id = d.id
            GROUP BY e.id, c.name, s.name
            ORDER BY e.start_time DESC;
        `;

    const [rows] = await db.query(sql);
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query(
      `SELECT exams.*, courses.name AS course_name, sessions.name AS session_name 
             FROM exams
             JOIN courses ON exams.course_id = courses.id
             JOIN sessions ON exams.session_id = sessions.id
             WHERE exams.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async getExamQuestions(id) {
    const [questions] = await db.query(
      `SELECT q.id AS id, q.text, q.option_a, q.option_b, q.option_c, q.option_d, q.score_obtainable,
                q.correct_option, q.difficulty_level, q.question_type, q.file, q.answers
                FROM exam_questions eq
                JOIN questions q ON eq.question_id = q.id
                WHERE eq.exam_id = ?`,
      [id]
    );
    return questions;
  }
  static async activateExam(id) {
    await db.query(`UPDATE exams SET active = 1 - active WHERE id = ?`, [id]);
    return;
  }

  static async create(data) {
    const [result] = await db.query(
      `INSERT INTO exams (course_id, session_id, semester, level, exam_name, max_score_obtainable, 
                           exam_mode, start_time, duration, unit_of_time, exam_date, instruction, venue, 
                           server_time, display_question_randomly, allow_multiple_attempts, unordered_answering, 
                          created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        data.course_id,
        data.session_id,
        data.semester,
        data.level,
        data.exam_name,
        data.max_score_obtainable,
        data.exam_mode,
        data.start_time,
        data.duration,
        data.unit_of_time,
        data.exam_date,
        data.instruction,
        data.venue,
        data.server_time,
        data.display_question_randomly,
        data.allow_multiple_attempts,
        data.unordered_answering,
      ]
    );
    return result.insertId;
  }
  static async update(id, data) {
    await db.query(
      `UPDATE exams SET course_id = ?, session_id = ?, semester = ?, level = ?, exam_name = ?, 
                             max_score_obtainable = ?, exam_mode = ?, start_time = ?, duration = ?, 
                             unit_of_time = ?, exam_date = ?, instruction = ?, venue = ?,
                             show_max_scores = ?, display_question_randomly = ?, allow_multiple_attempts = ?,              
                             unordered_answering = ?, updated_at = NOW() 
             WHERE id = ?`,
      [
        data.course_id,
        data.session_id,
        data.semester,
        data.level,
        data.exam_name,
        data.max_score_obtainable,
        data.exam_mode,
        data.start_time,
        data.duration,
        data.unit_of_time,
        data.exam_date,
        data.instruction,
        data.venue,
        data.display_question_randomly,
        data.allow_multiple_attempts,
        data.unordered_answering,
        id,
      ]
    );
  }
  static async updateNewExam(id, columns, values) {
    if (columns.length === 0) {
      return { message: "No data to update" };
    }

    const query = columns.map((columns) => `${columns} = ?`).join(", ");
    const newValues = values.map((values) => values);
    newValues.push(parseInt(id));

    const sql = `UPDATE exams SET ${query} WHERE id = ?`;
    try {
      const [results] = await db.query(sql, newValues);
      console.log(`Updated row with id ${id}`);
    } catch (err) {
      console.error(err);
    }
  }

  static async delete(id) {
    await db.query("DELETE FROM exams WHERE id = ?", [id]);
  }
}
module.exports = Exam;
