const db = require("../config/database");

exports.getAttendance = async (req, res) => {
  try {
    let query = 
    `SELECT CONCAT(students.first_name, ' ', students.last_name) AS student_name, 
            students.registration_number AS registration_number,
            departments.name AS department,
            exams.exam_name AS exam_name, exam_id,
            ip_address, login_timestamp, stop_time, status
            FROM exam_attendance
            JOIN students ON exam_attendance.student_id = students.id
            JOIN departments ON students.department_id = departments.id
            JOIN exams ON exam_attendance.exam_id = exams.id`;

    const [attendanceRecords] = await db.query(query);
    res.json(attendanceRecords);
  } catch (err) {
    console.error("Get Attendance Error:", err);
    res.status(500).json({ error: err.message });
  } 
};


exports.markAttendance =  async(req, res)=> {
  try {
    const { student_id, exam_id, department_id, status } = req.body; 
    //check if already marked
    const [existing] = await db.query(
      `SELECT * FROM exam_attendance WHERE student_id = ? AND exam_id = ?`,
      [student_id, exam_id]
    );
    if (existing.length > 0) {
      return res.status(304).json({ error: "Attendance already marked for this student and exam." });
    }
    const sql = `INSERT INTO exam_attendance (student_id, exam_id, ip_address, department_id, status)
    VALUES (?, ?, ?, ?, ?)`;
    await db.query(sql, [student_id, exam_id, req.ip, department_id, status], (err, result) => {
      if (err) {
        console.error("Mark Attendance Error:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Attendance marked successfully", result });
    });
  }
  catch(err) {
console.log(err);
return;
}
};

exports.signAttendance = async(req, res) => {
  try {
  const { student_id, exam_id,status } = req.body; 
   //check if already signed in
    const [existing] = await db.query(
      `SELECT * FROM exam_attendance WHERE student_id = ? AND exam_id = ? AND status = 'submitted'`,
      [student_id, exam_id]
    );
    if (existing.length > 0) {
      return res.status(304).json({ error: "Attendance already marked for this student and exam." });
    }
    const query = 
    `UPDATE exam_attendance
    SET status = ?, stop_time = NOW()
    WHERE student_id = ? AND exam_id = ?`;
    await db.query(query, [status, student_id, exam_id], (err, result) => {
      if (err) {
        console.error("Sign Attendance Error:", err);
        return res.status(500).json({ error: err.message });
      }
  })}
  catch(error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }

}