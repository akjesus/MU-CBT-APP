const db = require("../config/database");
const bcrypt = require("bcrypt");

class Attendance {
    static async markAttendance(student_id, exam_id, ip_address,) {
        //check if student has already marked attendance for this exam
        const [rows] = await db.query(`SELECT * 
            FROM exam_attendance
            where student_id = ? AND exam_id = ?`, [student_id, exam_id] );
            if(rows.length > 0) {
                return null; // Attendance already marked
            }     
        const [result] = await db.query(
            `INSERT INTO exam_attendance (student_id, exam_id, ip_address,
             login_timestamp, created_at, updated_at)
             VALUES (?, ?, ?, NOW(), NOW(), NOW())`,
            [student_id, exam_id, ip_address]
        );
        return result.insertId;
    }
    static async getAllAttendance() {
        const [rows] = await db.query(`SELECT 
            CONCAT(students.first_name, ' ', students.last_name) AS student_name, 
            students.registration_number AS registration_number,
            departments.name AS department,
            exams.exam_name AS exam_name,exam_id,
            ip_address, login_timestamp, logout_timestamp, status
            FROM exam_attendance
            JOIN students ON exam_attendance.student_id = students.id
            JOIN exams ON exam_attendance.exam_id = exams.id
            JOIN departments ON students.department_id = departments.id`);
        return rows;
    }
    static async signOutStudent(student_id, exam_id) {
        //check if attendance record exists
        const [rows] = await db.query(`SELECT * 
            FROM exam_attendance
            where student_id = ? AND exam_id = ?`, [student_id, exam_id] );
        if(rows.length === 0) {
            return null; // No attendance record found
        }
        //if student has already signed out
        if(rows[0].status === 'submitted') {
            return null; // Already signed out
        }
        const [result] = await db.query(
            `UPDATE exam_attendance 
             SET status = 'submitted', logout_timestamp = NOW(), updated_at = NOW()
             WHERE student_id = ? AND exam_id = ?`,
            [student_id, exam_id]
        );
        return result;
    }
}

module.exports = Attendance;