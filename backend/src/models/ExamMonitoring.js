const db = require("../config/database");

class ExamMonitoring {
  static async getActiveExamSessions(exam_id) {
    const [rows] = await db.query(
      `SELECT em.id, em.exam_id, e.exam_name, em.student_id, s.first_name, s.last_name,
              em.responses, em.responses_count, em.time_left,  em.created_at
       FROM exam_monitoring em
       JOIN exams e ON em.exam_id = e.id
       JOIN students s ON em.student_id = s.id
       WHERE em.exam_id = ?`,
      [exam_id],
    );
    return rows;
  }
  static async updateExamSession(
    student_id,
    exam_id,
    responses,
    responses_count,
    time_left,
  ) {
    await db.query(
      `UPDATE exam_monitoring
       SET responses = ?, responses_count = ?, time_left = ?, updated_at = NOW()
       WHERE student_id = ? AND exam_id = ?`,
      [
        JSON.stringify(responses),
        responses_count,
        time_left,
        student_id,
        exam_id,
      ],
    );
  }

  static async createExamMonitoringSession(
    student_id,
    exam_id,
    responses,
    responses_count,
    time_left,
  ) {
    const [result] = await db.query(
      `INSERT INTO exam_monitoring 
      (student_id, exam_id, responses, responses_count, 
      time_left, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'in_progress', NOW(), NOW())`,
      [
        student_id,
        exam_id,
        JSON.stringify(responses),
        responses_count,
        time_left,
      ],
    );
    return result.insertId;
  }

  static async endExamSession(student_id, exam_id) {
    await db.query(
      `UPDATE exam_monitoring
       SET status = 'submitted', updated_at = NOW(), 
       time_left = 0, responses = NULL
       WHERE student_id = ? AND exam_id = ?`,
      [student_id, exam_id],
    );
  }
  static async getExamSession(student_id, exam_id) {
    const [rows] = await db.query(
      `SELECT * FROM exam_monitoring
       WHERE student_id = ? AND exam_id = ? `,
      [student_id, exam_id],
    );
    return rows[0];
  }
  static async getStudents(id) {
    const [rows] = await db.query(
      `SELECT ex.id, s.first_name, s.last_name, s.other_names, s.registration_number, 
        ex.time_left, ex.responses_count, ex.status 
      from exam_monitoring ex
      join students s on ex.student_id = s.id
      where ex.exam_id = ?`,
      [id],
    );
    return rows;
  }
}

module.exports = ExamMonitoring;
