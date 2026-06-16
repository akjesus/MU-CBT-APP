const db = require("../config/database");

exports.getAttendance = async (req, res) => {
  const { exam_id, session_id, semester, date } = req.query;
  try {
    const [attendanceRecords] = await db.query(
      `SELECT CONCAT(s.first_name, ' ', s.last_name) AS student_name, 
            s.registration_number AS registration_number,
            departments.name AS department,
            exams.exam_name AS exam_name, ea.status,  exam_id,
            ip_address, login_timestamp, stop_time
            FROM exam_attendance ea
            JOIN students s ON ea.student_id = s.id
            JOIN departments ON s.department_id = departments.id
            JOIN exams ON ea.exam_id = exams.id
            WHERE 1=1
            AND ea.exam_id = ?
            AND exams.session_id = ? 
            AND exams.semester = ? 
            AND DATE(exams.exam_date) = ?`,
      [exam_id, session_id, semester, date],
    );
    res.status(200).json({ success: true, attendanceRecords });
  } catch (err) {
    console.error("Get Attendance Error:", err);
    res.status(500).json({ error: err.message });
  }
};


exports.getTodaysAttendance = async (req, res) => {
  try {
    const [attendanceRecords] = await db.query(
      `SELECT CONCAT(s.first_name, ' ', s.last_name) AS student_name, 
            s.registration_number AS registration_number,
            departments.name AS department,
            exams.exam_name AS exam_name, ea.status,  exam_id,
            ip_address, login_timestamp, stop_time
            FROM exam_attendance ea
            JOIN students s ON ea.student_id = s.id
            JOIN departments ON s.department_id = departments.id
            JOIN exams ON ea.exam_id = exams.id
            WHERE 1=1
            AND DATE(exams.exam_date) = CURDATE()`,);
    res.status(200).json({ success: true, attendanceRecords });
  } catch (err) {
    console.error("Get Attendance Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { student_id, exam_id } = req.body;
    const [existing] = await db.query(
      `SELECT * FROM exam_attendance WHERE student_id = ? AND exam_id = ?`,
      [student_id, exam_id],
    );
    if (existing.length > 0) {
      return res.status(304).json({
        error: "Attendance already marked for this student and exam.",
      });
    }
    const sql = `INSERT INTO exam_attendance (student_id, exam_id, ip_address, status)
    VALUES (?, ?, ?, ?)`;
    await db.query(
      sql,
      [student_id, exam_id, req.ip, "present"],
      (err, result) => {
        if (err) {
          console.error("Mark Attendance Error:", err);
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Attendance marked successfully", result });
      },
    );
  } catch (err) {
    console.log(err);
    return;
  }
};

exports.signAttendance = async (req, res) => {
  try {
    const { student_id, exam_id } = req.body;
    //check if already signed in
    const [existing] = await db.query(
      `SELECT * FROM exam_attendance WHERE student_id = ? AND exam_id = ? AND status = 'submitted'`,
      [student_id, exam_id],
    );
    if (existing.length > 0) {
      return res.status(304).json({
        error: "Attendance already marked for this student and exam.",
      });
    }
    const query = `UPDATE exam_attendance
    SET status = ?, stop_time = NOW()
    WHERE student_id = ? AND exam_id = ?`;
    await db.query(query, ["submitted", student_id, exam_id], (err, result) => {
      if (err) {
        console.error("Sign Attendance Error:", err);
        return res.status(500).json({ error: err.message });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};
