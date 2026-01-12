const db = require("../config/database");

exports.getAttendance = async (req, res) => {
  try {
    let query = `SELECT 
           CONCAT(students.first_name, ' ', students.last_name) AS student_name, 
            students.registration_number AS registration_number,
            exams.exam_name AS exam_name,
            ip_address, login_timestamp, status
            FROM exam_attendance
            JOIN students ON exam_attendance.student_id = students.id
            JOIN exams ON exam_attendance.exam_id = exams.id`;

    const [attendanceRecords] = await db.query(query);
    res.json(attendanceRecords);
  } catch (err) {
    console.error("Get Attendance Error:", err);
    res.status(500).json({ error: err.message });
  } 
};
