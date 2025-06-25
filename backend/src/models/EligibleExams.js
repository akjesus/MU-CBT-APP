const db = require("../config/database");

class EligibleExams {
    static async getEligibleExams(studentId) {
        const [rows] = await db.query(
          `SELECT 
                e.id AS exam_id, 
                e.exam_name, 
                e.course_id, 
                c.name AS course_name, 
                e.start_time, 
                e.duration, 
                e.unit_of_time, 
                e.exam_date, 
                e.level, 
                e.instruction, 
                e.venue,
            ed.department_id
            FROM exam_departments ed
            LEFT JOIN exams e ON ed.exam_id = e.id
            LEFT JOIN students s2 ON RIGHT(ed.department_id, 1) = s2.level_id
            LEFT JOIN courses c ON e.course_id = c.id
            WHERE s2.id = ?  AND (ed.department_id >= '31' AND ed.department_id <= '36') AND NOW() >= TIMESTAMP(e.exam_date, e.start_time) 

            UNION 

            SELECT e.id AS exam_id, e.exam_name, e.course_id, c.name AS course_name, 
                                e.start_time, e.duration, e.unit_of_time, e.exam_date, 
                                e.level, e.instruction, e.venue, ed.department_id
                        FROM exam_departments ed
            LEFT JOIN exams e ON ed.exam_id = e.id
            LEFT JOIN  students s ON ed.department_id = (s.department_id) 
            LEFT JOIN courses c ON e.course_id = c.id
            LEFT JOIN carryover_courses co ON s.id = co.student_id
            WHERE s.id = ? AND (s.level_id = c.level_id OR co.student_id = ?) AND NOW() >= TIMESTAMP(e.exam_date, e.start_time) AND e.active = 1;
            `,
          [studentId, studentId, studentId]
        );

        return rows;
    }
}

module.exports = EligibleExams;
