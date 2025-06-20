const db = require("../config/database");

class ExamTaking {
    static async checkEligibility(studentId, examId) {
        const [rows] = await db.query(
            `SELECT e.id AS exam_id, e.course_id, e.level, e.exam_name, e.start_time, e.duration, e.unit_of_time, e.exam_date, e.exam_mode,
                    c.id AS course_id, c.name AS course_name, 
                    s.id AS student_id, s.level_id AS student_level 
             FROM exams e
             JOIN courses c ON e.course_id = c.id
             JOIN courses c ON exam_departments.exam_id = e.id
             JOIN students s ON (s.id = ? AND (s.level_id = e.level OR s.id IN (SELECT student_id FROM carryover_courses WHERE course_id = e.course_id)))
             WHERE e.id = ? AND NOW() >= TIMESTAMP(e.exam_date, e.start_time)`,
            [studentId, examId]
        );
        return rows.length > 0 ? rows[0] : null;
    }

    static async getExamQuestions(examId) {
        // First, check if display_question_randomly is enabled for the given exam
        const [[exam]] = await db.query(
            `SELECT display_question_randomly FROM exams WHERE id = ?`,
            [examId]
        );
    
        // Determine sorting order
        const orderClause = exam && exam.display_question_randomly ? "ORDER BY RAND()" : "ORDER BY q.id";
    
        // Fetch questions with the determined order
        const [questions] = await db.query(
            `SELECT q.id AS question_id, q.text, q.option_a, q.option_b, q.option_c, q.option_d, q.instructions, q.score_obtainable, q.question_type
             FROM exam_questions eq
             JOIN questions q ON eq.question_id = q.id
             WHERE eq.exam_id = ? ${orderClause}`,
            [examId]
        );
    
        return questions;
    }
    

    static async submitExam(studentId, examId, responses, score) {
        await db.query(
            `INSERT INTO results (student_id, exam_id, score, responses, status, start_time, submitted_time, active_duration, created_at, updated_at) 
             VALUES (?, ?, ?, ?, 'completed', NOW(), NOW(), TIMESTAMPDIFF(MINUTE, NOW(), NOW()), NOW(), NOW())`,
            [studentId, examId, score, JSON.stringify(responses)]
        );
    }

    static async hasAttemptedExam(studentId, examId) {
        const [rows] = await db.query(
            `SELECT id FROM results WHERE student_id = ? AND exam_id = ?`,
            [studentId, examId]
        );
        return rows.length > 0;
    }
}

module.exports = ExamTaking;
