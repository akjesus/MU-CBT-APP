const db = require("../config/database");

class ExamMonitoring {
  static async getActiveExamSessions(exam_id) {
    const [rows] = await db.query(
      `SELECT em.id, em.exam_id, e.exam_name, em.matriculation_number, s.first_name, s.last_name,
              em.responses, em.time_left,  em.created_at
       FROM exam_monitoring em
       JOIN exams e ON em.exam_id = e.id
       JOIN students s ON em.matriculation_number = s.matriculation_number
       WHERE em.exam_id = ?`,
      [exam_id],
    );
    return rows;
  }
  static async updateExamSession(
    matriculation_number,
    exam_id,
    responses,
    time_left,
  ) {
    await db.query(
      `UPDATE exam_monitoring
       SET responses = ?, time_left = ?, updated_at = NOW()
       WHERE matriculation_number = ? AND exam_id = ?`,
      [JSON.stringify(responses), time_left, matriculation_number, exam_id],
    );
  }

  static async createExamMonitoringSession(matriculation_number, exam_id, responses, time_left ) {
    const [result] = await db.query(
      `INSERT INTO exam_monitoring (matriculation_number, exam_id, responses, time_left, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'in_progress', NOW(), NOW())`,
      [matriculation_number, exam_id, JSON.stringify(responses), time_left],
    );
    return result.insertId;
  }

  static async endExamSession(matriculation_number, exam_id) {
    await db.query(
      `UPDATE exam_monitoring
       SET status = 'submitted', updated_at = NOW()
       WHERE matriculation_number = ? AND exam_id = ?`,
      [matriculation_number, exam_id],
    );
  }
  static async getExamSession(matriculation_number, exam_id) {
    const [rows] = await db.query(
      `SELECT * FROM exam_monitoring
       WHERE matriculation_number = ? AND exam_id = ? `,
      [matriculation_number, exam_id],
    );
    return rows[0];
  }
}

module.exports = ExamMonitoring;
