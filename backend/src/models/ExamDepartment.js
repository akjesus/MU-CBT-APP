const db = require("../config/database");

class ExamDepartment {
    static async getByExamId(examId) {
        const [rows] = await db.query(
            `SELECT exam_departments.id, exam_departments.exam_id, exam_departments.department_id, 
                    departments.name AS department_name
             FROM exam_departments
             JOIN departments ON exam_departments.department_id = departments.id
             WHERE exam_departments.exam_id = ?`,
            [examId]
        );
        return rows;
    }

    static async assignDepartment(examId, departmentId) {
        const [result] = await db.query(
            "INSERT INTO exam_departments (exam_id, department_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
            [examId, departmentId]
        );
        return result.insertId;
    }

    static async removeDepartment(examId, departmentId) {
        await db.query("DELETE FROM exam_departments WHERE exam_id = ? AND department_id = ?", [examId, departmentId]);
    }

    static async removeAllByExam(examId) {
        await db.query("DELETE FROM exam_departments WHERE exam_id = ?", [examId]);
    }
}

module.exports = ExamDepartment;
