// models/ExamExaminer.js
const db = require("../config/database");

class ExamExaminer {
  static async getExaminersByExam(examId) {
    const [rows] = await db.query(
      `SELECT ee.id, ee.staff_id, s.first_name, s.last_name, s.role,
              ee.exam_id, e.exam_name
       FROM exam_examiners ee
       JOIN staff s ON ee.staff_id = s.id
       JOIN exams e ON ee.exam_id = e.id
       WHERE ee.exam_id = ?`,
      [examId]
    );
    return rows;
  }

  static async getExamsByExaminer(staffId) {
    const [rows] = await db.query(
      `SELECT ee.id, ee.exam_id, e.exam_name, ee.staff_id, s.first_name, s.last_name
       FROM exam_examiners ee
       JOIN exams e ON ee.exam_id = e.id
       JOIN staff s ON ee.staff_id = s.id
       WHERE ee.staff_id = ?`,
      [staffId]
    );
    return rows;
  }

  static async assignExaminerToExam(staffId, examId) {
    // Optional: Check staff role in code or rely on your app logic
    // to ensure staff is 'Examiner'
    // e.g.: SELECT role FROM staff WHERE id=staffId
    const [[{ role }]] = await db.query("SELECT role FROM staff WHERE id = ?", [staffId]);
    if (role !== "Examiner") {
      throw new Error("Staff is not assigned as 'Examiner'.");
    }

    const [result] = await db.query(
      `INSERT INTO exam_examiners (staff_id, exam_id, created_at, updated_at)
       VALUES (?, ?, NOW(), NOW())`,
      [staffId, examId]
    );
    return result.insertId;
  }

  static async removeExaminerFromExam(staffId, examId) {
    await db.query(
      `DELETE FROM exam_examiners
       WHERE staff_id = ? AND exam_id = ?`,
      [staffId, examId]
    );
  }

  static async removeAllExaminersFromExam(examId) {
    await db.query(`DELETE FROM exam_examiners WHERE exam_id = ?`, [examId]);
  }
}

module.exports = ExamExaminer;
