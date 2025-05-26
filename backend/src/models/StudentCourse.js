const db = require("../config/database");

class StudentCourse {
    static async getCoursesByStudent(studentId) {
        const [rows] = await db.query(
            `SELECT student_courses.id, student_courses.student_id, student_courses.course_id, 
                    courses.name AS course_name, courses.code, courses.credit_load 
             FROM student_courses
             JOIN courses ON student_courses.course_id = courses.id
             WHERE student_courses.student_id = ?`,
            [studentId]
        );
        return rows;
    }

    static async getStudentsByCourse(courseId) {
        const [rows] = await db.query(
            `SELECT student_courses.id, student_courses.student_id, students.first_name, students.last_name, 
                    students.registration_number, students.email, students.photo
             FROM student_courses
             JOIN students ON student_courses.student_id = students.id
             WHERE student_courses.course_id = ?`,
            [courseId]
        );
        return rows;
    }

    static async assignStudentToCourse(studentId, courseId) {
        const [result] = await db.query(
            "INSERT INTO student_courses (student_id, course_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
            [studentId, courseId]
        );
        return result.insertId;
    }

    static async removeStudentFromCourse(studentId, courseId) {
        await db.query("DELETE FROM student_courses WHERE student_id = ? AND course_id = ?", [studentId, courseId]);
    }

    static async removeAllCoursesByStudent(studentId) {
        await db.query("DELETE FROM student_courses WHERE student_id = ?", [studentId]);
    }
}

module.exports = StudentCourse;
