const db = require("../config/database");

class CarryoverCourse {
    static async getCarryoverCoursesByStudent(studentId) {
        const [rows] = await db.query(
            `SELECT carryover_courses.id, carryover_courses.student_id, carryover_courses.course_id, 
                    courses.name AS course_name, courses.code, courses.credit_load 
             FROM carryover_courses
             JOIN courses ON carryover_courses.course_id = courses.id
             WHERE carryover_courses.student_id = ?`,
            [studentId]
        );
        return rows;
    }

    static async getStudentsByCarryoverCourse(courseId) {
        const [rows] = await db.query(
            `SELECT carryover_courses.id, carryover_courses.student_id, students.first_name, students.last_name, 
                    students.registration_number, students.email, students.photo
             FROM carryover_courses
             JOIN students ON carryover_courses.student_id = students.id
             WHERE carryover_courses.course_id = ?`,
            [courseId]
        );
        return rows;
    }

    static async assignCarryoverCourse(studentId, courseId) {
        const [result] = await db.query(
            "INSERT INTO carryover_courses (student_id, course_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
            [studentId, courseId]
        );
        return result.insertId;
    }

    static async removeCarryoverCourse(studentId, courseId) {
        await db.query("DELETE FROM carryover_courses WHERE student_id = ? AND course_id = ?", [studentId, courseId]);
    }

    static async removeAllCarryoversByStudent(studentId) {
        await db.query("DELETE FROM carryover_courses WHERE student_id = ?", [studentId]);
    }
}

module.exports = CarryoverCourse;
