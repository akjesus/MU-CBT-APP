const db = require("../config/database");
const fs = require("fs");
const { parse } = require("json2csv");

class ResultProcessing {
    static async autoGradeExam(studentId, examId, responses) {
        // Fetch correct answers
        const [questions] = await db.query(
            `SELECT id, correct_option, score_obtainable FROM questions 
             WHERE id IN (SELECT question_id FROM exam_questions WHERE exam_id = ?)`,
            [examId]
        );

        let totalScore = 0;
        questions.forEach(q => {
            if (responses[q.id] && responses[q.id] === q.correct_option) {
                totalScore += q.score_obtainable;
            }
        });

        // Store result in database
        await db.query(
            `INSERT INTO results (student_id, exam_id, score, responses, status, start_time, submitted_time, 
                                  active_duration, created_at, updated_at) 
             VALUES (?, ?, ?, ?, 'completed', NOW(), NOW(), TIMESTAMPDIFF(MINUTE, NOW(), NOW()), NOW(), NOW())`,
            [studentId, examId, totalScore, JSON.stringify(responses)]
        );

        return totalScore;
    }

    static async getStudentResults(studentId) {
        const [results] = await db.query(
            `SELECT r.id, r.exam_id, e.exam_name, c.name AS course_name, r.score, r.status, r.start_time, 
                    r.submitted_time, r.active_duration, r.remark, r.comment
             FROM results r
             JOIN exams e ON r.exam_id = e.id
             JOIN courses c ON e.course_id = c.id
             WHERE r.student_id = ?`,
            [studentId]
        );
        return results;
    }

    static async getExamResults(examId) {
        const [results] = await db.query(
            `SELECT r.id, r.student_id, s.first_name, s.last_name, s.registration_number, r.score, r.status,
                    r.start_time, r.submitted_time, r.active_duration, r.remark, r.comment
             FROM results r
             JOIN students s ON r.student_id = s.id
             WHERE r.exam_id = ?`,
            [examId]
        );
        return results;
    }

    static async getDepartmentResults(departmentId) {
        const [results] = await db.query(
            `SELECT r.id, r.student_id, s.first_name, s.last_name, s.registration_number, e.exam_name, c.name AS course_name,
                    r.score, r.status, r.start_time, r.submitted_time, r.active_duration, r.remark, r.comment
             FROM results r
             JOIN students s ON r.student_id = s.id
             JOIN exams e ON r.exam_id = e.id
             JOIN courses c ON e.course_id = c.id
             WHERE s.department_id = ?`,
            [departmentId]
        );
        return results;
    }

    static async exportExamResultsToCSV(examId) {
        const results = await this.getExamResults(examId);
        if (!results.length) {
            throw new Error("No results found for this exam.");
        }

        const csv = parse(results);
        const filePath = `exports/exam_results_${examId}.csv`;
        fs.writeFileSync(filePath, csv);
        return filePath;
    }
}

module.exports = ResultProcessing;
