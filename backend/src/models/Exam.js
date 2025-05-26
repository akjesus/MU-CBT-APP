const db = require("../config/database");

class Exam {
    static async getAll() {
        const [rows] = await db.query(
            `SELECT exams.id, exams.course_id, courses.name AS course_name,courses.code AS course_code, 
                    exams.session_id, sessions.name AS session_name, levels.name AS course_level,
                    exams.semester, exams.level, exams.exam_name, 
                    exams.max_score_obtainable, exams.exam_mode, 
                    exams.start_time, exams.duration, exams.unit_of_time, 
                    exams.exam_date, exams.instruction, exams.venue, 
                    exams.server_time, exams.show_max_scores, exams.display_question_randomly, 
                    exams.allow_multiple_attempts, exams.is_public_access, exams.browser_warn_level, 
                    exams.farewell_message, exams.unordered_answering, exams.set_pass_mark, 
                    exams.pass_mark_value, exams.pass_mark_unit, exams.grade_with_points, 
                    exams.send_result_mail, exams.send_congratulatory_mail, 
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
    
    static async create(data) {
        const [result] = await db.query(
            `INSERT INTO exams (course_id, session_id, semester, level, exam_name, max_score_obtainable, 
                               exam_mode, start_time, duration, unit_of_time, exam_date, instruction, venue, 
                               server_time, show_max_scores, display_question_randomly, allow_multiple_attempts, 
                               is_public_access, browser_warn_level, farewell_message, unordered_answering, 
                               set_pass_mark, pass_mark_value, pass_mark_unit, grade_with_points, send_result_mail, 
                               send_congratulatory_mail, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                data.course_id, data.session_id, data.semester, data.level, data.exam_name, data.max_score_obtainable,
                data.exam_mode, data.start_time, data.duration, data.unit_of_time, data.exam_date, data.instruction, 
                data.venue, data.server_time, data.show_max_scores, data.display_question_randomly, 
                data.allow_multiple_attempts, data.is_public_access, data.browser_warn_level, data.farewell_message, 
                data.unordered_answering, data.set_pass_mark, data.pass_mark_value, data.pass_mark_unit, 
                data.grade_with_points, data.send_result_mail, data.send_congratulatory_mail
            ]
        );
        return result.insertId;
    }

    static async update(id, data) {
        await db.query(
            `UPDATE exams SET course_id = ?, session_id = ?, semester = ?, level = ?, exam_name = ?, 
                             max_score_obtainable = ?, exam_mode = ?, start_time = ?, duration = ?, 
                             unit_of_time = ?, exam_date = ?, instruction = ?, venue = ?, server_time = ?, 
                             show_max_scores = ?, display_question_randomly = ?, allow_multiple_attempts = ?, 
                             is_public_access = ?, browser_warn_level = ?, farewell_message = ?, 
                             unordered_answering = ?, set_pass_mark = ?, pass_mark_value = ?, 
                             pass_mark_unit = ?, grade_with_points = ?, send_result_mail = ?, 
                             send_congratulatory_mail = ?, updated_at = NOW() 
             WHERE id = ?`,
            [
                data.course_id, data.session_id, data.semester, data.level, data.exam_name, data.max_score_obtainable,
                data.exam_mode, data.start_time, data.duration, data.unit_of_time, data.exam_date, data.instruction, 
                data.venue, data.server_time, data.show_max_scores, data.display_question_randomly, 
                data.allow_multiple_attempts, data.is_public_access, data.browser_warn_level, data.farewell_message, 
                data.unordered_answering, data.set_pass_mark, data.pass_mark_value, data.pass_mark_unit, 
                data.grade_with_points, data.send_result_mail, data.send_congratulatory_mail, id
            ]
        );
    }

    static async delete(id) {
        await db.query("DELETE FROM exams WHERE id = ?", [id]);
    }
}

module.exports = Exam;
